"use client";

import { useState, useRef, useEffect } from "react";
import DB from "@/lib/storage";
import { C, grad, STAGE_DESC, APPETITE, CATS, lSt, iSt, getDailySuggestion, getDailySnack, getDailyDessert, getDailyTip, getNutriRec, getAgeSemester, MEAL_SLOTS, MEAL_EMOJIS } from "@/lib/constants";
import { calcAge } from "@/lib/age-helpers";
import { WHO, calcPercentile, percentileInfo } from "@/lib/percentiles";
import { callModel, CHAT_SYSTEM, trimChat, buildRecipe } from "@/lib/api-ai";
import SourceBadge from "./SourceBadge";
import RecipeModal from "./RecipeModal";
import PercentileCard from "./PercentileCard";
import PlanTab from "./PlanTab";
import ListadoTab from "./ListadoTab";

const TABS = [
  { id: "home", icon: "\u{1F3E0}", label: "Inicio" },
  { id: "plan", icon: "\u{1F4C5}", label: "Plan" },
  { id: "listado", icon: "\u{1F4DD}", label: "Listado" },
  { id: "chat", icon: "\u{1F4AC}", label: "Asesoría" },
  { id: "log", icon: "\u{1F4CB}", label: "Registro" },
  { id: "health", icon: "\u{1F4CF}", label: "Salud" },
  { id: "settings", icon: "\u2699\uFE0F", label: "Opciones" },
];

