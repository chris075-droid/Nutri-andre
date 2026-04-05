// NutriAndré — API de IA (usa proxy /api/ai en vez de llamar directo a Anthropic)
import DB from "./storage";
import { fetchMealDB, fetchNutrition } from "./api-external";

const CHAT_SYSTEM = (name, age) =>
  `Eres NutriAndré, asesora nutrición infantil para ${name} (${age}). Español. Tono cálido. Máx 3 párrafos. Emojis ocasionales. Problemas graves→pediatra.`;

export { CHAT_SYSTEM };

export async function callModel({ messages, system, maxTokens = 500, useSonnet = false }) {
  const model = useSonnet ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";
  const r = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`API error ${r.status}: ${err}`);
  }
  const d = await r.json();
  return d.content?.[0]?.text || "";
}

function buildAdaptPrompt(dish, ageLabel, mealBase) {
  if (mealBase) {
    const ings = mealBase.ingredients.slice(0, 6).map(i => `${i.name} ${i.measure}`).join(", ");
    return `Adapta para bebé ${ageLabel}: "${dish}". Base: ${ings}. Instrucciones: ${mealBase.instructions.substring(0, 200)}
JSON SOLO: {"nombre":"...","emoji":"...","descripcion":"1 oración","tiempo":"...","porciones":"2","ingredientes":[{"nombre":"...","cantidad":"...","emoji":"..."}],"pasos":[{"numero":1,"instruccion":"...","tiempo":"..."}],"tips":["...","..."],"beneficios":["...","..."],"vitaminas":["..."]}`;
  }
  return `Receta bebé ${ageLabel}: "${dish}". JSON SOLO:
{"nombre":"...","emoji":"...","descripcion":"1 oración","tiempo":"...","porciones":"2","ingredientes":[{"nombre":"...","cantidad":"...","emoji":"..."}],"pasos":[{"numero":1,"instruccion":"...","tiempo":"..."}],"tips":["...","..."],"beneficios":["...","..."],"vitaminas":["..."]}`;
}

export const trimChat = (msgs) => msgs.length <= 6 ? msgs : [msgs[0], ...msgs.slice(-5)];

export async function buildRecipe(suggestion, ageLabel, useSonnet = false, forceRefresh = false) {
  const dishKey = suggestion.dish.toLowerCase().trim();
  const allRecipes = DB.get("na-plan-recipes") || {};
  if (allRecipes[dishKey] && !forceRefresh) return { recipe: allRecipes[dishKey], fromCache: true };

  let mealBase = null;
  let nutrition = null;

  // Haiku: usa TheMealDB + Open Food Facts + Haiku (híbrido, ahorra tokens)
  // Sonnet: usa solo Sonnet (mayor calidad, sin APIs externas)
  if (!useSonnet) {
    [mealBase, nutrition] = await Promise.all([
      fetchMealDB(suggestion.mealDB),
      fetchNutrition(suggestion.offTerm),
    ]);
  }

  const raw = await callModel({
    messages: [{ role: "user", content: buildAdaptPrompt(suggestion.dish, ageLabel, mealBase) }],
    system: useSonnet
      ? "Eres un chef experto en nutrición infantil. Responde ÚNICAMENTE con JSON válido. Sin texto extra, sin backticks. Incluye información nutricional estimada detallada."
      : "Responde ÚNICAMENTE con JSON válido. Sin texto extra, sin backticks.",
    maxTokens: useSonnet ? 1200 : 900,
    useSonnet,
  });

  let recipe;
  try {
    recipe = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error("Parsing error");
  }

  if (useSonnet) {
    // Sonnet genera todo: receta + nutrición estimada por IA
    recipe.nutricion = {
      calorias: recipe.nutricion?.calorias || "~150",
      proteinas: recipe.nutricion?.proteinas || "~6",
      carbohidratos: recipe.nutricion?.carbohidratos || "~18",
      grasas: recipe.nutricion?.grasas || "~4",
      hierro: recipe.nutricion?.hierro || "~2",
      calcio: recipe.nutricion?.calcio || "~80",
      fibra: recipe.nutricion?.fibra || "~2",
      vitaminas: recipe.vitaminas || ["A", "C", "D"],
      source: "Sonnet (estimado IA)",
    };
    recipe._sources = { recipe: "Sonnet", nutrition: "Sonnet (estimado IA)" };
  } else {
    // Haiku: nutrición real de Open Food Facts cuando está disponible
    recipe.nutricion = nutrition ? {
      ...nutrition,
      vitaminas: recipe.vitaminas || ["A", "C", "D"],
    } : {
      calorias: "~150", proteinas: "~6", carbohidratos: "~18", grasas: "~4",
      hierro: "~2", calcio: "~80", fibra: "~2", vitaminas: recipe.vitaminas || ["A", "C"],
      source: "Estimado (IA)",
    };
    recipe._sources = {
      recipe: mealBase ? "TheMealDB + Haiku" : "Haiku",
      nutrition: nutrition ? "Open Food Facts" : "IA estimado",
    };
  }

  allRecipes[dishKey] = recipe;
  DB.set("na-plan-recipes", allRecipes);
  return { recipe, fromCache: false };
}
