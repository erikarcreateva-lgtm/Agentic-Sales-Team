export default function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: "1px solid var(--color-linen)", borderRadius: "var(--radius-card-sm)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 28, fontWeight: 900, color: "var(--color-ink)", lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-fog)" }}>{label}</span>
    </div>
  );
}
