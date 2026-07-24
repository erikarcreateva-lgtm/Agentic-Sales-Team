import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getLead } from "@/lib/leads/store";
import { listAgents } from "@/lib/agents/store";
import { listProposalsForLead } from "@/lib/proposals/store";
import { listDraftsForLead } from "@/lib/outreach/store";
import LeadControls from "@/components/deals/LeadControls";
import ProposalList from "@/components/deals/ProposalList";
import DraftList from "@/components/deals/DraftList";
import ResearchBrief from "@/components/deals/ResearchBrief";
import RunJobButton from "@/components/jobs/RunJobButton";
import BookMeetingForm from "@/components/meetings/BookMeetingForm";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const lead = userId ? await getLead(userId, params.id) : null;
  if (!lead) notFound();

  const [agents, proposals, drafts] = await Promise.all([
    listAgents(userId!),
    listProposalsForLead(userId!, lead.id),
    listDraftsForLead(userId!, lead.id),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720 }}>
      <div>
        <Link href="/deals" style={{ fontSize: 13, fontWeight: 700, color: "var(--color-violet)" }}>
          ← All brand deals
        </Link>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "10px 0 4px" }}>{lead.name}</h1>
        <p style={{ fontSize: 14, color: "var(--color-fog)", margin: 0 }}>
          {[lead.company, lead.platform, lead.email].filter(Boolean).join(" · ") || "No details on file yet"}
        </p>
      </div>

      <LeadControls lead={lead} agents={agents} />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <RunJobButton kind="outreach" leadId={lead.id} label="Draft pitch" busyLabel="Drafting pitch…" />
        <RunJobButton kind="research" leadId={lead.id} label="Write brief" busyLabel="Researching…" variant="secondary" />
        <RunJobButton kind="proposal" leadId={lead.id} label="Draft proposal" busyLabel="Drafting proposal…" />
        <RunJobButton kind="follow-up" leadId={lead.id} label="Follow up" busyLabel="Writing follow-up…" variant="secondary" />
      </div>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Book a call</h2>
        <BookMeetingForm lead={lead} />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Brand brief</h2>
        <ResearchBrief research={lead.research} />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Proposals</h2>
        <ProposalList proposals={proposals} />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Messages</h2>
        <DraftList drafts={drafts} lead={lead} />
      </section>
    </div>
  );
}
