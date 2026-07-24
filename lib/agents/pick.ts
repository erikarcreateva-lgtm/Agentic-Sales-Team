import type { CapabilityId } from "@/lib/agentTypes";
import type { AgentRecord } from "./types";

// Prefers the given agent if it can do the job; otherwise the first
// non-paused agent that has the capability.
export function pickAgentForCapability(agents: AgentRecord[], capability: CapabilityId, preferredId?: string | null): AgentRecord | null {
  const preferred = preferredId ? agents.find((a) => a.id === preferredId) : undefined;
  if (preferred && !preferred.paused && preferred.capabilities.includes(capability)) return preferred;
  return agents.find((a) => !a.paused && a.capabilities.includes(capability)) ?? null;
}
