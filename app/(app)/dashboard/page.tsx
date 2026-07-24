import { auth } from "@clerk/nextjs/server";
import OrbitDashboard from "@/components/OrbitDashboard";
import { listAgents } from "@/lib/agents/store";
import { listTeams } from "@/lib/teams/store";
import { getDashboardStats, getRecentActivity, getWorkingAgentIds } from "@/lib/analytics/store";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return <OrbitDashboard agents={[]} teams={[]} />;

  const [agentsRaw, teams, workingIds, stats, activity] = await Promise.all([
    listAgents(userId),
    listTeams(userId),
    getWorkingAgentIds(userId),
    getDashboardStats(userId),
    getRecentActivity(userId),
  ]);

  // Live status: an agent only shows "working" while it has a job actually
  // running right now — this is what drives the pulsing green dots.
  const agents = agentsRaw.map((a) => ({
    ...a,
    status: workingIds.has(a.id) ? ("working" as const) : a.paused ? ("offline" as const) : ("waiting" as const),
  }));

  const teamPills = teams.map((t) => ({ id: t.id, label: t.name, members: t.members }));

  return <OrbitDashboard agents={agents} teams={teamPills} stats={stats} activity={activity} />;
}
