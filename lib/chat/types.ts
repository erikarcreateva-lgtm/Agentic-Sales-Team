export type ChatWho = "me" | "ai";

export interface ChatMessage {
  id: number;
  agentId: string | null;
  who: ChatWho;
  text: string;
  createdAt: string;
}
