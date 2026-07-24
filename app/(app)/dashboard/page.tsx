import { auth } from "@clerk/nextjs/server";
import OrbitDashboard from "@/components/OrbitDashboard";
import { listAgents } from "@/lib/agents/store";
import { listTeams } from "@/lib/teams/store";

export default async function DashboardPage() {
  const { userId } = await auth();
  const agents = userId ? await listAgents(userId) : [];
  const teams = userId ? await listTeams(userId) : [];
  const teamPills = teams.map((t) => ({ id: t.id, label: t.name, members: t.members }));

  return <OrbitDashboard agents={agents} teams={teamPills} />;
}
