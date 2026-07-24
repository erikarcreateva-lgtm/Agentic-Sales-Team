import type { StatusKey } from "@/lib/status";

export type CapabilityId = "scrape" | "research" | "outreach" | "proposal" | "follow-up" | "book-meeting";

export interface Capability {
  id: CapabilityId;
  label: string;
  jobKind: string;
}

export const CAPABILITIES: Capability[] = [
  { id: "scrape", label: "Research", jobKind: "scrape" },
  { id: "research", label: "Brand brief", jobKind: "research" },
  { id: "outreach", label: "Initial Outreach", jobKind: "outreach" },
  { id: "proposal", label: "Proposals", jobKind: "proposal" },
  { id: "follow-up", label: "Follow-ups", jobKind: "follow-up" },
  { id: "book-meeting", label: "Scheduling", jobKind: "book-meeting" },
];

export interface AgentType {
  id: string;
  name: string;
  initials: string;
  role: string;
  color: string;
  capabilities: CapabilityId[];
  status: StatusKey;
}

// The premade "Deal Team" — every creator starts with these five.
export const AGENT_TYPES: AgentType[] = [
  { id: "discovery", name: "Remy Rivera", initials: "RR", role: "Research", color: "#0EA5E9", capabilities: ["scrape", "research"], status: "working" },
  { id: "outreach", name: "Otis Vance", initials: "OV", role: "Initial Outreach", color: "#5122C1", capabilities: ["outreach"], status: "working" },
  { id: "proposal", name: "Priya Shah", initials: "PS", role: "Proposal", color: "#7C3AED", capabilities: ["proposal"], status: "waiting" },
  { id: "followup", name: "Faye Cole", initials: "FC", role: "Follow-up", color: "#8B5CF6", capabilities: ["follow-up"], status: "working" },
  { id: "scheduler", name: "Sam Okafor", initials: "SO", role: "Scheduler", color: "#F43F7E", capabilities: ["book-meeting"], status: "waiting" },
];

export const TEAM_TEMPLATES = [
  { id: "deal-team", name: "Deal Team", members: AGENT_TYPES.map((a) => a.id) },
];
