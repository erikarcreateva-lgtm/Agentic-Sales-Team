import type { Proposal } from "@/lib/proposals/types";

export default function ProposalList({ proposals }: { proposals: Proposal[] }) {
  if (proposals.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--color-stone)" }}>No proposals yet — click "Draft proposal" above to write one.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {proposals.map((p) => (
        <div key={p.id} style={{ border: "1px solid var(--color-linen)", borderRadius: "var(--radius-card-sm)", padding: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{p.title}</div>
          <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", margin: "0 0 12px" }}>{p.body}</p>
          {p.packages.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {p.packages.map((pkg, i) => (
                <div key={i} style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fog)" }}>
                  • {pkg}
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 11, color: "var(--color-stone)", marginTop: 10 }}>{new Date(p.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
