"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { pauseAgentAction, removeAgentAction } from "@/lib/agents/actions";
import { dangerButtonStyle, secondaryButtonStyle } from "@/components/forms";

export default function AgentLifecycleActions({ agentId, paused }: { agentId: string; paused: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePause() {
    setBusy(true);
    await pauseAgentAction(agentId, !paused);
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Remove this helper? You can always create a new one.")) return;
    setBusy(true);
    await removeAgentAction(agentId);
    router.push("/agents");
  }

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button style={secondaryButtonStyle} disabled={busy} onClick={togglePause}>
        {paused ? "Resume" : "Pause"}
      </button>
      <button style={dangerButtonStyle} disabled={busy} onClick={remove}>
        Remove
      </button>
    </div>
  );
}
