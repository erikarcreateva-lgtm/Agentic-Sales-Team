import { auth } from "@clerk/nextjs/server";
import { getAnalyticsSummary } from "@/lib/analytics/store";
import { listAgents } from "@/lib/agents/store";
import StatTile from "@/components/analytics/StatTile";
import DailyActivityChart from "@/components/analytics/DailyActivityChart";
import AgentRanking from "@/components/analytics/AgentRanking";

export default async function AnalyticsPage() {
  const { userId } = await auth();
  const [summary, agents] = userId
    ? await Promise.all([getAnalyticsSummary(userId), listAgents(userId)])
    : [{ totals: { brandsAdded: 0, pitchesDrafted: 0, briefsWritten: 0, proposalsDrafted: 0, followupsSent: 0, callsBooked: 0 }, perDay: [], perAgent: [] }, []];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: 14, color: "var(--color-fog)", margin: "4px 0 0" }}>Real numbers on everything your team has done.</p>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <StatTile label="Brands added" value={summary.totals.brandsAdded} />
        <StatTile label="Pitches drafted" value={summary.totals.pitchesDrafted} />
        <StatTile label="Briefs written" value={summary.totals.briefsWritten} />
        <StatTile label="Proposals drafted" value={summary.totals.proposalsDrafted} />
        <StatTile label="Follow-ups sent" value={summary.totals.followupsSent} />
        <StatTile label="Calls booked" value={summary.totals.callsBooked} />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Last 14 days</h2>
        <DailyActivityChart perDay={summary.perDay} />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Output by helper</h2>
        <AgentRanking perAgent={summary.perAgent} agents={agents} />
      </section>
    </div>
  );
}
