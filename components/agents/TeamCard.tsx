import Link from "next/link";
import type { AgentRecord, TeamRecord } from "@/lib/agents/types";

export default function TeamCard({ team, agents }: { team: TeamRecord; agents: AgentRecord[] }) {
  const members = team.members.map((id) => agents.find((a) => a.id === id)).filter(Boolean) as AgentRecord[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, border: "1px solid var(--color-linen)", borderRadius: "var(--radius-card-sm)", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{team.name}</div>
          {team.description && <div style={{ fontSize: 13, color: "var(--color-fog)", marginTop: 2 }}>{team.description}</div>}
        </div>
        <Link href={`/agents/teams/${team.id}`} style={{ fontSize: 13, fontWeight: 700, color: "var(--color-violet)" }}>
          Edit
        </Link>
      </div>
      <div style={{ display: "flex" }}>
        {members.map((m) => (
          <div
            key={m.id}
            title={m.name}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: m.color,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--color-canvas)",
              marginLeft: -8,
            }}
          >
            {m.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
