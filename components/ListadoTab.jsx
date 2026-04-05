"use client";
import { useState, useEffect } from "react";
import { C, grad } from "@/lib/constants";
import DB from "@/lib/storage";

export default function ListadoTab() {
  const [subTab, setSubTab] = useState("week");
  const [weekList, setWeekList] = useState(null);
  const [dayList, setDayList] = useState(null);

  useEffect(() => {
    const w = DB.get("na-shopping-week"); if (w) setWeekList(w);
    const d = DB.get("na-shopping-day"); if (d) setDayList(d);
  }, []);

  // Escuchar cambios desde PlanTab via storage event o polling
  useEffect(() => {
    const interval = setInterval(() => {
      const w = DB.get("na-shopping-week");
      const d = DB.get("na-shopping-day");
      if (JSON.stringify(w) !== JSON.stringify(weekList)) setWeekList(w);
      if (JSON.stringify(d) !== JSON.stringify(dayList)) setDayList(d);
    }, 1000);
    return () => clearInterval(interval);
  }, [weekList, dayList]);

  const toggleItem = (listKey, setter, list, idx) => {
    const updated = list.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item);
    setter(updated);
    DB.set(listKey, updated);
  };

  const pill = (active) => ({
    flex: 1, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer",
    fontWeight: 800, fontSize: 12, fontFamily: "'Nunito',sans-serif",
    background: active ? grad : C.light, color: active ? "#fff" : C.mid,
    transition: "all .2s",
  });

  const renderList = (list, listKey, setter) => {
    if (!list || list.length === 0) return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 12 }}>
        <span style={{ fontSize: 64 }}>😩</span>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.soft, textAlign: "center" }}>Nada que mostrar...</p>
        <p style={{ fontSize: 12, color: C.mid, textAlign: "center" }}>Genera un plan y presiona "Confirmado" para crear tu lista de compras</p>
      </div>
    );

    const total = list.length;
    const checked = list.filter(i => i.checked).length;

    return (
      <>
        {/* Progress */}
        <div style={{ background: C.card, borderRadius: 14, padding: "12px 16px", marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>🛒 Lista de compras</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: checked === total ? C.green : C.mid }}>{checked}/{total}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: C.light, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: checked === total ? C.green : grad, width: `${total > 0 ? (checked / total) * 100 : 0}%`, transition: "width .3s" }} />
          </div>
        </div>

        {/* Items */}
        {list.map((item, idx) => (
          <div key={idx} onClick={() => toggleItem(listKey, setter, list, idx)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", marginBottom: 6,
              background: C.card, borderRadius: 12, cursor: "pointer",
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              border: `1.5px solid ${item.checked ? C.green + "44" : C.accent}`,
              opacity: item.checked ? 0.6 : 1, transition: "all .2s" }}>
            {/* Checkbox */}
            <div style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${item.checked ? C.green : C.soft}`,
              background: item.checked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all .2s" }}>
              {item.checked && <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>✓</span>}
            </div>
            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, textDecoration: item.checked ? "line-through" : "none" }}>
                {item.emoji || "•"} {item.nombre}
              </div>
              <div style={{ fontSize: 11, color: C.mid }}>{item.cantidad}</div>
            </div>
          </div>
        ))}

        {checked === total && total > 0 && (
          <div style={{ textAlign: "center", padding: 16, marginTop: 8 }}>
            <span style={{ fontSize: 40 }}>🎉</span>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.green, marginTop: 8 }}>Lista completa</p>
          </div>
        )}
      </>
    );
  };

  return (
    <div style={{ padding: "0 16px 20px" }}>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: C.light, borderRadius: 14, padding: 4 }}>
        <button onClick={() => setSubTab("week")} style={pill(subTab === "week")}>📅 Semanal</button>
        <button onClick={() => setSubTab("day")} style={pill(subTab === "day")}>🍽 Diario</button>
      </div>

      {subTab === "week" && renderList(weekList, "na-shopping-week", setWeekList)}
      {subTab === "day" && renderList(dayList, "na-shopping-day", setDayList)}
    </div>
  );
}
