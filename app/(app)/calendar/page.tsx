import { auth } from "@clerk/nextjs/server";
import { listMeetings } from "@/lib/meetings/store";
import { listLeads } from "@/lib/leads/store";
import BookMeetingForm from "@/components/meetings/BookMeetingForm";
import CalendarView from "@/components/meetings/CalendarView";

export default async function CalendarPage() {
  const { userId } = await auth();
  const meetings = userId ? await listMeetings(userId) : [];
  const leads = userId ? await listLeads(userId, { review: "accepted" }) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 620 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Calendar</h1>
        <p style={{ fontSize: 14, color: "var(--color-fog)", margin: "4px 0 0" }}>Every brand call you've booked, in one place.</p>
      </div>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Book a call</h2>
        <BookMeetingForm leads={leads} />
      </section>

      <CalendarView meetings={meetings} leads={leads} />
    </div>
  );
}
