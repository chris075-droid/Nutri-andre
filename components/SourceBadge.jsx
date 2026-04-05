"use client";

export default function SourceBadge({ label, color }) {
  return (
    <span style={{
      fontSize: 10, background: `${color}22`, color,
      border: `1px solid ${color}55`, borderRadius: 20,
      padding: "2px 8px", fontWeight: 700,
    }}>
      {label}
    </span>
  );
}
