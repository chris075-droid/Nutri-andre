"use client";

import { useState, useEffect } from "react";
import { C } from "@/lib/constants";

export default function NutriBar({ label, value, max, color, unit }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    setTimeout(() => setW(Math.min((parseFloat(value) / max) * 100, 100)), 120);
  }, [value, max]);

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: C.mid, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}{unit}</span>
      </div>
      <div style={{ height: 8, borderRadius: 10, background: C.light }}>
        <div style={{
          height: "100%", width: `${w}%`, background: color,
          borderRadius: 10, transition: "width 1.2s ease",
        }} />
      </div>
    </div>
  );
}
