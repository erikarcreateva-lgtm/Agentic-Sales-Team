import type { LeadResearch } from "@/lib/leads/types";

export default function ResearchBrief({ research }: { research: LeadResearch | null }) {
  if (!research || !research.summary) {
    return <p style={{ fontSize: 13, color: "var(--color-stone)" }}>No brief yet — click "Write brief" above to have your Research helper vet this brand.</p>;
  }

  return (
    <div style={{ border: "1px solid var(--color-linen)", borderRadius: "var(--radius-card-sm)", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{research.summary}</p>

      {research.priorities.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-stone)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>What they care about</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {research.priorities.map((p, i) => (
              <div key={i} style={{ fontSize: 13 }}>• {p}</div>
            ))}
          </div>
        </div>
      )}

      {research.hooks.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-stone)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Hooks to use</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {research.hooks.map((h, i) => (
              <div key={i} style={{ fontSize: 13 }}>• {h}</div>
            ))}
          </div>
        </div>
      )}

      {research.angle && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-stone)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Best angle</div>
          <p style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>{research.angle}</p>
        </div>
      )}
    </div>
  );
}
