import { STAGES, type Lead } from "@/lib/leads/types";
import type { AgentRecord } from "@/lib/agents/types";
import LeadCard from "./LeadCard";

export default function PipelineBoard({ leads, agents }: { leads: Lead[]; agents: AgentRecord[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(200px, 1fr))", gap: 14, overflowX: "auto" }}>
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.status === stage.id);
        return (
          <div key={stage.id} style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{stage.label}</span>
              <span style={{ fontSize: 12, color: "var(--color-stone)" }}>{stageLeads.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 60 }}>
              {stageLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} agents={agents} />
              ))}
              {stageLeads.length === 0 && <div style={{ fontSize: 12, color: "var(--color-linen)", padding: "8px 0" }}>—</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
