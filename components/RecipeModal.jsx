"use client";

import { useState } from "react";
import { C, grad } from "@/lib/constants";
import SourceBadge from "./SourceBadge";
import NutriBar from "./NutriBar";

export default function RecipeModal({ recipe, onClose }) {
  const [sec, setSec] = useState("ingredientes");
  if (!recipe) return null;

  const tabs = [
    { id: "ingredientes", label: "\u{1F9FA} Ingredientes" },
    { id: "pasos", label: "\u{1F468}\u200D\u{1F373} Pasos" },
    { id: "nutricion", label: "\u{1F4CA} Nutrición" },
    { id: "tips", label: "\u{1F4A1} Tips" },
  ];
  const n = recipe.nutricion || {};

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(1,87,155,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", backdropFilter: "blur(5px)" }} onClick={onClose}>
      <div style={{ background: C.card, width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "24px 24px 0 0", maxHeight: "92vh", display: "flex", flexDirection: "column", animation: "slideUp .3s ease" }} onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div style={{ background: grad, padding: "18px 18px 14px", borderRadius: "24px 24px 0 0", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.25)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{"\u2715"}</button>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 46 }}>{recipe.emoji}</span>
            <div>
              <h2 style={{ margin: "0 0 2px", color: "#fff", fontSize: 17, fontWeight: 900, lineHeight: 1.3, paddingRight: 36 }}>{recipe.nombre}</h2>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.85)", fontSize: 12 }}>{recipe.descripcion}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>{"\u23F1"} {recipe.tiempo}</span>
            <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>{"\u{1F37D}"} {recipe.porciones} porción{recipe.porciones !== "1" ? "es" : ""}</span>
            {recipe._sources && <SourceBadge label={`\u{1F5C4} ${recipe._sources.recipe}`} color="#fff" />}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.light}`, background: C.card }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setSec(t.id)} style={{ flex: 1, padding: "10px 2px", border: "none", background: "none", fontSize: 11, fontWeight: 700, color: sec === t.id ? C.dark : C.soft, borderBottom: `2.5px solid ${sec === t.id ? C.dark : "transparent"}`, cursor: "pointer", transition: "color .2s" }}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>

          {sec === "ingredientes" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {recipe.ingredientes?.map((ing, i) => (
                <div key={i} style={{ background: C.light, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{ing.emoji}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>{ing.nombre}</p>
                    <p style={{ margin: 0, fontSize: 12, color: C.primary }}>{ing.cantidad}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sec === "pasos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recipe.pasos?.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: grad, color: "#fff", fontWeight: "bold", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p.numero}</div>
                  <div style={{ flex: 1, background: C.light, borderRadius: 12, padding: "10px 14px" }}>
                    <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.5 }}>{p.instruccion}</p>
                    {p.tiempo && <p style={{ margin: "4px 0 0", fontSize: 11, color: C.primary, fontWeight: 600 }}>{"\u23F1"} {p.tiempo}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {sec === "nutricion" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <SourceBadge label={`Fuente: ${n.source || "IA"}`} color={n.source === "Open Food Facts" ? C.green : C.orange} />
              </div>
              <div style={{ background: "linear-gradient(135deg,#E8F5E9,#C8E6C9)", borderRadius: 14, padding: 14, marginBottom: 16, textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 10, color: C.green, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Calorías por porción (~90g)</p>
                <p style={{ margin: "4px 0 0", fontSize: 34, fontWeight: "bold", color: "#2E7D32" }}>{n.calorias}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#66BB6A" }}>kcal</p>
              </div>
              <NutriBar label="Proteínas" value={n.proteinas} max={20} color={C.primary} unit="g" />
              <NutriBar label="Carbohidratos" value={n.carbohidratos} max={40} color={C.green} unit="g" />
              <NutriBar label="Grasas" value={n.grasas} max={15} color={C.orange} unit="g" />
              <NutriBar label="Fibra" value={n.fibra || "1"} max={8} color={C.mid} unit="g" />
              <NutriBar label="Hierro" value={n.hierro} max={10} color={C.red} unit="mg" />
              <NutriBar label="Calcio" value={n.calcio} max={300} color="#42A5F5" unit="mg" />
              {n.vitaminas?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: C.mid, textTransform: "uppercase", letterSpacing: 1 }}>Vitaminas destacadas</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {n.vitaminas.map((v, i) => <span key={i} style={{ background: C.light, color: C.deep, fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>{"\u2728"} {v}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {sec === "tips" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <p style={{ margin: "0 0 10px", fontWeight: 700, color: C.text, fontSize: 14 }}>{"\u{1F4A1}"} Para que lo acepte</p>
                {recipe.tips?.map((t, i) => (
                  <div key={i} style={{ background: C.light, borderRadius: 12, padding: "10px 14px", marginBottom: 8, display: "flex", gap: 10 }}>
                    <span style={{ color: C.primary, fontWeight: 700 }}>{i + 1}.</span>
                    <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.5 }}>{t}</p>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ margin: "0 0 10px", fontWeight: 700, color: C.text, fontSize: 14 }}>{"\u{1F33F}"} Beneficios nutricionales</p>
                {recipe.beneficios?.map((b, i) => (
                  <div key={i} style={{ background: "#F0FBF8", borderRadius: 12, padding: "10px 14px", marginBottom: 8, display: "flex", gap: 10 }}>
                    <span style={{ color: C.green }}>{"\u2713"}</span>
                    <p style={{ margin: 0, fontSize: 13, color: "#1A4A3A", lineHeight: 1.5 }}>{b}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
