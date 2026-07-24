export interface Proposal {
  id: string;
  agentId: string | null;
  leadId: string;
  title: string;
  body: string;
  packages: string[];
  status: "draft" | "sent";
  createdAt: string;
}
