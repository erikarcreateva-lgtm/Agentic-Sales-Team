"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptLeadAction, rejectLeadAction } from "@/lib/leads/actions";
import type { Lead } from "@/lib/leads/types";
import { primaryButtonStyle, secondaryButtonStyle } from "@/components/forms";

export default function PendingReview({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function accept(id: string) {
    setBusyId(id);
    await acceptLeadAction(id);
    setBusyId(null);
    router.refresh();
  }

  async function reject(id: string) {
    setBusyId(id);
    await rejectLeadAction(id);
    setBusyId(null);
    router.refresh();
  }

  if (leads.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--color-stone)" }}>Nothing waiting right now — brands your agents discover will show up here first.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {leads.map((lead) => (
        <div
          key={lead.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            border: "1px solid var(--color-linen)",
            borderRadius: "var(--radius-card-sm)",
            padding: "12px 16px",
            opacity: busyId === lead.id ? 0.6 : 1,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{lead.name}</div>
            {(lead.company || lead.platform) && (
              <div style={{ fontSize: 12, color: "var(--color-fog)" }}>{[lead.company, lead.platform].filter(Boolean).join(" · ")}</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flex: "none" }}>
            <button style={{ ...secondaryButtonStyle, padding: "8px 14px", fontSize: 13 }} disabled={busyId === lead.id} onClick={() => reject(lead.id)}>
              Reject
            </button>
            <button style={{ ...primaryButtonStyle, padding: "8px 14px", fontSize: 13 }} disabled={busyId === lead.id} onClick={() => accept(lead.id)}>
              Accept
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
