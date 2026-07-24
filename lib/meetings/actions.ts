"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getLead, updateLeadStage } from "@/lib/leads/store";
import { listAgents } from "@/lib/agents/store";
import { pickAgentForCapability } from "@/lib/agents/pick";
import { logActivity } from "@/lib/activity/store";
import { parseMeetingTime } from "@/lib/ai/meetingTime";
import { createMeeting } from "./store";

export async function bookMeetingAction(leadId: string, timeText: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "Not signed in." };
  if (!timeText.trim()) return { ok: false as const, error: "Say when — e.g. \"next Tuesday at 2pm\"." };

  const lead = await getLead(userId, leadId);
  if (!lead) return { ok: false as const, error: "Brand not found." };

  const agents = await listAgents(userId);
  const agent = pickAgentForCapability(agents, "book-meeting", lead.agentId);

  const { whenAt, whenLabel } = await parseMeetingTime(timeText, new Date());

  await createMeeting(userId, {
    agentId: agent?.id ?? null,
    leadId: lead.id,
    title: `Call with ${lead.name}`,
    kind: "call",
    whenAt,
    whenLabel,
  });

  await updateLeadStage(userId, lead.id, "booked");
  await logActivity({ userId, agentId: agent?.id ?? null, leadId: lead.id, type: "meeting_booked", text: `Booked a call with ${lead.name} for ${whenLabel}` });

  revalidatePath("/calendar");
  revalidatePath(`/deals/${lead.id}`);
  revalidatePath("/deals");
  return { ok: true as const, whenLabel };
}
