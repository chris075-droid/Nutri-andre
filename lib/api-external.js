// NutriAndré — APIs externas (TheMealDB + Open Food Facts)

export async function fetchMealDB(term) {
  try {
    const q = (term || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" ")[0];
    const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`);
    const d = await r.json();
    if (!d.meals?.[0]) return null;
    const m = d.meals[0];
    const ings = [];
    for (let i = 1; i <= 20; i++) {
      const ing = m[`strIngredient${i}`]?.trim();
      const mea = m[`strMeasure${i}`]?.trim();
      if (ing) ings.push({ name: ing, measure: mea || "" });
    }
    return {
      name: m.strMeal,
      category: m.strCategory,
      instructions: m.strInstructions?.substring(0, 400) || "",
      ingredients: ings.slice(0, 8),
      thumb: m.strMealThumb,
      source: "TheMealDB",
    };
  } catch {
    return null;
  }
}

export async function fetchNutrition(term) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,nutriments,nutrition_grades`;
    const r = await fetch(url);
    const d = await r.json();
    const p = d.products?.find(x => x.nutriments?.["energy-kcal_100g"] || x.nutriments?.energy_100g);
    if (!p) return null;
    const n = p.nutriments;
    const kcal = n["energy-kcal_100g"] || Math.round((n.energy_100g || 0) / 4.184);
    return {
      calorias: Math.round(kcal * 0.9),
      proteinas: ((n.proteins_100g || 0) * 0.9).toFixed(1),
      carbohidratos: ((n.carbohydrates_100g || 0) * 0.9).toFixed(1),
      grasas: ((n.fat_100g || 0) * 0.9).toFixed(1),
      fibra: ((n.fiber_100g || 0) * 0.9).toFixed(1),
      hierro: ((n.iron_100g ? n.iron_100g * 1000 : 1.5) * 0.9).toFixed(1),
      calcio: Math.round((n.calcium_100g ? n.calcium_100g * 1000 : 50) * 0.9),
      source: "Open Food Facts",
      grade: p.nutrition_grades?.toUpperCase() || null,
    };
  } catch {
    return null;
  }
}
