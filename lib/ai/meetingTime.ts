import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";

export interface ParsedMeetingTime {
  whenAt: string; // ISO 8601
  whenLabel: string; // friendly label, e.g. "Tuesday, July 28 at 2:00 PM"
}

const SCHEMA = {
  type: "object",
  properties: {
    whenAt: { type: "string" },
    whenLabel: { type: "string" },
  },
  required: ["whenAt", "whenLabel"],
};

export async function parseMeetingTime(text: string, now: Date): Promise<ParsedMeetingTime> {
  if (!isGeminiConfigured()) return fallbackParse(text, now);

  const system = [
    `You convert a natural-language time phrase into an exact date and time.`,
    `Right now it is ${now.toISOString()} (${now.toLocaleDateString("en-US", { weekday: "long" })}).`,
    `Return "whenAt" as a precise ISO 8601 timestamp in the same offset as the current time above, and "whenLabel" as a short friendly label like "Tuesday, July 28 at 2:00 PM".`,
    `If no time of day is mentioned, default to 10:00 AM. If no date is mentioned, assume tomorrow. "Next <weekday>" means the next upcoming occurrence of that weekday, not today even if today is that weekday.`,
    `Return ONLY JSON matching the schema.`,
  ].join("\n\n");

  try {
    const r = await geminiJSON<ParsedMeetingTime>(system, [{ role: "user", text }], SCHEMA, { maxTokens: 200, temperature: 0.2 });
    const parsed = new Date(r.whenAt);
    if (isNaN(parsed.getTime())) return fallbackParse(text, now);
    return { whenAt: parsed.toISOString(), whenLabel: r.whenLabel?.trim() || formatLabel(parsed) };
  } catch {
    return fallbackParse(text, now);
  }
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// No AI key (or the call failed) — a small heuristic parser so booking still
// works from a plainly typed date/time.
function fallbackParse(text: string, now: Date): ParsedMeetingTime {
  const lower = text.toLowerCase();
  const date = new Date(now);

  const weekdayIdx = WEEKDAYS.findIndex((d) => lower.includes(d));
  if (lower.includes("tomorrow")) {
    date.setDate(date.getDate() + 1);
  } else if (weekdayIdx >= 0) {
    let diff = (weekdayIdx - date.getDay() + 7) % 7;
    if (diff === 0) diff = 7;
    date.setDate(date.getDate() + diff);
  } else if (!lower.includes("today")) {
    date.setDate(date.getDate() + 1);
  }

  const timeMatch = lower.match(/(\d{1,2})(:(\d{2}))?\s*(am|pm)/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    const isPm = timeMatch[4] === "pm";
    if (isPm && hour < 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
    date.setHours(hour, minute, 0, 0);
  } else {
    date.setHours(10, 0, 0, 0);
  }

  return { whenAt: date.toISOString(), whenLabel: formatLabel(date) };
}

function formatLabel(date: Date): string {
  return date.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
}
