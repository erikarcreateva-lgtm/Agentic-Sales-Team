import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getTeam } from "@/lib/teams/store";
import { listAgents } from "@/lib/agents/store";
import TeamForm from "@/components/TeamForm";

export default async function EditTeamPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const [team, agents] = userId ? await Promise.all([getTeam(userId, params.id), listAgents(userId)]) : [null, []];
  if (!team) notFound();

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{team.name}</h1>
      <p style={{ fontSize: 14, color: "var(--color-fog)", marginBottom: 26 }}>Edit this team's members and details.</p>
      <TeamForm
        mode="edit"
        teamId={team.id}
        initial={{ name: team.name, description: team.description, goal: team.goal, members: team.members }}
        availableAgents={agents}
      />
    </div>
  );
}
