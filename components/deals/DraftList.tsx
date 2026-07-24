import type { OutreachDraft } from "@/lib/outreach/types";
import type { Lead } from "@/lib/leads/types";

const KIND_LABEL: Record<OutreachDraft["kind"], string> = { pitch: "Pitch", "follow-up": "Follow-up" };

export default function DraftList({ drafts, lead }: { drafts: OutreachDraft[]; lead: Lead }) {
  if (drafts.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--color-stone)" }}>No messages yet — click "Follow up" above once you've pitched this brand.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {drafts.map((d) => {
        const mailto = lead.email
          ? `mailto:${lead.email}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`
          : null;
        return (
          <div key={d.id} style={{ border: "1px solid var(--color-linen)", borderRadius: "var(--radius-card-sm)", padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-violet)", background: "#f3effb", borderRadius: "var(--radius-pill)", padding: "2px 10px" }}>
                {KIND_LABEL[d.kind]}
              </span>
              <span style={{ fontSize: 15, fontWeight: 800 }}>{d.subject}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", margin: "0 0 10px" }}>{d.body}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {mailto ? (
                <a href={mailto} style={{ fontSize: 13, fontWeight: 700, color: "var(--color-red)" }}>
                  Open in mail app
                </a>
              ) : (
                <span style={{ fontSize: 12, color: "var(--color-stone)" }}>No email on file — copy this for a DM.</span>
              )}
              <span style={{ fontSize: 11, color: "var(--color-stone)" }}>{new Date(d.createdAt).toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
