import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getAgent } from "@/lib/agents/store";
import AgentForm from "@/components/AgentForm";
import AgentLifecycleActions from "@/components/agents/AgentLifecycleActions";

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const agent = userId ? await getAgent(userId, params.id) : null;
  if (!agent) notFound();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>{agent.name}</h1>
          <p style={{ fontSize: 14, color: "var(--color-fog)", margin: "4px 0 0" }}>{agent.role}</p>
        </div>
        <AgentLifecycleActions agentId={agent.id} paused={agent.paused} />
      </div>
      <AgentForm
        mode="edit"
        agentId={agent.id}
        isPreset={agent.isPreset}
        initial={{ name: agent.name, role: agent.role, color: agent.color, goal: agent.goal, capabilities: agent.capabilities }}
      />
    </div>
  );
}
