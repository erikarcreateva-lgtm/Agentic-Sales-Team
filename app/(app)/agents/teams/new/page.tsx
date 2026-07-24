import { auth } from "@clerk/nextjs/server";
import { listAgents } from "@/lib/agents/store";
import TeamForm from "@/components/TeamForm";

export default async function NewTeamPage() {
  const { userId } = await auth();
  const agents = userId ? await listAgents(userId) : [];

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Build a new team</h1>
      <p style={{ fontSize: 14, color: "var(--color-fog)", marginBottom: 26 }}>Group helpers together to share a list of brands.</p>
      <TeamForm mode="create" initial={{ name: "", description: "", goal: "", members: [] }} availableAgents={agents} />
    </div>
  );
}
