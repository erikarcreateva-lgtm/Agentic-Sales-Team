"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignLeadAgentAction, updateLeadStageAction } from "@/lib/leads/actions";
import { STAGES, type Lead, type LeadStatus } from "@/lib/leads/types";
import type { AgentRecord } from "@/lib/agents/types";
import { inputStyle } from "@/components/forms";

export default function LeadControls({ lead, agents }: { lead: Lead; agents: AgentRecord[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

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
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <select value={lead.status} disabled={busy} onChange={(e) => changeStage(e.target.value as LeadStatus)} style={{ ...inputStyle, width: "auto" }}>
        {STAGES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <select value={lead.agentId ?? ""} disabled={busy} onChange={(e) => changeAgent(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
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
