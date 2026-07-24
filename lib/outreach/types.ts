export type DraftKind = "pitch" | "follow-up";

export interface OutreachDraft {
  id: string;
  agentId: string | null;
  leadId: string;
  kind: DraftKind;
  subject: string;
  body: string;
  rationale: string;
  status: "draft" | "sent";
  dismissed: boolean;
  createdAt: string;
}
