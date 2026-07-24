import type { AgentRecord } from "@/lib/agents/types";

export default function AgentRanking({ perAgent, agents }: { perAgent: { agentId: string; count: number }[]; agents: AgentRecord[] }) {
  if (perAgent.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--color-stone)" }}>No output yet — once your team gets to work, their totals show up here.</p>;
  }

  const agentById = new Map(agents.map((a) => [a.id, a]));
  const max = Math.max(1, ...perAgent.map((p) => p.count));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {perAgent.map((p) => {
        const agent = agentById.get(p.agentId);
        const widthPct = Math.max(4, (p.count / max) * 100);
        return (
          <div key={p.agentId} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, width: 120, flex: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {agent?.name ?? "Removed helper"}
            </span>
            <div style={{ flex: 1, height: 8, borderRadius: "var(--radius-pill)", background: "var(--color-linen)", overflow: "hidden" }}>
              <div style={{ width: `${widthPct}%`, height: "100%", borderRadius: "var(--radius-pill)", background: agent?.color ?? "var(--color-stone)" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, width: 24, textAlign: "right", flex: "none" }}>{p.count}</span>
          </div>
        );
      })}
    </div>
  );
}