export default function App() {
  const [tab, setTab] = useState("home");

  // Profile
  const [profile, setProfile] = useState({ name: "André", birthDate: "", sex: "M", allergies: "", notes: "" });
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  // Chat
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoad, setChatLoad] = useState(false);
  const chatEnd = useRef(null);

  // Meals
  const [meals, setMeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ time: "", food: "", category: "", appetite: "\u{1F60A} Comió bien", notes: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNutri, setSelectedNutri] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [gustoFilter, setGustoFilter] = useState("todos");
  const [gustoExpanded, setGustoExpanded] = useState(null);
  // Backup
  const backupFileRef = useRef(null);
  const [backupMsg, setBackupMsg] = useState(null);

  const [reactivatedWeek, setReactivatedWeek] = useState(() => {
    try { const t = localStorage.getItem("na-confirm-week"); if (!t || t === "null") return true; return (Date.now() - new Date(JSON.parse(t)).getTime()) >= 7*24*60*60*1000; } catch { return true; }
  });
  const [reactivatedDay, setReactivatedDay] = useState(() => {
    try { const t = localStorage.getItem("na-confirm-day"); if (!t || t === "null") return true; return JSON.parse(t).split("T")[0] !== new Date().toISOString().split("T")[0]; } catch { return true; }
  });

  // Recipe
  const [recipe, setRecipe] = useState(null);
  const [recLoad, setRecLoad] = useState(false);

  // Snack Recipe
  const [snackRecipe, setSnackRecipe] = useState(null);
  const [snackLoad, setSnackLoad] = useState(false);
  const [snackStatus, setSnackStatus] = useState("");
  const [showSnackModal, setShowSnackModal] = useState(false);
  const [recStatus, setRecStatus] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Home section AI overrides
  const [customNutriRec, setCustomNutriRec] = useState(null);
  const [customSuggestion, setCustomSuggestion] = useState(null);
  const [customSnack, setCustomSnack] = useState(null);
  const [customDessert, setCustomDessert] = useState(null);
  const [customTip, setCustomTip] = useState(null);
  const [loadingSection, setLoadingSection] = useState(null);

  // Dessert recipe
  const [dessertRecipe, setDessertRecipe] = useState(null);
  const [dessertLoad, setDessertLoad] = useState(false);
  const [dessertStatus, setDessertStatus] = useState("");
  const [showDessertModal, setShowDessertModal] = useState(false);

  // Health
  const [healthRecs, setHealthRecs] = useState([]);
  const [hForm, setHForm] = useState({ weight: "", height: "", hc: "", ac: "", date: new Date().toISOString().split("T")[0] });
  const [hResult, setHResult] = useState(null);

  // Savings & model
  const [savings, setSavings] = useState({ recipeCached: 0, mealDBHits: 0, offHits: 0 });
  const [useSonnet, setUseSonnet] = useState(false);

  // Load stored data (localStorage es sync, no necesita async)
  useEffect(() => {
    const p = DB.get("na-profile"); if (p) setProfile(p);
    const m = DB.get("na-meals"); if (m) setMeals(m);
    const s = DB.get("na-savings"); if (s) setSavings(s);
    const u = DB.get("na-sonnet"); if (u !== null) setUseSonnet(u);
    const h = DB.get("na-health"); if (h) setHealthRecs(h);
    const cn = DB.get("na-custom-nutri"); if (cn) setCustomNutriRec(cn);
    const cs = DB.get("na-custom-suggestion"); if (cs) setCustomSuggestion(cs);
    const ck = DB.get("na-custom-snack"); if (ck) setCustomSnack(ck);
    const cd = DB.get("na-custom-dessert"); if (cd) setCustomDessert(cd);
    const ct = DB.get("na-custom-tip"); if (ct) setCustomTip(ct);
  }, []);

  const age = calcAge(profile.birthDate);
  const ageLabel = age ? age.label : "1-2 años";
  const stage = age?.stage || "toddler";
  const suggestion = getDailySuggestion(stage);
  const snack = getDailySnack(stage);
  const dessert = getDailyDessert(stage);
  const dailyTip = getDailyTip();
  const nutriRec = getNutriRec(age?.months);
  const currentSemester = getAgeSemester(age?.months);

  // Auto-limpiar caché de recetas al cambiar de semestre de edad
  useEffect(() => {
    if (currentSemester == null) return;
    const prevSemester = DB.get("na-age-semester");
    if (prevSemester !== null && prevSemester !== currentSemester) {
      // Cambió de semestre: limpiar caché de recetas
      DB.set("na-plan-recipes", null);
      DB.set("na-plan-recipes-meta", { createdAt: new Date().toISOString() });
      DB.set("na-confirm-week", null);
      DB.set("na-confirm-day", null);
      DB.set("na-shopping-week", null);
      DB.set("na-shopping-day", null);
      console.log(`[NutriAndré] Semestre cambió: ${prevSemester} → ${currentSemester}. Caché de recetas limpiado.`);
    }
    DB.set("na-age-semester", currentSemester);
  }, [currentSemester]);
  const todayStr = new Date().toLocaleDateString("es-ES");
  const todayMeals = meals.filter(m => m.date === todayStr);
  const ateWell = todayMeals.filter(m => m.appetite === "\u{1F60A} Comió bien").length;

  // Init chat greeting
  useEffect(() => {
    setMsgs([{ role: "assistant", content: `¡Hola! \u{1F44B} Soy NutriAndré, tu asesora para ${profile.name || "tu bebé"}${age ? ` (${age.label})` : ""}. ${age ? `Experta en ${STAGE_DESC[stage]}.` : ""} ¿En qué te ayudo hoy?` }]);
  }, [profile.birthDate, profile.name]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // ── Actions ──────────────────────────────────────────────────

  const saveProfile = () => {
    DB.set("na-profile", profile);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const calcHealth = () => {
    const { weight, height, hc, date } = hForm;
    if (!weight && !height) return;
    const ageAtDate = calcAge(profile.birthDate);
    if (!ageAtDate) { alert("Configura la fecha de nacimiento en Opciones primero."); return; }
    const sex = profile.sex || "M";
    const months = ageAtDate.months;
    const results = {};
    if (weight) results.wfa = calcPercentile(parseFloat(weight), WHO.wfa, sex, months);
    if (height) results.lfa = calcPercentile(parseFloat(height), WHO.lfa, sex, months);
    if (hc) results.hcfa = calcPercentile(parseFloat(hc), WHO.hcfa, sex, months);
    const rec = { id: Date.now(), date, weight: weight || null, height: height || null, hc: hc || null, ac: hForm.ac || null, months, results };
    const updated = [rec, ...healthRecs];
    setHealthRecs(updated);
    setHResult(rec);
    DB.set("na-health", updated);
  };

  const deleteHealthRec = (id) => {
    const updated = healthRecs.filter(r => r.id !== id);
    setHealthRecs(updated);
    if (hResult?.id === id) setHResult(null);
    DB.set("na-health", updated);
  };

  const sendChat = async () => {
    if (!input.trim() || chatLoad) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs); setInput(""); setChatLoad(true);
    try {
      const reply = await callModel({
        messages: trimChat(newMsgs).map(m => ({ role: m.role, content: m.content })),
        system: CHAT_SYSTEM(profile.name || "el bebé", ageLabel),
        maxTokens: useSonnet ? 800 : 550,
        useSonnet,
      });
      setMsgs(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMsgs(prev => [...prev, { role: "assistant", content: "Error de conexión. Intenta de nuevo \u{1F64F}" }]);
    }
    setChatLoad(false);
  };

  const fetchRecipe = async () => {
    if (recLoad) return;
    if (recipe) { setShowModal(true); return; }
    // Verificar si ya existe en caché y el usuario quiere reemplazar con otro modelo
    const sg = customSuggestion || suggestion;
    const existing = (DB.get("na-plan-recipes") || {})[sg.dish.toLowerCase().trim()];
    let force = false;
    if (existing && useSonnet) {
      if (!confirm("Esta receta ya está en caché. ¿Deseas reemplazarla con una versión Sonnet?\n\nPresiona Cancelar para usar la versión guardada.")) {
        setRecipe(existing); setShowModal(true); return;
      }
      force = true;
    }
    setRecLoad(true);
    try {
      setRecStatus("\u{1F50D} Buscando receta...");
      const { recipe: built, fromCache } = await buildRecipe(sg, ageLabel, useSonnet, force);
      const newSav = {
        recipeCached: savings.recipeCached + (fromCache ? 1 : 0),
        mealDBHits: savings.mealDBHits + (built._sources?.recipe?.includes("TheMealDB") ? 1 : 0),
        offHits: savings.offHits + (built.nutricion?.source === "Open Food Facts" ? 1 : 0),
      };
      setSavings(newSav);
      DB.set("na-savings", newSav);
      setRecipe(built);
      setShowModal(true);
    } catch (e) {
      alert("No se pudo cargar la receta. Verifica tu conexión.");
    }
    setRecLoad(false); setRecStatus("");
  };

  const fetchSnackRecipe = async () => {
    if (snackLoad) return;
    if (snackRecipe) { setShowSnackModal(true); return; }
    const sk = customSnack || snack;
    const existing = (DB.get("na-plan-recipes") || {})[sk.dish.toLowerCase().trim()];
    let force = false;
    if (existing && useSonnet) {
      if (!confirm("Esta receta ya está en caché. ¿Deseas reemplazarla con una versión Sonnet?\n\nPresiona Cancelar para usar la versión guardada.")) {
        setSnackRecipe(existing); setShowSnackModal(true); return;
      }
      force = true;
    }
    setSnackLoad(true);
    try {
      setSnackStatus("\u{1F50D} Buscando snack...");
      const { recipe: built } = await buildRecipe(sk, ageLabel, useSonnet, force);
      setSnackRecipe(built);
      setShowSnackModal(true);
    } catch {
      alert("No se pudo cargar la receta del snack. Verifica tu conexión.");
    }
    setSnackLoad(false); setSnackStatus("");
  };

  const fetchDessertRecipe = async () => {
    if (dessertLoad) return;
    if (dessertRecipe) { setShowDessertModal(true); return; }
    const ds = customDessert || dessert;
    const existing = (DB.get("na-plan-recipes") || {})[ds.dish.toLowerCase().trim()];
    let force = false;
    if (existing && useSonnet) {
      if (!confirm("Esta receta ya est\u00e1 en cach\u00e9. \u00bfDeseas reemplazarla con una versi\u00f3n Sonnet?\n\nPresiona Cancelar para usar la versi\u00f3n guardada.")) {
        setDessertRecipe(existing); setShowDessertModal(true); return;
      }
      force = true;
    }
    setDessertLoad(true);
    try {
      setDessertStatus("\u{1F50D} Buscando postre...");
      const { recipe: built } = await buildRecipe(ds, ageLabel, useSonnet, force);
      setDessertRecipe(built);
      setShowDessertModal(true);
    } catch {
      alert("No se pudo cargar la receta del postre. Verifica tu conexi\u00f3n.");
    }
    setDessertLoad(false); setDessertStatus("");
  };

  // ── Actualizar secciones del inicio con IA ──
  const refreshSection = async (section) => {
    setLoadingSection(section);
    try {
      const prompts = {
        nutri: `Genera recomendaciones nutricionales detalladas para un niño de ${ageLabel} (etapa: ${STAGE_DESC[stage]}). Basado en AAP, OMS y DGA 2020-2025. SOLO JSON: {"label":"...","kcal":"...","source":"...","macros":[{"name":"...","val":"...","emoji":"..."}],"liquids":[{"name":"...","val":"...","emoji":"..."}],"avoid":["..."]}`,
        suggestion: `Sugiere UN platillo principal nutritivo para un niño de ${ageLabel} (etapa: ${STAGE_DESC[stage]}). Diferente a "${suggestion.dish}". SOLO JSON: {"dish":"...","emoji":"...","tag":"..."}`,
        snack: `Sugiere UN snack saludable para un niño de ${ageLabel} (etapa: ${STAGE_DESC[stage]}). Diferente a "${snack.dish}". SOLO JSON: {"dish":"...","emoji":"...","tag":"..."}`,
        dessert: `Sugiere UN postre saludable para un niño de ${ageLabel} (etapa: ${STAGE_DESC[stage]}). Diferente a "${dessert.dish}". Debe ser nutritivo y bajo en azúcar. SOLO JSON: {"dish":"...","emoji":"...","tag":"..."}`,
        tip: `Da UN consejo experto de nutrición infantil para mejorar el apego a la alimentación de un niño de ${ageLabel}. Basado en evidencia (AAP, OMS, Ellyn Satter, BLW). SOLO JSON: {"tip":"...","source":"...","emoji":"..."}`,
      };
      const raw = await callModel({
        messages: [{ role: "user", content: prompts[section] }],
        system: "Responde ÚNICAMENTE con JSON válido. Sin texto extra, sin backticks.",
        maxTokens: section === "nutri" ? 800 : 300,
        useSonnet,
      });
      const clean = raw.replace(/```json|```/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        let json = match[0];
        let parsed;
        try { parsed = JSON.parse(json); } catch {
          // Fix truncated JSON
          const opens = (json.match(/\[/g)||[]).length - (json.match(/\]/g)||[]).length;
          const braces = (json.match(/\{/g)||[]).length - (json.match(/\}/g)||[]).length;
          for (let x=0;x<opens;x++) json+="]";
          for (let x=0;x<braces;x++) json+="}";
          parsed = JSON.parse(json);
        }
        if (section === "nutri") { setCustomNutriRec(parsed); DB.set("na-custom-nutri", parsed); }
        else if (section === "suggestion") { setCustomSuggestion(parsed); DB.set("na-custom-suggestion", parsed); }
        else if (section === "snack") { setCustomSnack(parsed); DB.set("na-custom-snack", parsed); }
        else if (section === "dessert") { setCustomDessert(parsed); DB.set("na-custom-dessert", parsed); }
        else if (section === "tip") { setCustomTip(parsed); DB.set("na-custom-tip", parsed); }
      }
    } catch (e) { console.error(`Error refreshing ${section}:`, e); }
    setLoadingSection(null);
  };

  const addMeal = () => {
    if (!form.time || !form.food || !form.category) return;
    const mealData = { ...form, id: Date.now(), date: todayStr };
    if (selectedNutri) mealData.nutricion = selectedNutri;
    const updated = [mealData, ...meals];
    setMeals(updated); DB.set("na-meals", updated);
    setShowForm(false); setForm({ time: "", food: "", category: "", appetite: "\u{1F60A} Comió bien", notes: "" });
    setSearchQuery(""); setSelectedNutri(null); setShowSearch(false);
  };

  // Obtener platillos del caché filtrados por categoría de comida
  const getFilteredDishes = (mealType) => {
    const recipes = DB.get("na-plan-recipes") || {};
    // Buscar todos los planes guardados
    const allMeals = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("na-plan-week-") || key?.startsWith("na-plan-day-")) {
          const plan = DB.get(key);
          if (plan?.days) plan.days.forEach(d => { if (d.meals) allMeals.push(...d.meals); });
          else if (plan?.meals) allMeals.push(...plan.meals);
        }
      }
    } catch {}
    // Platillos del plan que coinciden con la categoría (prioridad)
    const fromPlans = allMeals
      .filter(m => m.type === mealType && m.dish && recipes[m.dish.toLowerCase().trim()])
      .map(m => ({ dish: m.dish, emoji: m.emoji, recipe: recipes[m.dish.toLowerCase().trim()] }));
    // TODAS las recetas del caché (para que siempre estén disponibles)
    const fromCache = Object.entries(recipes).map(([key, recipe]) => ({
      dish: key.charAt(0).toUpperCase() + key.slice(1), emoji: "🍽", recipe,
    }));
    // Combinar: primero del plan (matching), luego el resto del caché
    const combined = [...fromPlans];
    const seenLower = new Set(combined.map(m => m.dish.toLowerCase()));
    fromCache.forEach(m => { if (!seenLower.has(m.dish.toLowerCase())) { combined.push(m); seenLower.add(m.dish.toLowerCase()); } });
    // Deduplicar
    const seen = new Set();
    return combined.filter(m => { const k = m.dish.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  };

  const deleteMeal = (id) => {
    const updated = meals.filter(m => m.id !== id);
    setMeals(updated); DB.set("na-meals", updated);
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Nunito',sans-serif", minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: C.bg, display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: grad, padding: "16px 20px 12px", boxShadow: "0 4px 20px rgba(2,136,209,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 30 }}>{"\u{1F37C}"}</span>
            <div>
              <h1 style={{ margin: 0, color: "#fff", fontSize: 20, fontWeight: 900, letterSpacing: "-0.3px" }}>NutriAndré</h1>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 11 }}>
                {age ? `${profile.name || "Bebé"} · ${age.label}` : "Configura el perfil \u2699\uFE0F"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
            <div style={{ background: useSonnet ? "rgba(255,200,0,0.25)" : "rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px", display: "flex", alignItems: "center", gap: 5, border: useSonnet ? "1px solid rgba(255,200,0,0.5)" : "1px solid rgba(255,255,255,0.2)" }}>
              <span style={{ fontSize: 10 }}>{useSonnet ? "\u2728" : "\u26A1"}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: useSonnet ? "#FFE082" : "rgba(255,255,255,0.9)" }}>{useSonnet ? "Sonnet" : "Haiku"}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "5px 12px", textAlign: "center" }}>
              <p style={{ margin: 0, color: "#fff", fontSize: 17, fontWeight: "bold" }}>{todayMeals.length}</p>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 10 }}>hoy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 74 }}>

        {/* ── HOME ───────────────────────────────────────────── */}
        {tab === "home" && (
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            {!profile.birthDate && (
              <div onClick={() => setTab("settings")} style={{ background: `linear-gradient(135deg,${C.light},${C.accent})`, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", cursor: "pointer", border: `1.5px dashed ${C.primary}` }}>
                <span style={{ fontSize: 26 }}>{"\u2699\uFE0F"}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: C.deep, fontSize: 13 }}>Configura el perfil de André</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.mid }}>Agrega la fecha de nacimiento para personalizar {"\u2192"}</p>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Comidas", value: todayMeals.length, emoji: "\u{1F37D}\uFE0F", color: C.primary },
                { label: "Buenas", value: ateWell, emoji: "\u{1F60A}", color: C.green },
                { label: "Faltan", value: Math.max(0, 3 - todayMeals.length), emoji: "\u23F3", color: C.orange },
              ].map(s => (
                <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: "12px 8px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                  <p style={{ margin: 0, fontSize: 22 }}>{s.emoji}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: "bold", color: s.color }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 10, color: C.soft }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recomendaciones nutricionales */}
            {age && nutriRec && (() => { const nr = customNutriRec || nutriRec; return (
              <div style={{ background: C.card, borderRadius: 20, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${C.accent}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ background: C.deep, color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{"\u{1F4CA}"} Recomendaciones nutricionales</span>
                  <span style={{ fontSize: 10, color: C.soft, fontWeight: 600 }}>{nr.source}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{"\u{1F476}"}</span>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{nr.label}</span>
                    <span style={{ fontSize: 11, color: C.mid, marginLeft: 6 }}>({age.label})</span>
                  </div>
                </div>
                {/* Kcal */}
                <div style={{ background: `linear-gradient(135deg,#FFF3E0,#FFE0B2)`, borderRadius: 12, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>{"\u{1F525}"}</span>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#E65100" }}>{nr.kcal} kcal/día</div>
                    <div style={{ fontSize: 10, color: "#BF360C" }}>Requerimiento energético diario</div>
                  </div>
                </div>
                {/* Macros */}
                {nr.macros && <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(nr.macros.length, 3)}, 1fr)`, gap: 6, marginBottom: 10 }}>
                  {nr.macros.map((m, i) => (
                    <div key={i} style={{ textAlign: "center", background: C.light, borderRadius: 10, padding: "8px 4px" }}>
                      <div style={{ fontSize: 16 }}>{m.emoji}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{m.val}</div>
                      <div style={{ fontSize: 9, color: C.mid, fontWeight: 600 }}>{m.name}</div>
                    </div>
                  ))}
                </div>}
                {nr.macros?.length > 3 && (
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${nr.macros.length - 3}, 1fr)`, gap: 6, marginBottom: 10 }}>
                    {nr.macros.slice(3).map((m, i) => (
                      <div key={i} style={{ textAlign: "center", background: C.light, borderRadius: 10, padding: "8px 4px" }}>
                        <div style={{ fontSize: 16 }}>{m.emoji}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{m.val}</div>
                        <div style={{ fontSize: 9, color: C.mid, fontWeight: 600 }}>{m.name}</div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Líquidos */}
                {nr.liquids && <div style={{ marginBottom: 10 }}>
                  {nr.liquids.map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                      <span style={{ fontSize: 16 }}>{l.emoji}</span>
                      <span style={{ fontSize: 12, color: C.text }}><b>{l.name}:</b> {l.val}</span>
                    </div>
                  ))}
                </div>}
                {/* Evitar */}
                {nr.avoid && <div style={{ background: "#FFF0F0", borderRadius: 10, padding: "8px 12px", border: "1px solid #FFCDD2", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.red, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{"\u{274C}"} Evitar / Prohibido</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {nr.avoid.map((a, i) => (
                      <span key={i} style={{ fontSize: 11, background: "#FFEBEE", color: "#C62828", borderRadius: 6, padding: "2px 8px", fontWeight: 600 }}>{"\u2716"} {a}</span>
                    ))}
                  </div>
                </div>}
                <button onClick={() => refreshSection("nutri")} disabled={loadingSection==="nutri"}
                  style={{ width: "100%", padding: "8px", borderRadius: 10, border: `1.5px solid ${C.deep}33`, background: C.light, color: C.deep, fontSize: 11, fontWeight: 700, cursor: loadingSection==="nutri"?"wait":"pointer", fontFamily: "'Nunito',sans-serif" }}>
                  {loadingSection==="nutri" ? "\u23F3 Actualizando..." : `\u{1F504} Actualizar con ${useSonnet?"\u2728 Sonnet":"\u26A1 Haiku"}`}
                </button>
              </div>
            ); })()}

            {/* Daily suggestion */}
            {(() => { const sg = customSuggestion || suggestion; return (
            <div style={{ background: `linear-gradient(135deg,${C.light},${C.accent})`, borderRadius: 20, padding: 16, boxShadow: "0 4px 18px rgba(41,182,246,0.2)", border: "1px solid rgba(41,182,246,0.2)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -8, top: -8, fontSize: 70, opacity: 0.1 }}>{sg.emoji}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ background: C.primary, color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{"\u2728"} Sugerencia del día</span>
                <span style={{ background: "rgba(255,255,255,0.85)", color: C.dark, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{sg.tag}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                <span style={{ fontSize: 44 }}>{sg.emoji}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: 15, color: C.deep, lineHeight: 1.3 }}>{sg.dish}</p>
                  {age && <p style={{ margin: "3px 0 0", fontSize: 11, color: C.mid }}>Ideal para {age.label} · {STAGE_DESC[stage]} {"\u{1F499}"}</p>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <SourceBadge label={"\u{1F5C4} TheMealDB"} color={C.dark} />
                <SourceBadge label={"\u{1F957} Open Food Facts"} color={C.green} />
                <SourceBadge label={"\u26A1 Haiku"} color={C.purple} />
              </div>
              <button onClick={fetchRecipe} disabled={recLoad} style={{ marginTop: 12, width: "100%", padding: 12, borderRadius: 14, border: "none", background: recLoad ? C.accent : grad, color: recLoad ? C.mid : "#fff", fontWeight: "bold", fontSize: 14, cursor: recLoad ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(2,136,209,0.3)", transition: "all .2s" }}>
                {recLoad ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>{"\u27F3"}</span> {recStatus || "Cargando..."}</> : recipe ? "Ver receta y nutrición \u{1F4D6}" : "Ver ingredientes y receta \u{1F468}\u200D\u{1F373}"}
              </button>
              <button onClick={() => refreshSection("suggestion")} disabled={loadingSection==="suggestion"}
                style={{ marginTop: 6, width: "100%", padding: "8px", borderRadius: 10, border: `1.5px solid ${C.primary}33`, background: "rgba(255,255,255,0.7)", color: C.dark, fontSize: 11, fontWeight: 700, cursor: loadingSection==="suggestion"?"wait":"pointer", fontFamily: "'Nunito',sans-serif" }}>
                {loadingSection==="suggestion" ? "\u23F3 Actualizando..." : `\u{1F504} Actualizar con ${useSonnet?"\u2728 Sonnet":"\u26A1 Haiku"}`}
              </button>
            </div>
            ); })()}

            {/* Snack del día */}
            {(() => { const sk = customSnack || snack; return (
            <div style={{ background: `linear-gradient(135deg,#E8F5E9,#C8E6C9)`, borderRadius: 20, padding: 16, boxShadow: "0 4px 18px rgba(38,198,161,0.15)", border: "1px solid rgba(38,198,161,0.2)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -8, top: -8, fontSize: 70, opacity: 0.1 }}>{sk.emoji}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ background: C.green, color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{"\u{1F34F}"} Snack del día</span>
                <span style={{ background: "rgba(255,255,255,0.85)", color: C.dark, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{sk.tag}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                <span style={{ fontSize: 44 }}>{sk.emoji}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: 15, color: "#1B5E20", lineHeight: 1.3 }}>{sk.dish}</p>
                  {age && <p style={{ margin: "3px 0 0", fontSize: 11, color: C.mid }}>Snack para {age.label} · {STAGE_DESC[stage]} {"\u{1F34F}"}</p>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <SourceBadge label={"\u{1F5C4} TheMealDB"} color={C.dark} />
                <SourceBadge label={"\u{1F957} Open Food Facts"} color={C.green} />
                <SourceBadge label={"\u26A1 Haiku"} color={C.purple} />
              </div>
              <button onClick={fetchSnackRecipe} disabled={snackLoad} style={{ marginTop: 12, width: "100%", padding: 12, borderRadius: 14, border: "none", background: snackLoad ? "#A5D6A7" : `linear-gradient(135deg,${C.green},#00897B)`, color: snackLoad ? C.mid : "#fff", fontWeight: "bold", fontSize: 14, cursor: snackLoad ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(38,198,161,0.3)", transition: "all .2s" }}>
                {snackLoad ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>{"\u27F3"}</span> {snackStatus || "Cargando..."}</> : snackRecipe ? "Ver receta del snack \u{1F4D6}" : "Ver ingredientes y receta \u{1F468}\u200D\u{1F373}"}
              </button>
              <button onClick={() => refreshSection("snack")} disabled={loadingSection==="snack"}
                style={{ marginTop: 6, width: "100%", padding: "8px", borderRadius: 10, border: `1.5px solid ${C.green}33`, background: "rgba(255,255,255,0.7)", color: "#1B5E20", fontSize: 11, fontWeight: 700, cursor: loadingSection==="snack"?"wait":"pointer", fontFamily: "'Nunito',sans-serif" }}>
                {loadingSection==="snack" ? "\u23F3 Actualizando..." : `\u{1F504} Actualizar con ${useSonnet?"\u2728 Sonnet":"\u26A1 Haiku"}`}
              </button>
            </div>
            ); })()}

            {/* Postre saludable del día */}
            {(() => { const ds = customDessert || dessert; return (
            <div style={{ background: `linear-gradient(135deg,#FFF3E0,#FFE0B2)`, borderRadius: 20, padding: 16, boxShadow: "0 4px 18px rgba(255,179,0,0.15)", border: "1px solid rgba(255,179,0,0.2)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -8, top: -8, fontSize: 70, opacity: 0.1 }}>{ds.emoji}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ background: C.orange, color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{"\u{1F370}"} Postre saludable del día</span>
                <span style={{ background: "rgba(255,255,255,0.85)", color: C.dark, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{ds.tag}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                <span style={{ fontSize: 44 }}>{ds.emoji}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: 15, color: "#E65100", lineHeight: 1.3 }}>{ds.dish}</p>
                  {age && <p style={{ margin: "3px 0 0", fontSize: 11, color: C.mid }}>Postre para {age.label} · {STAGE_DESC[stage]} {"\u{1F370}"}</p>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <SourceBadge label={"\u{1F5C4} TheMealDB"} color={C.dark} />
                <SourceBadge label={"\u{1F957} Open Food Facts"} color={C.green} />
                <SourceBadge label={"\u26A1 Haiku"} color={C.purple} />
              </div>
              <button onClick={fetchDessertRecipe} disabled={dessertLoad} style={{ marginTop: 12, width: "100%", padding: 12, borderRadius: 14, border: "none", background: dessertLoad ? "#FFCC80" : `linear-gradient(135deg,${C.orange},#E65100)`, color: dessertLoad ? C.mid : "#fff", fontWeight: "bold", fontSize: 14, cursor: dessertLoad ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(255,179,0,0.3)", transition: "all .2s" }}>
                {dessertLoad ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>{"\u27F3"}</span> {dessertStatus || "Cargando..."}</> : dessertRecipe ? "Ver receta del postre \u{1F4D6}" : "Ver ingredientes y receta \u{1F468}\u200D\u{1F373}"}
              </button>
              <button onClick={() => refreshSection("dessert")} disabled={loadingSection==="dessert"}
                style={{ marginTop: 6, width: "100%", padding: "8px", borderRadius: 10, border: "1.5px solid rgba(255,179,0,0.3)", background: "rgba(255,255,255,0.7)", color: "#E65100", fontSize: 11, fontWeight: 700, cursor: loadingSection==="dessert"?"wait":"pointer", fontFamily: "'Nunito',sans-serif" }}>
                {loadingSection==="dessert" ? "\u23F3 Actualizando..." : `\u{1F504} Actualizar con ${useSonnet?"\u2728 Sonnet":"\u26A1 Haiku"}`}
              </button>
            </div>
            ); })()}

            {/* Consejo del día */}
            {(() => { const tp = customTip || dailyTip; return (
            <div style={{ background: C.card, borderRadius: 18, padding: "14px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: `1.5px solid ${C.purple}22`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -4, bottom: -8, fontSize: 60, opacity: 0.06 }}>{tp.emoji}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ background: C.purple, color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{"\u{1F4A1}"} Consejo del día</span>
                <span style={{ fontSize: 10, color: C.soft, fontWeight: 600 }}>Fuente: {tp.source}</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{tp.emoji}</span>
                <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.5, fontWeight: 500 }}>{tp.tip}</p>
              </div>
              <button onClick={() => refreshSection("tip")} disabled={loadingSection==="tip"}
                style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: 10, border: `1.5px solid ${C.purple}33`, background: C.card, color: C.purple, fontSize: 11, fontWeight: 700, cursor: loadingSection==="tip"?"wait":"pointer", fontFamily: "'Nunito',sans-serif" }}>
                {loadingSection==="tip" ? "\u23F3 Actualizando..." : `\u{1F504} Actualizar con ${useSonnet?"\u2728 Sonnet":"\u26A1 Haiku"}`}
              </button>
            </div>
            ); })()}

            {todayMeals.length > 0 && (
              <div>
                <p style={{ margin: "0 0 8px", fontWeight: "bold", color: C.soft, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Hoy</p>
                {todayMeals.slice(0, 3).map(m => (
                  <div key={m.id} style={{ background: C.card, borderRadius: 13, padding: "10px 14px", marginBottom: 7, display: "flex", gap: 12, alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <span style={{ fontSize: 22 }}>{m.category.split(" ")[0]}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: C.text }}>{m.food}</p>
                      <p style={{ margin: 0, fontSize: 11, color: C.soft }}>{m.time} · {m.appetite}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: "\uFF0B\u{1F37D}\uFE0F", label: "Registrar comida", action: () => { setTab("log"); setShowForm(true); } },
                { icon: "\u{1F4AC}", label: "Consultar IA", action: () => setTab("chat") },
              ].map(a => (
                <button key={a.label} onClick={a.action} style={{ padding: 14, borderRadius: 16, border: `2px solid ${C.accent}`, background: C.card, color: C.deep, fontWeight: "bold", fontSize: 13, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 24 }}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PLAN ───────────────────────────────────────────── */}
        {tab === "plan" && <PlanTab profile={profile} age={age} useSonnet={useSonnet} />}

        {/* ── LISTADO ────────────────────────────────────────── */}
        {tab === "listado" && <ListadoTab />}

        {/* ── CHAT ───────────────────────────────────────────── */}
        {tab === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 152px)" }}>
            <div style={{ padding: "8px 12px", display: "flex", gap: 7, overflowX: "auto", borderBottom: `1px solid ${C.light}`, background: C.card }}>
              {["¿Cuánto debe comer?", "Rechaza verduras", "Ideas de merienda", "No quiere comer", "Alimentos a evitar"].map(q => (
                <button key={q} onClick={() => setInput(q)} style={{ whiteSpace: "nowrap", padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${C.primary}`, background: C.light, color: C.deep, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{q}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 13, display: "flex", flexDirection: "column", gap: 11 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                  {m.role === "assistant" && <span style={{ fontSize: 18, flexShrink: 0 }}>{"\u{1F30A}"}</span>}
                  <div style={{ maxWidth: "80%", padding: "11px 14px", borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px", background: m.role === "user" ? grad : C.card, color: m.role === "user" ? "#fff" : C.text, fontSize: 13, lineHeight: 1.6, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", whiteSpace: "pre-wrap" }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoad && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <span style={{ fontSize: 18 }}>{"\u{1F30A}"}</span>
                  <div style={{ padding: "10px 14px", borderRadius: "20px 20px 20px 4px", background: C.card, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary, display: "inline-block", animation: `bounce 1s infinite ${i * 0.2}s` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <div style={{ padding: "10px 13px", background: C.card, borderTop: `1px solid ${C.light}`, display: "flex", gap: 9, alignItems: "flex-end" }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }} placeholder="Escribe tu pregunta..." rows={1} style={{ flex: 1, padding: "9px 13px", borderRadius: 20, border: `1.5px solid ${C.accent}`, fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", background: C.light, color: C.text }} />
              <button onClick={sendChat} disabled={chatLoad || !input.trim()} style={{ width: 41, height: 41, borderRadius: "50%", border: "none", background: chatLoad || !input.trim() ? C.accent : grad, color: "#fff", fontSize: 16, cursor: chatLoad || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{"\u27A4"}</button>
            </div>
          </div>
        )}

        {/* ── LOG ────────────────────────────────────────────── */}
        {tab === "log" && (
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => setShowForm(!showForm)} style={{ padding: 13, borderRadius: 16, border: `2px ${showForm ? "solid" : "dashed"} ${C.primary}`, background: showForm ? C.light : "transparent", color: C.dark, fontWeight: "bold", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {showForm ? "\u2715 Cancelar" : "\uFF0B Registrar comida"}
            </button>
            {showForm && (() => {
              const mealSlots = MEAL_SLOTS[stage] || MEAL_SLOTS.toddler;
              const filtered = form.category ? getFilteredDishes(form.category) : [];
              const searchResults = searchQuery ? filtered.filter(d => d.dish.toLowerCase().includes(searchQuery.toLowerCase())) : filtered;
              return (
              <div style={{ background: C.card, borderRadius: 18, padding: 16, boxShadow: "0 4px 18px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 11 }}>
                <h3 style={{ margin: 0, color: C.deep, fontSize: 14 }}>Nueva comida {"\u{1F37D}\uFE0F"}</h3>
                <div><label style={lSt}>Hora</label><input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={iSt} /></div>
                {/* Categoría: tipo de comida */}
                <div>
                  <label style={lSt}>Categoría</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {mealSlots.map(s => (
                      <button key={s.type} onClick={() => { setForm(f => ({ ...f, category: s.type, food: "" })); setSearchQuery(""); setSelectedNutri(null); setShowSearch(true); }}
                        style={{ padding: "8px 14px", borderRadius: 12, border: `1.5px solid ${form.category === s.type ? C.primary : C.accent}`,
                          background: form.category === s.type ? C.light : C.card, color: form.category === s.type ? C.dark : C.soft,
                          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
                        {MEAL_EMOJIS[s.type] || "🍽"} {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Buscador de alimentos */}
                {form.category && (
                  <div style={{ position: "relative" }}>
                    <label style={lSt}>Alimento</label>
                    <input placeholder={`Buscar ${form.category}...`} value={form.food || searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setForm(f => ({ ...f, food: "" })); setSelectedNutri(null); setShowSearch(true); }}
                      style={iSt} />
                    {showSearch && searchResults.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: C.card, borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", border: `1px solid ${C.accent}`, maxHeight: 200, overflowY: "auto" }}>
                        {searchResults.map((d, i) => (
                          <div key={i} onClick={() => { setForm(f => ({ ...f, food: d.dish })); setSelectedNutri(d.recipe?.nutricion || null); setSearchQuery(""); setShowSearch(false); }}
                            style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, borderBottom: i < searchResults.length - 1 ? `1px solid ${C.light}` : "none" }}>
                            <span style={{ fontSize: 18 }}>{d.emoji || "🍽"}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{d.dish}</span>
                            {d.recipe?.nutricion && <span style={{ marginLeft: "auto", fontSize: 10, color: C.orange, fontWeight: 700 }}>🔥 {d.recipe.nutricion.calorias} kcal</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {showSearch && searchQuery && filtered.length > 0 && searchResults.length === 0 && (
                      <div style={{ marginTop: 4, fontSize: 11, color: C.mid }}>Sin resultados. Puedes escribir manualmente.</div>
                    )}
                    {/* Permitir texto libre */}
                    {!form.food && searchQuery && (
                      <button onClick={() => { setForm(f => ({ ...f, food: searchQuery })); setShowSearch(false); }}
                        style={{ marginTop: 6, padding: "6px 12px", borderRadius: 8, border: `1px dashed ${C.primary}`, background: "transparent", color: C.primary, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
                        Usar "{searchQuery}" como texto libre
                      </button>
                    )}
                  </div>
                )}
                {/* Info nutricional del platillo seleccionado */}
                {selectedNutri && (
                  <div style={{ background: C.light, borderRadius: 12, padding: 10, border: `1px solid ${C.orange}22` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 14 }}>{"\u{1F525}"}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: C.orange }}>{selectedNutri.calorias} kcal</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                      {[
                        { label: "Proteína", val: selectedNutri.proteinas, emoji: "🥩" },
                        { label: "Carbos", val: selectedNutri.carbohidratos, emoji: "🌾" },
                        { label: "Grasas", val: selectedNutri.grasas, emoji: "🫒" },
                      ].map((m, k) => (
                        <div key={k} style={{ textAlign: "center", fontSize: 11, color: C.text }}>
                          <span>{m.emoji}</span> <b>{m.val}</b>
                          <div style={{ fontSize: 9, color: C.mid }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label style={lSt}>Apetito</label>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {APPETITE.map(a => <button key={a} onClick={() => setForm(f => ({ ...f, appetite: a }))} style={{ padding: "5px 11px", borderRadius: 20, border: `1.5px solid ${form.appetite === a ? C.primary : C.accent}`, background: form.appetite === a ? C.light : C.card, color: form.appetite === a ? C.dark : C.soft, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{a}</button>)}
                  </div>
                </div>
                <div><label style={lSt}>Notas</label><input placeholder="ej. Le gustó mucho..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={iSt} /></div>
                <button onClick={addMeal} disabled={!form.food || !form.category || !form.time}
                  style={{ padding: 12, borderRadius: 12, border: "none", background: (!form.food || !form.category || !form.time) ? C.soft : grad, color: "#fff", fontWeight: "bold", fontSize: 14, cursor: (!form.food || !form.category || !form.time) ? "not-allowed" : "pointer" }}>
                  Guardar {"\u2713"}
                </button>
              </div>
              );
            })()}
            {meals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: C.soft }}>
                <p style={{ fontSize: 44, margin: 0 }}>{"\u{1F37D}\uFE0F"}</p>
                <p style={{ margin: "10px 0 0", fontSize: 13 }}>Aún no hay comidas registradas.</p>
              </div>
            ) : Object.entries(meals.reduce((a, m) => { (a[m.date] = a[m.date] || []).push(m); return a; }, {})).map(([date, dm]) => (
              <div key={date}>
                <p style={{ margin: "0 0 7px", fontSize: 11, fontWeight: "bold", color: C.soft, textTransform: "uppercase", letterSpacing: 1 }}>{date === todayStr ? "Hoy" : date}</p>
                {dm.map(meal => (
                  <div key={meal.id} style={{ background: C.card, borderRadius: 13, padding: "10px 13px", marginBottom: 7, display: "flex", gap: 11, alignItems: "flex-start", boxShadow: "0 2px 7px rgba(0,0,0,0.05)" }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{meal.category.split(" ")[0]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: C.text }}>{meal.food}</p>
                          <p style={{ margin: 0, fontSize: 11, color: C.soft }}>{meal.time} · {meal.appetite}</p>
                        </div>
                        <button onClick={() => deleteMeal(meal.id)} style={{ background: "none", border: "none", color: C.accent, fontSize: 15, cursor: "pointer", padding: 0 }}>{"\u2715"}</button>
                      </div>
                      {meal.notes && <p style={{ margin: "5px 0 0", fontSize: 11, color: C.mid, fontStyle: "italic" }}>{meal.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {/* ── Sus gustos ── */}
            {meals.length > 0 && (() => {
              const recipes = DB.get("na-plan-recipes") || {};
              const GUSTO_FILTERS = [
                { id: "todos", label: "Todos", emoji: "📋" },
                { id: "\u{1F60D} Le encantó", label: "Le encantó", emoji: "😍" },
                { id: "\u{1F60A} Comió bien", label: "Comió bien", emoji: "😊" },
                { id: "\u{1F610} Comió poco", label: "Comió poco", emoji: "😐" },
                { id: "\u{1F922} Con dificultad", label: "Con dificultad", emoji: "🤢" },
                { id: "\u{1F624} Rechazó", label: "Rechazó", emoji: "😤" },
              ];
              const filtered = gustoFilter === "todos" ? meals : meals.filter(m => m.appetite === gustoFilter);
              // Deduplicar por nombre de alimento
              const seen = new Set();
              const unique = filtered.filter(m => { const k = m.food?.toLowerCase().trim(); if (!k || seen.has(k)) return false; seen.add(k); return true; });
              return (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>😍</span>
                    <span style={{ fontWeight: 800, fontSize: 14, color: C.deep }}>Sus gustos</span>
                  </div>
                  {/* Filtros */}
                  <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 6, marginBottom: 10, scrollbarWidth: "none" }}>
                    {GUSTO_FILTERS.map(f => (
                      <button key={f.id} onClick={() => { setGustoFilter(f.id); setGustoExpanded(null); }}
                        style={{ padding: "6px 10px", borderRadius: 20, border: `1.5px solid ${gustoFilter === f.id ? C.primary : C.accent}`,
                          background: gustoFilter === f.id ? C.light : C.card, color: gustoFilter === f.id ? C.dark : C.soft,
                          fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "'Nunito',sans-serif", whiteSpace: "nowrap" }}>
                        {f.emoji} {f.label}
                      </button>
                    ))}
                  </div>
                  {unique.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 20, color: C.soft, fontSize: 12 }}>Sin registros en esta categoría</div>
                  ) : unique.map(meal => {
                    const cacheKey = meal.food?.toLowerCase().trim();
                    const recipe = recipes[cacheKey];
                    const isExp = gustoExpanded === meal.id;
                    return (
                      <div key={meal.id} style={{ background: C.card, borderRadius: 14, marginBottom: 8, boxShadow: "0 2px 7px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                        <div onClick={() => setGustoExpanded(isExp ? null : meal.id)}
                          style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                          <span style={{ fontSize: 22, flexShrink: 0 }}>{MEAL_EMOJIS[meal.category] || "🍽"}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meal.food}</div>
                            <div style={{ fontSize: 11, color: C.mid }}>{meal.appetite} · {meal.date}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {recipe?.nutricion && <span style={{ fontSize: 10, fontWeight: 700, color: C.orange, background: `${C.orange}15`, borderRadius: 6, padding: "1px 5px" }}>🔥 {recipe.nutricion.calorias} kcal</span>}
                            <span style={{ fontSize: 12, color: C.soft, transition: "transform .2s", transform: isExp ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                          </div>
                        </div>
                        {isExp && recipe && (
                          <div style={{ padding: "0 14px 14px" }}>
                            <div style={{ background: C.light, borderRadius: 12, padding: 12 }}>
                              {recipe.ingredientes && (
                                <>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>🧾 Ingredientes</div>
                                  {recipe.ingredientes.map((ing, k) => (
                                    <div key={k} style={{ fontSize: 12, color: C.text, padding: "2px 0", display: "flex", gap: 6 }}>
                                      <span>{ing.emoji || "•"}</span>
                                      <span><b>{ing.nombre}</b> — {ing.cantidad}</span>
                                    </div>
                                  ))}
                                </>
                              )}
                              {recipe.pasos && (
                                <>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: "uppercase", letterSpacing: 0.5, margin: "10px 0 6px" }}>📝 Preparación</div>
                                  {recipe.pasos.map((paso, k) => (
                                    <div key={k} style={{ fontSize: 12, color: C.text, padding: "3px 0", display: "flex", gap: 6 }}>
                                      <span style={{ fontWeight: 800, color: C.primary, flexShrink: 0 }}>{paso.numero}.</span>
                                      <span>{paso.instruccion}</span>
                                    </div>
                                  ))}
                                </>
                              )}
                              {recipe.nutricion && (
                                <>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, textTransform: "uppercase", letterSpacing: 0.5, margin: "10px 0 6px" }}>🔥 Nutrición</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                                    {[
                                      { label: "Kcal", val: recipe.nutricion.calorias, emoji: "🔥" },
                                      { label: "Proteína", val: recipe.nutricion.proteinas, emoji: "🥩" },
                                      { label: "Carbos", val: recipe.nutricion.carbohidratos, emoji: "🌾" },
                                      { label: "Grasas", val: recipe.nutricion.grasas, emoji: "🫒" },
                                      { label: "Fibra", val: recipe.nutricion.fibra, emoji: "🌿" },
                                      { label: "Hierro", val: recipe.nutricion.hierro, emoji: "🩸" },
                                    ].map((m, k) => (
                                      <div key={k} style={{ textAlign: "center", background: `${C.primary}08`, borderRadius: 8, padding: "6px 4px" }}>
                                        <div style={{ fontSize: 12 }}>{m.emoji}</div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{m.val}</div>
                                        <div style={{ fontSize: 9, color: C.mid }}>{m.label}</div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                              {recipe.tips && recipe.tips.length > 0 && (
                                <>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: 0.5, margin: "10px 0 6px" }}>💡 Tips</div>
                                  {recipe.tips.map((t, k) => (
                                    <div key={k} style={{ fontSize: 11, color: C.mid, padding: "2px 0" }}>• {t}</div>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                        {isExp && !recipe && (
                          <div style={{ padding: "8px 14px 14px", textAlign: "center" }}>
                            <p style={{ fontSize: 12, color: C.mid, margin: "0 0 8px" }}>Receta no disponible — actualiza para adaptarla a {ageLabel}</p>
                            <button onClick={async (e) => {
                              e.stopPropagation();
                              const btn = e.currentTarget; btn.disabled = true; btn.textContent = "⏳ Descargando...";
                              try {
                                const raw = await callModel({
                                  messages: [{ role: "user", content: `Receta corta para bebé/niño (${ageLabel}, ${STAGE_DESC[stage]}): "${meal.food}". Máximo 5 ingredientes y 4 pasos. Incluye información nutricional estimada. SOLO JSON compacto: {"ingredientes":[{"nombre":"...","cantidad":"...","emoji":"..."}],"pasos":[{"numero":1,"instruccion":"...","tiempo":"..."}],"nutricion":{"calorias":150,"proteinas":"6g","carbohidratos":"18g","grasas":"4g","fibra":"2g","hierro":"1.5mg","calcio":"80mg"},"tips":["..."]}` }],
                                  system: "Responde ÚNICAMENTE con JSON válido. Sé breve y conciso. Sin texto extra, sin backticks.",
                                  maxTokens: 1200, useSonnet,
                                });
                                const clean = raw.replace(/```json|```/g, "").trim();
                                let parsed; try { parsed = JSON.parse(clean); } catch { const m = clean.match(/\{[\s\S]*\}/); if(m){ let f=m[0]; const o=(f.match(/\[/g)||[]).length-(f.match(/\]/g)||[]).length; const b=(f.match(/\{/g)||[]).length-(f.match(/\}/g)||[]).length; for(let x=0;x<o;x++)f+="]"; for(let x=0;x<b;x++)f+="}"; parsed=JSON.parse(f); } }
                                if (parsed) {
                                  const rc = DB.get("na-plan-recipes") || {};
                                  rc[cacheKey] = parsed;
                                  DB.set("na-plan-recipes", rc);
                                  setGustoExpanded(null); setTimeout(() => setGustoExpanded(meal.id), 50);
                                }
                              } catch (err) { console.error(err); btn.textContent = "❌ Error"; }
                            }}
                              style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: grad, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
                              🔄 Actualizar receta ({useSonnet ? "✨ Sonnet" : "⚡ Haiku"})
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── SALUD ──────────────────────────────────────────── */}
        {tab === "health" && (
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: grad, borderRadius: 18, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Crecimiento · OMS 2006</p>
                <p style={{ margin: "2px 0 0", color: "#fff", fontWeight: 900, fontSize: 17 }}>{profile.name || "Bebé"}{age ? ` · ${age.label}` : ""}</p>
              </div>
              <span style={{ fontSize: 36 }}>{"\u{1F4CF}"}</span>
            </div>

            {!profile.birthDate && (
              <div onClick={() => setTab("settings")} style={{ background: C.light, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center", cursor: "pointer", border: `1.5px dashed ${C.primary}` }}>
                <span style={{ fontSize: 22 }}>{"\u2699\uFE0F"}</span>
                <p style={{ margin: 0, fontSize: 13, color: C.deep, fontWeight: 700 }}>Configura la fecha de nacimiento en Opciones para calcular percentiles {"\u2192"}</p>
              </div>
            )}

            <div style={{ background: C.card, borderRadius: 18, padding: 16, boxShadow: "0 2px 14px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ margin: 0, fontWeight: 900, color: C.deep, fontSize: 15 }}>Nueva medición</p>
              <div><label style={lSt}>Fecha de medición</label><input type="date" value={hForm.date} onChange={e => setHForm(f => ({ ...f, date: e.target.value }))} style={iSt} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={lSt}>Peso (kg) *</label><input type="number" step="0.1" min="0" placeholder="ej. 9.5" value={hForm.weight} onChange={e => setHForm(f => ({ ...f, weight: e.target.value }))} style={iSt} /></div>
                <div><label style={lSt}>Talla (cm) *</label><input type="number" step="0.1" min="0" placeholder="ej. 75.0" value={hForm.height} onChange={e => setHForm(f => ({ ...f, height: e.target.value }))} style={iSt} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={lSt}>Per. Cefálico (cm)</label><input type="number" step="0.1" min="0" placeholder="Opcional" value={hForm.hc} onChange={e => setHForm(f => ({ ...f, hc: e.target.value }))} style={{ ...iSt, borderStyle: "dashed" }} /></div>
                <div><label style={lSt}>Per. Abdominal (cm)</label><input type="number" step="0.1" min="0" placeholder="Opcional" value={hForm.ac} onChange={e => setHForm(f => ({ ...f, ac: e.target.value }))} style={{ ...iSt, borderStyle: "dashed" }} /></div>
              </div>
              <p style={{ margin: "-4px 0 0", fontSize: 11, color: C.soft }}>* Requerido para percentil · Los campos opcionales se guardan como registro</p>
              <button onClick={calcHealth} disabled={!hForm.weight && !hForm.height} style={{ padding: 13, borderRadius: 14, border: "none", background: !hForm.weight && !hForm.height ? C.accent : grad, color: !hForm.weight && !hForm.height ? C.mid : "#fff", fontWeight: 900, fontSize: 15, cursor: !hForm.weight && !hForm.height ? "not-allowed" : "pointer", boxShadow: "0 4px 12px rgba(2,136,209,0.3)" }}>
                Calcular percentiles {"\u{1F4CA}"}
              </button>
            </div>

            {hResult && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ margin: 0, fontWeight: 900, color: C.deep, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>{"\u{1F4CA}"} Resultados · {hResult.date}</p>
                {[
                  hResult.results?.wfa && { key: "wfa", icon: "\u2696\uFE0F", label: "Peso para la edad", value: `${hResult.weight} kg`, ...hResult.results.wfa },
                  hResult.results?.lfa && { key: "lfa", icon: "\u{1F4CF}", label: "Talla para la edad", value: `${hResult.height} cm`, ...hResult.results.lfa },
                  hResult.results?.hcfa && { key: "hcfa", icon: "\u{1F9E0}", label: "Per. cefálico p/edad", value: `${hResult.hc} cm`, ...hResult.results.hcfa },
                ].filter(Boolean).map(r => (
                  <PercentileCard key={r.key} r={r} />
                ))}

                {hResult.ac && (
                  <div style={{ background: C.light, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 22 }}>{"\u{1FA7A}"}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: C.text }}>Perímetro abdominal</p>
                      <p style={{ margin: 0, fontSize: 12, color: C.mid }}>{hResult.ac} cm · Registrado (sin referencia OMS para esta edad)</p>
                    </div>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.dark, marginLeft: "auto" }}>{hResult.ac}<span style={{ fontSize: 11 }}> cm</span></p>
                  </div>
                )}

                <div style={{ background: "#F3F0FF", borderRadius: 12, padding: "8px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 14 }}>{"\u2139\uFE0F"}</span>
                  <p style={{ margin: 0, fontSize: 11, color: "#5A4A9A" }}>Percentiles basados en <strong>OMS Child Growth Standards 2006</strong>. Esta información no reemplaza la evaluación del pediatra.</p>
                </div>
              </div>
            )}

            {healthRecs.length > 0 && (
              <div>
                <p style={{ margin: "0 0 10px", fontWeight: 900, color: C.deep, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Historial de mediciones</p>
                {healthRecs.map(rec => (
                  <div key={rec.id} style={{ background: C.card, borderRadius: 16, padding: "12px 14px", marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: C.text }}>{"\u{1F4C5}"} {rec.date}</p>
                      <button onClick={() => deleteHealthRec(rec.id)} style={{ background: "none", border: "none", color: C.accent, fontSize: 15, cursor: "pointer", padding: 0 }}>{"\u2715"}</button>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {rec.weight && <span style={{ fontSize: 12, background: C.light, color: C.dark, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{"\u2696\uFE0F"} {rec.weight}kg {rec.results?.wfa ? `P${rec.results.wfa.percentile}` : ""}</span>}
                      {rec.height && <span style={{ fontSize: 12, background: C.light, color: C.dark, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{"\u{1F4CF}"} {rec.height}cm {rec.results?.lfa ? `P${rec.results.lfa.percentile}` : ""}</span>}
                      {rec.hc && <span style={{ fontSize: 12, background: C.light, color: C.dark, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{"\u{1F9E0}"} PC {rec.hc}cm {rec.results?.hcfa ? `P${rec.results.hcfa.percentile}` : ""}</span>}
                      {rec.ac && <span style={{ fontSize: 12, background: C.light, color: C.mid, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{"\u{1FA7A}"} PA {rec.ac}cm</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ───────────────────────────────────────── */}
        {tab === "settings" && (
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: grad, borderRadius: 18, padding: "16px 18px", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 38 }}>{"\u{1F476}"}</span>
              <div>
                <p style={{ margin: 0, color: "#fff", fontWeight: "bold", fontSize: 16 }}>{profile.name || "Bebé"}</p>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{age ? `${age.label} · ${STAGE_DESC[stage]}` : "Fecha no configurada"}</p>
              </div>
            </div>

            {/* Model switch */}
            <div style={{ background: C.card, borderRadius: 18, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: C.deep, fontSize: 14 }}>Modo de IA</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.mid }}>Controla el modelo utilizado en toda la app</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.light, borderRadius: 14, padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{useSonnet ? "\u2728" : "\u26A1"}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: useSonnet ? C.orange : C.dark }}>{useSonnet ? "Modo Sonnet" : "Modo Haiku"}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.mid }}>{useSonnet ? "Mayor calidad · más tokens" : "Económico · ~20x más barato"}</p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    const next = !useSonnet;
                    setUseSonnet(next);
                    setRecipe(null);
                    DB.set("na-sonnet", next);
                  }}
                  style={{ width: 52, height: 28, borderRadius: 14, background: useSonnet ? "linear-gradient(135deg,#FFB300,#FF8F00)" : grad, cursor: "pointer", position: "relative", transition: "background .3s", flexShrink: 0, boxShadow: `0 2px 8px ${useSonnet ? "rgba(255,179,0,0.4)" : "rgba(2,136,209,0.4)"}` }}
                >
                  <div style={{ position: "absolute", top: 3, left: useSonnet ? 26 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left .25s", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                {[
                  { label: "\u26A1 Haiku", desc: "Chat ~$0.0003/msg\nReceta ~$0.001", active: !useSonnet, color: C.dark },
                  { label: "\u2728 Sonnet", desc: "Chat ~$0.006/msg\nReceta ~$0.018", active: useSonnet, color: C.orange },
                ].map(m => (
                  <div key={m.label} style={{ background: m.active ? `${m.color}15` : "#F8F8F8", borderRadius: 12, padding: "10px 12px", border: `1.5px solid ${m.active ? m.color : "transparent"}` }}>
                    <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 13, color: m.active ? m.color : C.soft }}>{m.label} {m.active && "\u2713"}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.mid, whiteSpace: "pre-line" }}>{m.desc}</p>
                  </div>
                ))}
              </div>
              {useSonnet && (
                <div style={{ marginTop: 10, background: "#FFF8E1", borderRadius: 10, padding: "8px 12px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14 }}>{"\u26A0\uFE0F"}</span>
                  <p style={{ margin: 0, fontSize: 11, color: "#7A5800" }}>Sonnet activo: respuestas más detalladas pero mayor consumo de tokens. Cambia a Haiku para economizar.</p>
                </div>
              )}
            </div>

            {/* Profile form */}
            <div style={{ background: C.card, borderRadius: 18, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, color: C.deep, fontSize: 14 }}>Perfil del bebé</h3>
                {!editing && profile.name && (
                  <button onClick={() => setEditing(true)}
                    style={{ padding: "6px 14px", borderRadius: 10, border: `1.5px solid ${C.primary}44`, background: C.light, color: C.primary, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
                    ✏️ Editar
                  </button>
                )}
              </div>
              <div><label style={lSt}>Nombre</label><input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Nombre del bebé" disabled={!editing && !!profile.name} style={{ ...iSt, opacity: (!editing && profile.name) ? 0.7 : 1, background: (!editing && profile.name) ? "#F5F5F5" : C.light }} /></div>
              <div>
                <label style={lSt}>Fecha de nacimiento</label>
                <input type="date" value={profile.birthDate} onChange={e => setProfile(p => ({ ...p, birthDate: e.target.value }))} disabled={!editing && !!profile.birthDate} style={{ ...iSt, opacity: (!editing && profile.birthDate) ? 0.7 : 1, background: (!editing && profile.birthDate) ? "#F5F5F5" : C.light }} />
                {profile.birthDate && age && (
                  <div style={{ marginTop: 8, background: C.light, borderRadius: 10, padding: "8px 12px", display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 18 }}>{"\u{1F4C5}"}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.dark }}>{age.label}</p>
                      <p style={{ margin: 0, fontSize: 11, color: C.mid }}>Etapa: {STAGE_DESC[stage]}</p>
                    </div>
                  </div>
                )}
              </div>
              <div><label style={lSt}>Alergias conocidas</label><input value={profile.allergies} onChange={e => setProfile(p => ({ ...p, allergies: e.target.value }))} placeholder="ej. Huevo, nueces..." disabled={!editing && !!profile.name} style={{ ...iSt, opacity: (!editing && profile.name) ? 0.7 : 1, background: (!editing && profile.name) ? "#F5F5F5" : C.light }} /></div>
              <div><label style={lSt}>Notas del pediatra</label><textarea value={profile.notes} onChange={e => setProfile(p => ({ ...p, notes: e.target.value }))} placeholder="Instrucciones especiales..." rows={3} disabled={!editing && !!profile.name} style={{ ...iSt, resize: "none", opacity: (!editing && profile.name) ? 0.7 : 1, background: (!editing && profile.name) ? "#F5F5F5" : C.light }} /></div>
              {(editing || !profile.name) ? (
                <button onClick={() => {
                  if (editing && profile.name) {
                    // Editando perfil existente: confirmar limpieza de caché
                    if (confirm("⚠️ Al guardar cambios en el perfil, se eliminarán las recetas del caché para adaptarse a las nuevas indicaciones (alergias, notas del pediatra, etapa).\n\n¿Deseas continuar?")) {
                      DB.set("na-plan-recipes", null);
                      DB.set("na-plan-recipes-meta", { createdAt: new Date().toISOString() });
                      DB.set("na-confirm-week", null);
                      DB.set("na-confirm-day", null);
                      DB.set("na-shopping-week", null);
                      DB.set("na-shopping-day", null);
                      saveProfile();
                      setEditing(false);
                    }
                  } else {
                    // Primera vez guardando
                    saveProfile();
                    setEditing(false);
                  }
                }} style={{ padding: 12, borderRadius: 13, border: "none", background: saved ? C.green : grad, color: "#fff", fontWeight: "bold", fontSize: 14, cursor: "pointer", transition: "background .3s" }}>
                  {saved ? "\u2713 Guardado!" : "Guardar perfil"}
                </button>
              ) : (
                <div style={{ padding: "10px 14px", borderRadius: 12, background: `${C.green}12`, border: `1.5px solid ${C.green}33`, textAlign: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>✅ Perfil guardado</span>
                </div>
              )}
            </div>

            {/* API architecture */}
            <div style={{ background: C.card, borderRadius: 18, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 12px", color: C.deep, fontSize: 14 }}>{"\u{1F3D7}\uFE0F"} Arquitectura de APIs</h3>
              {[
                { color: C.dark, icon: "\u{1F5C4}", label: "TheMealDB", desc: "Base de recetas · Gratis · Sin clave", hits: savings.mealDBHits },
                { color: C.green, icon: "\u{1F957}", label: "Open Food Facts", desc: "Nutrición real · Gratis · Sin clave", hits: savings.offHits },
                { color: C.purple, icon: "\u26A1", label: `IA: ${useSonnet ? "Sonnet \u2728" : "Haiku \u26A1"}`, desc: useSonnet ? "Calidad máxima · más tokens" : "Adaptación bebé · ~20x más barato", hits: null },
                { color: C.orange, icon: "\u{1F4BE}", label: "Cache diario", desc: "Receta guardada · 0 tokens al re-abrir", hits: savings.recipeCached },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 11 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${row.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{row.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{row.label}</p>
                      {row.hits !== null && <span style={{ fontSize: 11, background: `${row.color}20`, color: row.color, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{row.hits} usos</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: C.mid }}>{row.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Token savings */}
            <div style={{ background: "linear-gradient(135deg,#F3F0FF,#E8E4FF)", borderRadius: 16, padding: 16, border: "1px solid #D0C8FF" }}>
              <h3 style={{ margin: "0 0 10px", color: "#4A3A8A", fontSize: 14 }}>{"\u26A1"} Optimizaciones activas</h3>
              {[
                ["\u2702\uFE0F Historial recortado", "Solo últimos 5 mensajes por chat"],
                ["\u{1F3AF} max_tokens ajustado", "550 chat · 900 receta"],
                ["\u26A1 Haiku para todo", "~20x más barato que Sonnet"],
                ["\u{1F4BE} Caché diario", "Receta generada 1 sola vez/día"],
                ["\u{1F193} APIs externas", "Nutrición y recetas sin tokens"],
              ].map(([t, d]) => (
                <div key={t} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#4A3A8A", minWidth: 155 }}>{t}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#7A70AA" }}>{d}</p>
                </div>
              ))}
            </div>

            {/* Respaldo de datos */}
            <div style={{ background: C.card, borderRadius: 18, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 8px", color: C.deep, fontSize: 14 }}>{"\u{1F4BE}"} Respaldo de datos</h3>
              <p style={{ margin: "0 0 12px", fontSize: 11, color: C.mid, lineHeight: 1.5 }}>
                Exporta un archivo JSON con todos tus datos (perfil, comidas, recetas, planes, salud). Guárdalo en un lugar seguro para restaurar en otro dispositivo.
              </p>
              <button onClick={() => {
                const BACKUP_KEYS = ["na-profile","na-meals","na-health","na-savings","na-sonnet","na-plan-recipes","na-plan-recipes-meta","na-age-semester","na-confirm-week","na-confirm-day","na-shopping-week","na-shopping-day","na-custom-nutri","na-custom-suggestion","na-custom-snack","na-custom-dessert","na-custom-tip"];
                const keys = [...BACKUP_KEYS];
                try { for (let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k?.startsWith("na-plan-week-")||k?.startsWith("na-plan-day-")||k?.startsWith("na-confirming-")) keys.push(k); } } catch {}
                const data = { _app:"NutriAndr\u00e9", _version:"1.0", _fecha:new Date().toISOString() };
                [...new Set(keys)].forEach(k => { try { const v=localStorage.getItem(k); if(v) data[k]=JSON.parse(v); } catch {} });
                const blob = new Blob([JSON.stringify(data,null,2)], { type:"application/json" });
                Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:`nutriandre-backup-${new Date().toISOString().split("T")[0]}.json` }).click();
              }}
                style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: grad, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif", marginBottom: 8 }}>
                {"\u2B07"} Exportar respaldo completo
              </button>
              <input ref={backupFileRef} type="file" accept=".json" style={{ display: "none" }}
                onChange={async e => {
                  const file = e.target.files[0]; if (!file) return;
                  try {
                    const data = JSON.parse(await file.text());
                    if (!data._app) { setBackupMsg({ ok:false, msg:"Archivo no v\u00e1lido" }); return; }
                    let count = 0;
                    Object.entries(data).forEach(([k,v]) => { if(k.startsWith("_")) return; try { localStorage.setItem(k,JSON.stringify(v)); count++; } catch {} });
                    setBackupMsg({ ok:true, msg:`\u2705 ${count} datos restaurados. Recargando\u2026` });
                    setTimeout(() => window.location.reload(), 1500);
                  } catch { setBackupMsg({ ok:false, msg:"Error al leer el archivo" }); }
                }} />
              <button onClick={() => { if (confirm("\u00bfRestaurar datos desde un respaldo?\n\nEsto REEMPLAZAR\u00c1 todos los datos actuales.")) backupFileRef.current?.click(); }}
                style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px solid ${C.orange}44`, background: `${C.orange}08`, color: C.orange, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
                {"\u2B06"} Importar respaldo
              </button>
              {backupMsg && (
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: backupMsg.ok ? `${C.green}15` : `${C.red}15`, border: `1px solid ${backupMsg.ok ? C.green : C.red}44`, fontSize: 12, color: backupMsg.ok ? C.green : C.red, fontWeight: 600 }}>
                  {backupMsg.msg}
                </div>
              )}
            </div>

            {/* Reactivar planes */}
            <div style={{ background: C.card, borderRadius: 18, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 12px", color: C.deep, fontSize: 14 }}>{"\u{1F504}"} Reactivar planes</h3>
              <p style={{ margin: "0 0 12px", fontSize: 11, color: C.mid }}>Si necesitas generar un nuevo plan antes de que expire el periodo, puedes reactivar el botón de confirmación manualmente.</p>
              {!reactivatedWeek ? (
                <button onClick={() => { DB.set("na-confirm-week", null); DB.set("na-shopping-week", null); setReactivatedWeek(true); }}
                  style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: C.deep, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif", marginBottom: 8 }}>
                  {"\u{1F4C5}"} Reactivar plan semanal
                </button>
              ) : (
                <div style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px solid ${C.primary}44`, background: C.light, textAlign: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.primary, fontFamily: "'Nunito',sans-serif" }}>{"\u2705"} Plan semanal reactivado</span>
                </div>
              )}
              {!reactivatedDay ? (
                <button onClick={() => { DB.set("na-confirm-day", null); DB.set("na-shopping-day", null); setReactivatedDay(true); }}
                  style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: C.deep, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
                  {"\u{1F37D}\uFE0F"} Reactivar plan diario
                </button>
              ) : (
                <div style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px solid ${C.primary}44`, background: C.light, textAlign: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.primary, fontFamily: "'Nunito',sans-serif" }}>{"\u2705"} Plan diario reactivado</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.card, borderTop: `1px solid ${C.light}`, display: "flex", boxShadow: "0 -4px 16px rgba(0,0,0,0.07)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "9px 0 7px", border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <span style={{ fontSize: 17 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: tab === t.id ? C.dark : C.soft }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 14, height: 2.5, borderRadius: 2, background: C.dark }} />}
          </button>
        ))}
      </div>

      {/* Botón flotante reload */}
      <button onClick={() => window.location.reload()}
        style={{ position: "fixed", bottom: 80, left: 12, width: 36, height: 36, borderRadius: "50%",
          background: C.card, border: `1px solid ${C.accent}`, color: C.primary, fontSize: 16,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)", zIndex: 100 }}>
        {"\u21BB"}
      </button>

      {showModal && <RecipeModal recipe={recipe} onClose={() => setShowModal(false)} />}
      {showSnackModal && <RecipeModal recipe={snackRecipe} onClose={() => setShowSnackModal(false)} />}
      {showDessertModal && <RecipeModal recipe={dessertRecipe} onClose={() => setShowDessertModal(false)} />}
    </div>
  );
}
