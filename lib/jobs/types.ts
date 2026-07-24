export type JobKind = "outreach" | "research" | "proposal" | "follow-up";
export type JobStatus = "queued" | "running" | "done" | "failed";

export interface JobRecord {
  id: string;
  userId: string;
  agentId: string | null;
  kind: JobKind;
  status: JobStatus;
  params: Record<string, unknown>;
}
