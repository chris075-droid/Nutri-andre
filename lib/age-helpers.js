// NutriAndré — Helpers de edad (versión original)

export function calcAge(birth) {
  if (!birth) return null;
  const m = (new Date() - new Date(birth)) / (1000 * 60 * 60 * 24 * 30.44);
  const months = Math.floor(m);
  if (months < 1) return { label: "Recién nacido", months, stage: "newborn" };
  if (months < 6) return { label: `${months} mes${months > 1 ? "es" : ""}`, months, stage: "infant" };
  if (months < 12) return { label: `${months} meses`, months, stage: "solids" };
  const y = Math.floor(months / 12), r = months % 12;
  return {
    label: r > 0 ? `${y} año${y > 1 ? "s" : ""} y ${r} mes${r > 1 ? "es" : ""}` : `${y} año${y > 1 ? "s" : ""}`,
    months,
    stage: months < 24 ? "toddler" : "preschool",
  };
}
