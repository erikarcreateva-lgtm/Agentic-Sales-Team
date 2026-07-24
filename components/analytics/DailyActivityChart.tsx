export default function DailyActivityChart({ perDay }: { perDay: { date: string; count: number }[] }) {
  const max = Math.max(1, ...perDay.map((d) => d.count));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
        {perDay.map((d) => {
          const [, m, day] = d.date.split("-");
          const label = new Date(Number(d.date.slice(0, 4)), Number(m) - 1, Number(day)).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const heightPct = Math.max(4, (d.count / max) * 100);
          return (
            <div
              key={d.date}
              title={`${label}: ${d.count} action${d.count === 1 ? "" : "s"}`}
              style={{ flex: 1, display: "flex", alignItems: "flex-end", height: "100%" }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${heightPct}%`,
                  background: d.count > 0 ? "var(--color-violet)" : "var(--color-linen)",
                  borderRadius: "4px 4px 0 0",
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "var(--color-stone)" }}>
        <span>{formatShort(perDay[0]?.date)}</span>
        <span>{formatShort(perDay[perDay.length - 1]?.date)}</span>
      </div>
    </div>
  );
}

function formatShort(date?: string): string {
  if (!date) return "";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
