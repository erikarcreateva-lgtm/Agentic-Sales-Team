import Link from "next/link";
import { statusMeta } from "@/lib/status";
import { CAPABILITIES } from "@/lib/agentTypes";
import type { AgentRecord } from "@/lib/agents/types";

export default function AgentCard({ agent }: { agent: AgentRecord }) {
  const meta = statusMeta(agent.status);
  const capLabels = agent.capabilities.map((id) => CAPABILITIES.find((c) => c.id === id)?.label ?? id);

  return (
    <Link
      href={`/agents/${agent.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        border: "1px solid var(--color-linen)",
        borderRadius: "var(--radius-card-sm)",
        padding: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: agent.color,
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          {agent.initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.name}</div>
          <div style={{ fontSize: 13, color: "var(--color-fog)" }}>{agent.role}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: "var(--radius-pill)",
            background: meta.bg,
            color: meta.color,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot }} />
          {agent.paused ? "Paused" : meta.label}
        </span>
        {agent.isPreset && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-stone)" }}>Preset</span>
        )}
      </div>

      <div style={{ fontSize: 12, color: "var(--color-stone)" }}>{capLabels.join(", ")}</div>
    </Link>
  );
}
