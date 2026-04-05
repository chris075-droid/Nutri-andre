"use client";
import { useState, useEffect, useRef } from "react";
import { C, grad, POOL, STAGE_DESC, MEAL_SLOTS } from "@/lib/constants";
import { callModel } from "@/lib/api-ai";
import DB from "@/lib/storage";

// Fix truncated JSON from AI responses
function fixJSON(str) {
  let s = str;
  // Remove trailing incomplete key-value pairs (e.g. ,"dish":"Puré de lente)
  s = s.replace(/,\s*"[^"]*":\s*"[^"]*$/, "");
  s = s.replace(/,\s*"[^"]*":\s*$/, "");
  s = s.replace(/,\s*"[^"]*$/, "");
  s = s.replace(/,\s*$/, "");
  // Close open strings
  const dq = (s.match(/"/g) || []).length;
  if (dq % 2 !== 0) s += '"';
  // Close brackets and braces
  const opens = (s.match(/\[/g)||[]).length - (s.match(/\]/g)||[]).length;
  const braces = (s.match(/\{/g)||[]).length - (s.match(/\}/g)||[]).length;
  for (let x=0;x<opens;x++) s+="]";
  for (let x=0;x<braces;x++) s+="}";
  return s;
}

function safeParseJSON(raw) {
  const clean = raw.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch {}
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found");
  try { return JSON.parse(match[0]); } catch {}
  return JSON.parse(fixJSON(match[0]));
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function fmtDate(d) {
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function getWeekKey() {
  const d = new Date();
  return `na-plan-week-${d.toISOString().split("T")[0]}`;
}
function getDayKey() {
  return `na-plan-day-${new Date().toISOString().split("T")[0]}`;
}

// Genera un plan local mezclando POOL
function buildLocalPlan(stage, days, slots) {
  const pool = POOL[stage] || POOL.toddler;
  if (!pool || pool.length === 0) return days.map(d => ({ ...d, meals: slots.map(s => ({ ...s, dish: "Leche materna", emoji: "🤱", tag: "Alimentación exclusiva", portion: "A demanda" })) }));

  let idx = 0;
  return days.map(d => ({
    ...d,
    meals: slots.map(s => {
      const item = pool[idx % pool.length];
      idx++;
      return { ...s, dish: item.dish, emoji: item.emoji, tag: item.tag, portion: "Porción adecuada para su edad" };
    }),
  }));
}

// Prompt para plan semanal
function weekPrompt(name, ageLabel, stage, stageDesc, days, slots) {
  const dayNames = days.map(d => d.dayName).join(", ");
  const mealTypes = slots.map(s => s.label).join(", ");
  return `Genera un plan semanal nutritivo para ${name} (${ageLabel}, etapa: ${stageDesc}).
Días: ${dayNames}. Comidas por día: ${mealTypes}.
Considera variedad, equilibrio nutricional y alimentos apropiados para su edad.
Responde SOLO JSON válido sin texto extra:
{"days":[{"dayName":"...","meals":[{"type":"...","label":"...","hour":"...","dish":"...","emoji":"...","tag":"...","portion":"..."}]}]}`;
}

// Prompt para plan diario
function dayPrompt(name, ageLabel, stage, stageDesc, dayName, slots) {
  const mealTypes = slots.map(s => `${s.label} (${s.hour})`).join(", ");
  return `Genera un plan detallado de comidas para HOY (${dayName}) para ${name} (${ageLabel}, etapa: ${stageDesc}).
Horarios: ${mealTypes}.
Incluye platillos específicos, porciones detalladas y notas nutricionales.
Responde SOLO JSON válido sin texto extra:
{"meals":[{"type":"...","label":"...","hour":"...","dish":"...","emoji":"...","tag":"...","portion":"...","notes":"..."}]}`;
}

export default function PlanTab({ profile, age, useSonnet }) {
  const [subTab, setSubTab] = useState("week");
  const [weekPlan, setWeekPlan] = useState(null);
  const [dayPlan, setDayPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Meal expand & recipe state
  const [expanded, setExpanded] = useState(null); // "dayIdx-mealIdx"
  const [recipeCache, setRecipeCache] = useState({}); // { "dish-name": {ingredientes, pasos, ...} }
  const [recipeLoading, setRecipeLoading] = useState(null); // "dayIdx-mealIdx"
  const [shuffleLoading, setShuffleLoading] = useState(null); // "dayIdx-mealIdx"

  // Confirm & shopping list
  const [weekConfirmedAt, setWeekConfirmedAt] = useState(null); // ISO date string
  const [dayConfirmedAt, setDayConfirmedAt] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmProgress, setConfirmProgress] = useState("");

  const name = profile?.name || "André";
  const stage = age?.stage || "toddler";
  const ageLabel = age?.label || "1-2 años";
  const stageDesc = STAGE_DESC[stage] || "transición familiar";
  const slots = MEAL_SLOTS[stage] || MEAL_SLOTS.toddler;
  const now = new Date();

  // Verificar si el periodo de confirmación sigue activo
  const isWeekLocked = () => {
    if (!weekConfirmedAt) return false;
    const diff = Date.now() - new Date(weekConfirmedAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000; // 7 días
  };
  const isDayLocked = () => {
    if (!dayConfirmedAt) return false;
    const confirmed = new Date(dayConfirmedAt).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    return confirmed === today; // Mismo día
  };
  const weekConfirmed = isWeekLocked();
  const dayConfirmed = isDayLocked();

  // Cargar planes y recetas guardadas (con expiración de 6 meses)
  useEffect(() => {
    const w = DB.get(getWeekKey()); if (w) setWeekPlan(w);
    const d = DB.get(getDayKey()); if (d) setDayPlan(d);
    const wc = DB.get("na-confirm-week"); if (wc) setWeekConfirmedAt(wc);
    const dc = DB.get("na-confirm-day"); if (dc) setDayConfirmedAt(dc);
    // Caché de recetas: expira cada 6 meses para adaptarse a la etapa de André
    const SIX_MONTHS = 180 * 24 * 60 * 60 * 1000;
    const rcMeta = DB.get("na-plan-recipes-meta");
    const rc = DB.get("na-plan-recipes");
    if (rcMeta?.createdAt && (Date.now() - new Date(rcMeta.createdAt).getTime()) > SIX_MONTHS) {
      // Expirado: limpiar caché para renovar recetas según nueva etapa
      DB.set("na-plan-recipes", null);
      DB.set("na-plan-recipes-meta", { createdAt: new Date().toISOString() });
      setRecipeCache({});
    } else {
      if (rc) setRecipeCache(rc);
      if (!rcMeta) DB.set("na-plan-recipes-meta", { createdAt: new Date().toISOString() });
    }
  }, []);

  // Generar 7 días desde hoy
  const buildDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      days.push({ date: d.toISOString().split("T")[0], dayName: DAY_NAMES[d.getDay()] });
    }
    return days;
  };

  // ── Buscar receta de UNA comida específica ──
  const fetchMealRecipe = async (dayIdx, mealIdx) => {
    const key = `${dayIdx}-${mealIdx}`;
    const meal = weekPlan?.days?.[dayIdx]?.meals?.[mealIdx];
    if (!meal) return;
    // Check cache first
    const cacheKey = meal.dish.toLowerCase().trim();
    if (recipeCache[cacheKey]) return; // Already cached
    setRecipeLoading(key);
    try {
      const raw = await callModel({
        messages: [{ role: "user", content: `Receta corta para bebé/niño (${ageLabel}, ${stageDesc}): "${meal.dish}". Máximo 5 ingredientes y 4 pasos. Incluye información nutricional estimada. SOLO JSON compacto: {"ingredientes":[{"nombre":"...","cantidad":"...","emoji":"..."}],"pasos":[{"numero":1,"instruccion":"...","tiempo":"..."}],"nutricion":{"calorias":150,"proteinas":"6g","carbohidratos":"18g","grasas":"4g","fibra":"2g","hierro":"1.5mg","calcio":"80mg"},"tips":["..."]}` }],
        system: "Responde ÚNICAMENTE con JSON válido. Sé breve y conciso. Sin texto extra, sin backticks.",
        maxTokens: 1200,
        useSonnet,
      });
      const parsed = safeParseJSON(raw);
      const updated = { ...recipeCache, [cacheKey]: parsed };
      setRecipeCache(updated);
      DB.set("na-plan-recipes", updated);
    } catch (e) {
      console.error("Error fetching recipe:", e);
    } finally {
      setRecipeLoading(null);
    }
  };

  // ── Rebarajear UNA comida específica ──
  const shuffleMeal = async (dayIdx, mealIdx) => {
    const key = `${dayIdx}-${mealIdx}`;
    const meal = weekPlan?.days?.[dayIdx]?.meals?.[mealIdx];
    if (!meal) return;
    setShuffleLoading(key);
    try {
      const raw = await callModel({
        messages: [{ role: "user", content: `Sugiere UN platillo alternativo para ${meal.label} de un niño de ${ageLabel} (etapa: ${stageDesc}). Debe ser diferente a "${meal.dish}". SOLO JSON: {"dish":"...","emoji":"...","tag":"...","portion":"..."}` }],
        system: "Responde ÚNICAMENTE con JSON válido. Sin texto extra, sin backticks.",
        maxTokens: 200,
        useSonnet: false, // Siempre Haiku para shuffle (es simple)
      });
      const parsed = safeParseJSON(raw);
      const updatedPlan = { ...weekPlan };
      updatedPlan.days = updatedPlan.days.map((d, di) => di !== dayIdx ? d : {
        ...d,
        meals: d.meals.map((m, mi) => mi !== mealIdx ? m : { ...m, ...parsed }),
      });
      setWeekPlan(updatedPlan);
      DB.set(getWeekKey(), updatedPlan);
    } catch (e) {
      console.error("Error shuffling meal:", e);
    } finally {
      setShuffleLoading(null);
    }
  };

  // ── Buscar receta de UNA comida del plan DIARIO ──
  const fetchDayMealRecipe = async (mealIdx) => {
    const key = `day-${mealIdx}`;
    const meal = dayPlan?.meals?.[mealIdx];
    if (!meal) return;
    const cacheKey = meal.dish.toLowerCase().trim();
    if (recipeCache[cacheKey]) return;
    setRecipeLoading(key);
    try {
      const raw = await callModel({
        messages: [{ role: "user", content: `Receta corta para bebé/niño (${ageLabel}, ${stageDesc}): "${meal.dish}". Máximo 5 ingredientes y 4 pasos. Incluye información nutricional estimada. SOLO JSON compacto: {"ingredientes":[{"nombre":"...","cantidad":"...","emoji":"..."}],"pasos":[{"numero":1,"instruccion":"...","tiempo":"..."}],"nutricion":{"calorias":150,"proteinas":"6g","carbohidratos":"18g","grasas":"4g","fibra":"2g","hierro":"1.5mg","calcio":"80mg"},"tips":["..."]}` }],
        system: "Responde ÚNICAMENTE con JSON válido. Sé breve y conciso. Sin texto extra, sin backticks.",
        maxTokens: 1200,
        useSonnet,
      });
      const parsed = safeParseJSON(raw);
      const updated = { ...recipeCache, [cacheKey]: parsed };
      setRecipeCache(updated);
      DB.set("na-plan-recipes", updated);
    } catch (e) { console.error("Error fetching day recipe:", e); }
    finally { setRecipeLoading(null); }
  };

  // ── Rebarajear UNA comida del plan DIARIO ──
  const shuffleDayMeal = async (mealIdx) => {
    const key = `day-${mealIdx}`;
    const meal = dayPlan?.meals?.[mealIdx];
    if (!meal) return;
    setShuffleLoading(key);
    try {
      const raw = await callModel({
        messages: [{ role: "user", content: `Sugiere UN platillo alternativo para ${meal.label} de un niño de ${ageLabel} (etapa: ${stageDesc}). Debe ser diferente a "${meal.dish}". SOLO JSON: {"dish":"...","emoji":"...","tag":"...","portion":"..."}` }],
        system: "Responde ÚNICAMENTE con JSON válido. Sin texto extra, sin backticks.",
        maxTokens: 200,
        useSonnet: false,
      });
      const parsed = safeParseJSON(raw);
      const updatedPlan = { ...dayPlan, meals: dayPlan.meals.map((m, mi) => mi !== mealIdx ? m : { ...m, ...parsed }) };
      setDayPlan(updatedPlan);
      DB.set(getDayKey(), updatedPlan);
    } catch (e) { console.error("Error shuffling day meal:", e); }
    finally { setShuffleLoading(null); }
  };

  // ── Buscar receta por nombre (para confirmar en batch) ──
  const fetchRecipeByDish = async (dish, currentCache) => {
    const cacheKey = dish.toLowerCase().trim();
    if (currentCache[cacheKey]) return currentCache;
    const raw = await callModel({
      messages: [{ role: "user", content: `Receta corta para bebé/niño (${ageLabel}, ${stageDesc}): "${dish}". Máximo 5 ingredientes y 4 pasos. Incluye información nutricional estimada. SOLO JSON compacto: {"ingredientes":[{"nombre":"...","cantidad":"...","emoji":"..."}],"pasos":[{"numero":1,"instruccion":"...","tiempo":"..."}],"nutricion":{"calorias":150,"proteinas":"6g","carbohidratos":"18g","grasas":"4g","fibra":"2g","hierro":"1.5mg","calcio":"80mg"},"tips":["..."]}` }],
      system: "Responde ÚNICAMENTE con JSON válido. Sé breve y conciso. Sin texto extra, sin backticks.",
      maxTokens: 1200,
      useSonnet,
    });
    let parsed;
    try { parsed = safeParseJSON(raw); } catch { return currentCache; }
    return { ...currentCache, [cacheKey]: parsed };
  };

  // ── Sumar cantidades inteligentemente ──
  const sumQuantities = (cantidades) => {
    if (cantidades.length === 1) return cantidades[0];
    // Agrupar por unidad
    const groups = {}; // { "cucharada": 3, "taza": 1.5, "": 2 }
    const noParseables = [];
    cantidades.forEach(c => {
      const str = String(c).toLowerCase().trim();
      // Intentar extraer número y unidad: "2 cucharadas", "1/2 taza", "100g", "al gusto"
      const match = str.match(/^([\d.,/]+)\s*(.*)/);
      if (match) {
        let num = match[1];
        // Manejar fracciones: "1/2" -> 0.5
        if (num.includes("/")) {
          const parts = num.split("/");
          num = parseFloat(parts[0]) / parseFloat(parts[1]);
        } else {
          num = parseFloat(num.replace(",", "."));
        }
        if (!isNaN(num)) {
          // Normalizar unidad: "cucharadas" -> "cucharada", "tazas" -> "taza"
          let unit = match[2].trim()
            .replace(/^(cucharadas|cdas)$/i, "cucharada")
            .replace(/^(cucharaditas|cdtas)$/i, "cucharadita")
            .replace(/^tazas$/i, "taza")
            .replace(/^unidades$/i, "unidad")
            .replace(/^rebanadas$/i, "rebanada")
            .replace(/^rodajas$/i, "rodaja")
            .replace(/^pizcas$/i, "pizca")
            .replace(/^piezas$/i, "pieza")
            .replace(/^gramos$/i, "g")
            .replace(/^mililitros$/i, "ml");
          if (!groups[unit]) groups[unit] = 0;
          groups[unit] += num;
          return;
        }
      }
      noParseables.push(c);
    });
    // Construir resultado
    const parts = [];
    Object.entries(groups).forEach(([unit, total]) => {
      const formatted = total % 1 === 0 ? String(total) : total.toFixed(1).replace(/\.0$/, "");
      // Pluralizar
      let u = unit;
      if (total > 1 && u && !u.match(/[gml]$/i)) {
        if (u.endsWith("a")) u = u + "s";
        else if (u === "unidad") u = "unidades";
      }
      parts.push(u ? `${formatted} ${u}` : formatted);
    });
    if (noParseables.length > 0) parts.push(...noParseables);
    return parts.join(" + ") || cantidades.join(" + ");
  };

  // ── Consolidar ingredientes sumando cantidades ──
  const buildShoppingList = (meals, cache) => {
    const map = {};
    meals.forEach(meal => {
      const recipe = cache[meal.dish.toLowerCase().trim()];
      if (!recipe?.ingredientes) return;
      recipe.ingredientes.forEach(ing => {
        const key = ing.nombre.toLowerCase().trim();
        if (!map[key]) map[key] = { nombre: ing.nombre, emoji: ing.emoji || "•", cantidades: [] };
        map[key].cantidades.push(ing.cantidad);
      });
    });
    return Object.values(map).map(item => ({
      nombre: item.nombre,
      emoji: item.emoji,
      cantidad: sumQuantities(item.cantidades),
      checked: false,
    }));
  };

  // ── Confirmar plan (descargar todas las recetas + generar lista) ──
  // ── Confirmar plan (background — no bloquea navegación) ──
  const confirmingRef = useRef(false);
  const confirmPlan = (type) => {
    if (confirmingRef.current) return;
    const meals = type === "week"
      ? (weekPlan?.days?.flatMap(d => d.meals) || [])
      : (dayPlan?.meals || []);
    if (meals.length === 0) return;
    confirmingRef.current = true;
    setConfirmLoading(true);
    DB.set(`na-confirming-${type}`, true);

    // Ejecutar en background (no await — libre de navegar)
    (async () => {
      let updatedCache = DB.get("na-plan-recipes") || {};
      const uniqueDishes = [...new Set(meals.map(m => m.dish))];
      for (let i = 0; i < uniqueDishes.length; i++) {
        const dish = uniqueDishes[i];
        const cacheKey = dish.toLowerCase().trim();
        if (updatedCache[cacheKey]) {
          setConfirmProgress(`✓ ${i + 1}/${uniqueDishes.length} — ${dish}`);
          continue;
        }
        setConfirmProgress(`⏳ ${i + 1}/${uniqueDishes.length} — ${dish}`);
        try {
          updatedCache = await fetchRecipeByDish(dish, updatedCache);
          // Guardar progreso parcial en cada paso
          DB.set("na-plan-recipes", updatedCache);
        } catch (e) { console.error(`Error fetching ${dish}:`, e); }
      }
      setRecipeCache(updatedCache);
      DB.set("na-plan-recipes", updatedCache);
      const list = buildShoppingList(meals, updatedCache);
      const storageKey = type === "week" ? "na-shopping-week" : "na-shopping-day";
      DB.set(storageKey, list);
      const ts = new Date().toISOString();
      if (type === "week") { setWeekConfirmedAt(ts); DB.set("na-confirm-week", ts); }
      else { setDayConfirmedAt(ts); DB.set("na-confirm-day", ts); }
      DB.set(`na-confirming-${type}`, null);
      confirmingRef.current = false;
      setConfirmLoading(false);
      setConfirmProgress("");
    })();
  };

  // Verificar si hay descarga en progreso al montar
  useEffect(() => {
    const wFlag = DB.get("na-confirming-week");
    const dFlag = DB.get("na-confirming-day");
    if (wFlag) { setConfirmLoading(true); setConfirmProgress("⏳ Descarga en progreso (semanal)..."); }
    if (dFlag) { setConfirmLoading(true); setConfirmProgress("⏳ Descarga en progreso (diario)..."); }
  }, []);

  const generateWeekPlan = async () => {
    setLoading(true); setError(null); setWeekConfirmedAt(null); DB.set("na-confirm-week", null); DB.set("na-shopping-week", null);
    try {
      const days = buildDays();
      const prevDishes = weekPlan?.days?.flatMap(d => d.meals?.map(m => m.dish)).filter(Boolean) || [];
      const excludeText = prevDishes.length > 0 ? ` NO repitas estos platillos: ${[...new Set(prevDishes)].join(", ")}.` : "";
      const dayNames = days.map(d => d.dayName).join(", ");
      const mealTypes = slots.map(s => s.label).join(", ");

      const prompt = `Genera un plan semanal nutritivo para ${name} (${ageLabel}, etapa: ${stageDesc}).
Días: ${dayNames}. Comidas por día: ${mealTypes}.
Cada comida debe corresponder a su categoría (desayuno=desayuno, comida=comida, merienda=merienda, cena=cena). Variedad entre días, no repetir el mismo platillo.${excludeText}
Responde SOLO JSON válido sin texto extra:
{"days":[{"dayName":"...","meals":[{"type":"...","label":"...","hour":"...","dish":"...","emoji":"...","tag":"...","portion":"..."}]}]}`;

      const raw = await callModel({
        messages: [{ role: "user", content: prompt }],
        system: "Eres experto en nutrición infantil. Responde ÚNICAMENTE con JSON válido. Sin texto extra, sin backticks. Genera platillos DIFERENTES y variados cada vez.",
        maxTokens: 3000,
        useSonnet,
      });
      const parsed = safeParseJSON(raw);
      const plan = {
        generatedAt: new Date().toISOString(), stage, ageLabel, model: useSonnet ? "sonnet" : "haiku",
        days: parsed.days.map((d, i) => ({ ...days[i], ...d })),
      };
      setWeekPlan(plan);
      DB.set(getWeekKey(), plan);
    } catch (e) {
      setError(e.message || "Error al generar el plan");
    } finally {
      setLoading(false);
    }
  };

  const generateDayPlan = async () => {
    setLoading(true); setError(null); setDayConfirmedAt(null); DB.set("na-confirm-day", null); DB.set("na-shopping-day", null);
    try {
      const dayName = DAY_NAMES[now.getDay()];
      const prevDishes = dayPlan?.meals?.map(m => m.dish).filter(Boolean) || [];
      const excludeText = prevDishes.length > 0 ? ` NO repitas estos platillos: ${prevDishes.join(", ")}.` : "";
      const mealTypes = slots.map(s => `${s.label} (${s.hour})`).join(", ");

      const prompt = `Genera un plan de comidas para HOY (${dayName}) para ${name} (${ageLabel}, etapa: ${stageDesc}).
Horarios: ${mealTypes}.
Cada comida debe corresponder a su categoría (desayuno=desayuno, comida=comida, etc). Platillos variados y nutritivos.${excludeText}
Responde SOLO JSON válido sin texto extra:
{"meals":[{"type":"...","label":"...","hour":"...","dish":"...","emoji":"...","tag":"...","portion":"...","notes":"..."}]}`;

      const raw = await callModel({
        messages: [{ role: "user", content: prompt }],
        system: "Eres experto en nutrición infantil. Responde ÚNICAMENTE con JSON válido. Sin texto extra, sin backticks. Genera platillos DIFERENTES y variados cada vez.",
        maxTokens: 1000,
        useSonnet,
      });
      const parsed = safeParseJSON(raw);
      const plan = {
        generatedAt: new Date().toISOString(), stage, ageLabel, model: useSonnet ? "sonnet" : "haiku",
        date: now.toISOString().split("T")[0], dayName, meals: parsed.meals,
      };
      setDayPlan(plan);
      DB.set(getDayKey(), plan);
    } catch (e) {
      setError(e.message || "Error al generar el plan");
    } finally {
      setLoading(false);
    }
  };

  const pill = (active) => ({
    flex: 1, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer",
    fontWeight: 800, fontSize: 12, fontFamily: "'Nunito',sans-serif",
    background: active ? grad : C.light, color: active ? "#fff" : C.mid,
    transition: "all .2s",
  });

  const cardS = {
    background: C.card, borderRadius: 16, padding: "14px 16px", marginBottom: 10,
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  };

  // Componente reutilizable para receta expandida
  const RecipeDetail = ({ recipe: r }) => r ? (
    <div style={{ background: C.light, borderRadius: 12, padding: 12 }}>
      {r.ingredientes && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>🧾 Ingredientes</div>
          {r.ingredientes.map((ing, k) => (
            <div key={k} style={{ fontSize: 12, color: C.text, padding: "2px 0", display: "flex", gap: 6 }}>
              <span>{ing.emoji || "•"}</span>
              <span><b>{ing.nombre}</b> — {ing.cantidad}</span>
            </div>
          ))}
        </>
      )}
      {r.pasos && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: "uppercase", letterSpacing: 0.5, margin: "10px 0 6px" }}>📝 Preparación</div>
          {r.pasos.map((paso, k) => (
            <div key={k} style={{ fontSize: 12, color: C.text, padding: "3px 0", display: "flex", gap: 6 }}>
              <span style={{ fontWeight: 800, color: C.primary, flexShrink: 0 }}>{paso.numero}.</span>
              <span>{paso.instruccion} {paso.tiempo ? <span style={{ color: C.soft, fontSize: 10 }}>({paso.tiempo})</span> : ""}</span>
            </div>
          ))}
        </>
      )}
      {r.nutricion && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, textTransform: "uppercase", letterSpacing: 0.5, margin: "10px 0 6px" }}>🔥 Contenido Energético</div>
          <div style={{ background: C.card, borderRadius: 10, padding: 10, border: `1px solid ${C.orange}22` }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🔥</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: C.orange }}>{r.nutricion.calorias} kcal</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {[
                { label: "Proteína", val: r.nutricion.proteinas, color: "#E53935", emoji: "🥩" },
                { label: "Carbos", val: r.nutricion.carbohidratos, color: "#FB8C00", emoji: "🌾" },
                { label: "Grasas", val: r.nutricion.grasas, color: "#FDD835", emoji: "🫒" },
              ].map((m, k) => (
                <div key={k} style={{ textAlign: "center", background: `${m.color}10`, borderRadius: 8, padding: "6px 4px" }}>
                  <div style={{ fontSize: 14 }}>{m.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: m.color }}>{m.val}</div>
                  <div style={{ fontSize: 9, color: C.mid, fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
              {[
                { label: "Fibra", val: r.nutricion.fibra, emoji: "🌿" },
                { label: "Hierro", val: r.nutricion.hierro, emoji: "🩸" },
                { label: "Calcio", val: r.nutricion.calcio, emoji: "🦴" },
              ].map((m, k) => (
                <div key={k} style={{ textAlign: "center", background: `${C.primary}08`, borderRadius: 8, padding: "6px 4px" }}>
                  <div style={{ fontSize: 12 }}>{m.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{m.val}</div>
                  <div style={{ fontSize: 9, color: C.mid, fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {r.tips && r.tips.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: 0.5, margin: "10px 0 6px" }}>💡 Tips</div>
          {r.tips.map((t, k) => (
            <div key={k} style={{ fontSize: 11, color: C.mid, padding: "2px 0" }}>• {t}</div>
          ))}
        </>
      )}
    </div>
  ) : null;

  return (
    <div style={{ padding: "0 16px 20px" }}>
      {/* Fecha actual */}
      <div style={{ fontSize: 11, color: C.mid, textAlign: "center", marginBottom: 12, fontWeight: 600, textTransform: "capitalize" }}>
        {fmtDate(now)} · {now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: C.light, borderRadius: 14, padding: 4 }}>
        <button onClick={() => setSubTab("week")} style={pill(subTab === "week")}>📅 Plan Semanal</button>
        <button onClick={() => setSubTab("day")} style={pill(subTab === "day")}>🍽 Plan Diario</button>
      </div>

      {/* Info de André */}
      <div style={{ ...cardS, display: "flex", alignItems: "center", gap: 10, borderLeft: `4px solid ${C.primary}` }}>
        <span style={{ fontSize: 24 }}>👶</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{name}</div>
          <div style={{ fontSize: 11, color: C.mid }}>{ageLabel} · {stageDesc}</div>
        </div>
        <div style={{ marginLeft: "auto", background: useSonnet ? "rgba(255,179,0,0.15)" : `${C.primary}15`, borderRadius: 8, padding: "4px 8px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: useSonnet ? C.orange : C.primary }}>{useSonnet ? "✨ Sonnet" : "⚡ Haiku"}</span>
        </div>
      </div>

      {error && (
        <div style={{ ...cardS, borderLeft: `4px solid ${C.red}`, background: `${C.red}08`, color: C.red, fontSize: 12, fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ═══════ PLAN SEMANAL ═══════ */}
      {subTab === "week" && (
        <>
          <button onClick={generateWeekPlan} disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: loading ? C.soft : grad,
              color: "#fff", fontSize: 14, fontWeight: 800, cursor: loading ? "wait" : "pointer",
              fontFamily: "'Nunito',sans-serif", marginBottom: 16, boxShadow: "0 4px 16px rgba(41,182,246,0.3)" }}>
            {loading ? "⏳ Generando plan..." : weekPlan ? "🔄 Regenerar Plan Semanal" : "📅 Generar Plan Semanal"}
          </button>

          {weekPlan && weekPlan.days?.map((day, i) => {
            const isToday = day.date === now.toISOString().split("T")[0];
            return (
              <div key={i} style={{ ...cardS, borderLeft: `4px solid ${isToday ? C.primary : C.accent}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 14, color: isToday ? C.primary : C.text }}>{day.dayName}</span>
                    {isToday && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: C.primary, background: `${C.primary}15`, borderRadius: 6, padding: "2px 6px" }}>HOY</span>}
                  </div>
                  <span style={{ fontSize: 11, color: C.soft }}>{day.date}</span>
                </div>
                {day.meals?.map((meal, j) => {
                  const mealKey = `${i}-${j}`;
                  const isExpanded = expanded === mealKey;
                  const cacheKey = meal.dish.toLowerCase().trim();
                  const cachedRecipe = recipeCache[cacheKey];
                  const isRecipeLoading = recipeLoading === mealKey;
                  const isShuffleLoading = shuffleLoading === mealKey;
                  return (
                    <div key={j} style={{ borderTop: j > 0 ? `1px solid ${C.accent}44` : "none" }}>
                      <div onClick={() => setExpanded(isExpanded ? null : mealKey)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer" }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{meal.emoji || "🍽"}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{meal.dish}</span>
                            {cachedRecipe?.nutricion && <span style={{ fontSize: 10, fontWeight: 700, color: C.orange, background: `${C.orange}15`, borderRadius: 6, padding: "1px 5px", flexShrink: 0 }}>🔥 {cachedRecipe.nutricion.calorias} kcal</span>}
                          </div>
                          <div style={{ fontSize: 10, color: C.mid }}>{meal.label} · {meal.hour} {meal.tag ? `· ${meal.tag}` : ""}</div>
                        </div>
                        <span style={{ fontSize: 12, color: C.soft, transition: "transform .2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                      </div>
                      {isExpanded && (
                        <div style={{ padding: "4px 0 10px 34px" }}>
                          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                            <button onClick={(e) => { e.stopPropagation(); fetchMealRecipe(i, j); }} disabled={isRecipeLoading}
                              style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1.5px solid ${C.primary}44`, background: cachedRecipe ? `${C.primary}10` : C.card,
                                color: C.primary, fontSize: 11, fontWeight: 700, cursor: isRecipeLoading ? "wait" : "pointer", fontFamily: "'Nunito',sans-serif" }}>
                              {isRecipeLoading ? "⏳ Buscando..." : cachedRecipe ? "📖 Ver preparación" : "👨‍🍳 Preparación"}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); shuffleMeal(i, j); }} disabled={isShuffleLoading}
                              style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1.5px solid ${C.orange}44`, background: C.card,
                                color: C.orange, fontSize: 11, fontWeight: 700, cursor: isShuffleLoading ? "wait" : "pointer", fontFamily: "'Nunito',sans-serif" }}>
                              {isShuffleLoading ? "⏳ Cambiando..." : "🔀 Rebarajear"}
                            </button>
                          </div>
                          {cachedRecipe && <RecipeDetail recipe={cachedRecipe} />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {weekPlan && !weekConfirmed && (
            <button onClick={() => confirmPlan("week")} disabled={confirmLoading}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none",
                background: confirmLoading ? C.soft : `linear-gradient(135deg,${C.green},#00897B)`,
                color: "#fff", fontSize: 14, fontWeight: 800, cursor: confirmLoading ? "wait" : "pointer",
                fontFamily: "'Nunito',sans-serif", marginTop: 8, marginBottom: 8,
                boxShadow: `0 4px 16px rgba(38,198,161,0.3)` }}>
              {confirmLoading ? `⏳ ${confirmProgress || "Preparando..."}` : "👌 Confirmado"}
            </button>
          )}

          {weekPlan && weekConfirmed && (
            <div style={{ width: "100%", padding: "14px", borderRadius: 14, border: `2px solid ${C.green}`,
              background: `${C.green}15`, textAlign: "center", marginTop: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.green, fontFamily: "'Nunito',sans-serif" }}>✅ Confirmado</span>
              <div style={{ fontSize: 11, color: C.mid, marginTop: 4 }}>Lista de compras generada en Listado → Semanal</div>
            </div>
          )}

          {weekPlan && (
            <div style={{ fontSize: 10, color: C.soft, textAlign: "center", marginTop: 4 }}>
              Generado: {new Date(weekPlan.generatedAt).toLocaleString("es-MX")} · {weekPlan.model}
            </div>
          )}
        </>
      )}

      {/* ═══════ PLAN DIARIO ═══════ */}
      {subTab === "day" && (
        <>
          <button onClick={generateDayPlan} disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: loading ? C.soft : grad,
              color: "#fff", fontSize: 14, fontWeight: 800, cursor: loading ? "wait" : "pointer",
              fontFamily: "'Nunito',sans-serif", marginBottom: 16, boxShadow: "0 4px 16px rgba(41,182,246,0.3)" }}>
            {loading ? "⏳ Generando plan..." : dayPlan ? "🔄 Regenerar Plan de Hoy" : "🍽 Generar Plan de Hoy"}
          </button>

          {dayPlan && (
            <>
              <div style={{ ...cardS, borderLeft: `4px solid ${C.primary}` }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.primary, marginBottom: 12 }}>
                  {dayPlan.dayName} — Plan de {name}
                </div>
                {dayPlan.meals?.map((meal, j) => {
                  const mealKey = `day-${j}`;
                  const isExpanded = expanded === mealKey;
                  const cacheKey = meal.dish.toLowerCase().trim();
                  const cachedRecipe = recipeCache[cacheKey];
                  const isRecipeLoading = recipeLoading === mealKey;
                  const isShuffleLoading = shuffleLoading === mealKey;
                  return (
                    <div key={j} style={{ borderTop: j > 0 ? `1px solid ${C.accent}44` : "none" }}>
                      <div onClick={() => setExpanded(isExpanded ? null : mealKey)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", cursor: "pointer" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                          {meal.emoji || "🍽"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: 800, fontSize: 12, color: C.primary, textTransform: "uppercase", letterSpacing: 0.5 }}>{meal.label}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {cachedRecipe?.nutricion && <span style={{ fontSize: 10, fontWeight: 700, color: C.orange, background: `${C.orange}15`, borderRadius: 6, padding: "1px 5px" }}>🔥 {cachedRecipe.nutricion.calorias} kcal</span>}
                              <span style={{ fontSize: 11, color: C.soft, fontWeight: 600 }}>🕐 {meal.hour}</span>
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginTop: 2 }}>{meal.dish}</div>
                          {meal.tag && <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>{meal.tag}</div>}
                        </div>
                        <span style={{ fontSize: 12, color: C.soft, transition: "transform .2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                      </div>
                      {meal.portion && !isExpanded && (
                        <div style={{ marginLeft: 54, fontSize: 11, color: C.mid, background: C.light, borderRadius: 8, padding: "4px 8px", display: "inline-block", marginBottom: 4 }}>
                          🥄 {meal.portion}
                        </div>
                      )}
                      {isExpanded && (
                        <div style={{ padding: "4px 0 10px 54px" }}>
                          {meal.portion && (
                            <div style={{ fontSize: 11, color: C.mid, background: C.light, borderRadius: 8, padding: "4px 8px", display: "inline-block", marginBottom: 8 }}>
                              🥄 {meal.portion}
                            </div>
                          )}
                          {meal.notes && (
                            <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 8 }}>
                              💡 {meal.notes}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                            <button onClick={(e) => { e.stopPropagation(); fetchDayMealRecipe(j); }} disabled={isRecipeLoading}
                              style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1.5px solid ${C.primary}44`, background: cachedRecipe ? `${C.primary}10` : C.card,
                                color: C.primary, fontSize: 11, fontWeight: 700, cursor: isRecipeLoading ? "wait" : "pointer", fontFamily: "'Nunito',sans-serif" }}>
                              {isRecipeLoading ? "⏳ Buscando..." : cachedRecipe ? "📖 Ver preparación" : "👨‍🍳 Preparación"}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); shuffleDayMeal(j); }} disabled={isShuffleLoading}
                              style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1.5px solid ${C.orange}44`, background: C.card,
                                color: C.orange, fontSize: 11, fontWeight: 700, cursor: isShuffleLoading ? "wait" : "pointer", fontFamily: "'Nunito',sans-serif" }}>
                              {isShuffleLoading ? "⏳ Cambiando..." : "🔀 Rebarajear"}
                            </button>
                          </div>
                          {cachedRecipe && <RecipeDetail recipe={cachedRecipe} />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!dayConfirmed && (
                <button onClick={() => confirmPlan("day")} disabled={confirmLoading}
                  style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none",
                    background: confirmLoading ? C.soft : `linear-gradient(135deg,${C.green},#00897B)`,
                    color: "#fff", fontSize: 14, fontWeight: 800, cursor: confirmLoading ? "wait" : "pointer",
                    fontFamily: "'Nunito',sans-serif", marginTop: 8, marginBottom: 8,
                    boxShadow: `0 4px 16px rgba(38,198,161,0.3)` }}>
                  {confirmLoading ? `⏳ ${confirmProgress || "Preparando..."}` : "👌 Confirmado"}
                </button>
              )}

              {dayConfirmed && (
                <div style={{ width: "100%", padding: "14px", borderRadius: 14, border: `2px solid ${C.green}`,
                  background: `${C.green}15`, textAlign: "center", marginTop: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.green, fontFamily: "'Nunito',sans-serif" }}>✅ Confirmado</span>
                  <div style={{ fontSize: 11, color: C.mid, marginTop: 4 }}>Lista de compras generada en Listado → Diario</div>
                </div>
              )}

              <div style={{ fontSize: 10, color: C.soft, textAlign: "center", marginTop: 4 }}>
                Generado: {new Date(dayPlan.generatedAt).toLocaleString("es-MX")} · {dayPlan.model}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
