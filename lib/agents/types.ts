import type { StatusKey } from "@/lib/status";
import type { CapabilityId } from "@/lib/agentTypes";

export interface AgentRecord {
  id: string;
  name: string;
  initials: string;
  emoji: string;
  role: string;
  color: string;
  status: StatusKey;
  paused: boolean;
  task: string;
  goal: string;
  capabilities: CapabilityId[];
  isPreset: boolean;
}

export interface AgentInput {
  name: string;
  initials: string;
  emoji: string;
  role: string;
  color: string;
  goal: string;
  capabilities: CapabilityId[];
}

export interface TeamRecord {
  id: string;
  name: string;
  description: string;
  goal: string;
  members: string[];
  isPreset: boolean;
}

export interface TeamInput {
  name: string;
  description: string;
  goal: string;
  members: string[];
}
