import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { listAgents } from "@/lib/agents/store";
import { listTeams } from "@/lib/teams/store";
import AgentCard from "@/components/agents/AgentCard";
import TeamCard from "@/components/agents/TeamCard";
import { primaryButtonStyle, secondaryButtonStyle } from "@/components/forms";

export default async function AgentsPage() {
  const { userId } = await auth();
  const agents = userId ? await listAgents(userId) : [];
  const teams = userId ? await listTeams(userId) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Your team</h1>
            <p style={{ fontSize: 14, color: "var(--color-fog)", margin: "4px 0 0" }}>Your five ready-made helpers, plus any you've built yourself.</p>
          </div>
          <Link href="/agents/new" style={primaryButtonStyle}>
            + New helper
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {agents.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Teams</h2>
            <p style={{ fontSize: 14, color: "var(--color-fog)", margin: "4px 0 0" }}>Group helpers together to work a shared list of brands.</p>
          </div>
          <Link href="/agents/teams/new" style={secondaryButtonStyle}>
            + New team
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {teams.map((t) => (
            <TeamCard key={t.id} team={t} agents={agents} />
          ))}
        </div>
      </section>
    </div>
  );
}
