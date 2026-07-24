export type MeetingKind = "call" | "shoot" | "deliverable";

export interface Meeting {
  id: string;
  agentId: string | null;
  leadId: string | null;
  title: string;
  kind: MeetingKind;
  whenAt: string;
  whenLabel: string;
  createdAt: string;
}
