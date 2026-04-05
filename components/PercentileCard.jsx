"use client";

// Extraído como componente independiente para evitar
// el bug de useEffect/useState dentro de .map()

import { useState, useEffect } from "react";
import { C } from "@/lib/constants";
import { percentileInfo } from "@/lib/percentiles";

export default function PercentileCard({ r }) {
  const info = percentileInfo(r.percentile);
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  return (
    <div style={{ background: info.bg, borderRadius: 18, padding: "14px 16px", border: `1.5px solid ${info.color}30` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>{r.icon}</span>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: C.text }}>{r.label}</p>
            <p style={{ margin: 0, fontSize: 12, color: C.mid }}>{r.value} · Mediana: {r.median?.toFixed(1)}</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: info.color, lineHeight: 1 }}>P{r.percentile}</p>
          <p style={{ margin: 0, fontSize: 10, color: info.color, fontWeight: 700 }}>Z: {r.z > 0 ? "+" : ""}{r.z}</p>
        </div>
      </div>

      {/* Percentile track */}
      <div style={{ position: "relative", height: 28, background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "inset 0 1px 4px rgba(0,0,0,0.08)" }}>
        {[{ w: 3, color: "#FFCDD2" }, { w: 12, color: "#FFE0B2" }, { w: 70, color: "#C8F5EB" }, { w: 12, color: "#FFE0B2" }, { w: 3, color: "#FFCDD2" }].map((z, i) => (
          <div key={i} style={{ position: "absolute", top: 0, left: `${[0, 3, 15, 85, 97][i]}%`, width: `${z.w}%`, height: "100%", background: z.color, opacity: 0.7 }} />
        ))}
        {["P3", "P15", "P50", "P85", "P97"].map((l, i) => (
          <div key={l} style={{ position: "absolute", top: 0, left: `${[3, 15, 50, 85, 97][i]}%`, transform: "translateX(-50%)", height: "100%", display: "flex", alignItems: "center" }}>
            <div style={{ width: 1, height: 14, background: "rgba(0,0,0,0.15)" }} />
          </div>
        ))}
        {["P3", "P15", "P50", "P85", "P97"].map((l, i) => (
          <span key={l + "l"} style={{ position: "absolute", bottom: 2, left: `${[3, 15, 50, 85, 97][i]}%`, transform: "translateX(-50%)", fontSize: 8, color: "rgba(0,0,0,0.4)", fontWeight: 700 }}>{l}</span>
        ))}
        <div style={{
          position: "absolute", top: 2,
          left: `${animated ? Math.min(Math.max(r.percentile, 1.5), 98.5) : 50}%`,
          transform: "translateX(-50%)", transition: "left 1.2s ease",
          width: 22, height: 22, borderRadius: "50%", background: info.color,
          border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
        </div>
      </div>

      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: info.color, background: "#fff", padding: "3px 10px", borderRadius: 20 }}>{info.label}</span>
        {r.key === "wfa" && (r.z < -2 || r.z > 2) && (
          <span style={{ fontSize: 11, color: "#EF5350", fontWeight: 700 }}>{"\u26A0\uFE0F"} Consulta al pediatra</span>
        )}
      </div>
    </div>
  );
}
