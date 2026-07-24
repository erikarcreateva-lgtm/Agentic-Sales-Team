import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import type { ChatMessage, ChatWho } from "./types";

function toMessage(row: typeof messages.$inferSelect): ChatMessage {
  return {
    id: row.id,
    agentId: row.agentId,
    who: row.who as ChatWho,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listMessages(userId: string): Promise<ChatMessage[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(messages).where(eq(messages.userId, userId)).orderBy(asc(messages.id));
  return rows.map(toMessage);
}

export async function createMessage(userId: string, input: { agentId: string | null; who: ChatWho; text: string }): Promise<ChatMessage | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db.insert(messages).values({ userId, agentId: input.agentId, who: input.who, text: input.text }).returning();
  return row ? toMessage(row) : null;
}
