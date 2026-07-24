"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { assignLeadAgentAction, updateLeadStageAction } from "@/lib/leads/actions";
import { STAGES, type Lead, type LeadStatus } from "@/lib/leads/types";
import type { AgentRecord } from "@/lib/agents/types";
import { inputStyle } from "@/components/forms";

export default function LeadCard({ lead, agents }: { lead: Lead; agents: AgentRecord[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const agent = agents.find((a) => a.id === lead.agentId);

  async function changeStage(status: LeadStatus) {
    setBusy(true);
    await updateLeadStageAction(lead.id, status);
    setBusy(false);
    router.refresh();
  }

  async function changeAgent(agentId: string) {
    setBusy(true);
    await assignLeadAgentAction(lead.id, agentId || null);
    setBusy(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, border: "1px solid var(--color-linen)", borderRadius: "var(--radius-card-sm)", padding: 14, opacity: busy ? 0.6 : 1 }}>
      <div>
        <Link href={`/deals/${lead.id}`} style={{ fontSize: 14, fontWeight: 700, textDecoration: "underline" }}>
          {lead.name}
        </Link>
        {(lead.company || lead.platform) && (
          <div style={{ fontSize: 12, color: "var(--color-fog)" }}>{[lead.company, lead.platform].filter(Boolean).join(" · ")}</div>
        )}
      </div>

      {agent && (
        <span
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            background: agent.color,
            borderRadius: "var(--radius-pill)",
            padding: "3px 9px",
          }}
        >
          {agent.initials}
        </span>
      )}

      <select value={lead.status} disabled={busy} onChange={(e) => changeStage(e.target.value as LeadStatus)} style={{ ...inputStyle, padding: "6px 10px", fontSize: 12 }}>
        {STAGES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      <select value={lead.agentId ?? ""} disabled={busy} onChange={(e) => changeAgent(e.target.value)} style={{ ...inputStyle, padding: "6px 10px", fontSize: 12 }}>
        <option value="">Unassigned</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
