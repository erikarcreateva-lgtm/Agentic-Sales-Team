import { auth } from "@clerk/nextjs/server";
import { listMessages } from "@/lib/chat/store";
import { listAgents } from "@/lib/agents/store";
import ChatThread from "@/components/chat/ChatThread";

export const runtime = "nodejs";
export const maxDuration = 60;

export default async function ChatPage() {
  const { userId } = await auth();
  const messages = userId ? await listMessages(userId) : [];
  const agents = userId ? await listAgents(userId) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Team chat</h1>
        <p style={{ fontSize: 14, color: "var(--color-fog)", margin: "4px 0 0" }}>@mention a helper and it&apos;ll actually go do the work.</p>
      </div>
      <ChatThread messages={messages} agents={agents} />
    </div>
  );
}
