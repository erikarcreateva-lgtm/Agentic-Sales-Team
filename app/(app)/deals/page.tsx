import { auth } from "@clerk/nextjs/server";
import { listLeads } from "@/lib/leads/store";
import { listAgents } from "@/lib/agents/store";
import PipelineBoard from "@/components/deals/PipelineBoard";
import AddLeadForm from "@/components/deals/AddLeadForm";
import CsvImportForm from "@/components/deals/CsvImportForm";
import PendingReview from "@/components/deals/PendingReview";
import DiscoverBrandsButton from "@/components/deals/DiscoverBrandsButton";

export default async function DealsPage() {
  const { userId } = await auth();
  const agents = userId ? await listAgents(userId) : [];
  const acceptedLeads = userId ? await listLeads(userId, { review: "accepted" }) : [];
  const pendingLeads = userId ? await listLeads(userId, { review: "pending" }) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Brand deals</h1>
        <p style={{ fontSize: 14, color: "var(--color-fog)", margin: "4px 0 0" }}>Every brand you're working, from first touch to booked call.</p>
      </div>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Add a brand</h2>
        <AddLeadForm agents={agents} />
        <CsvImportForm agents={agents} />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Needs your approval ({pendingLeads.length})</h2>
          <DiscoverBrandsButton />
        </div>
        <PendingReview leads={pendingLeads} />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Pipeline</h2>
        <PipelineBoard leads={acceptedLeads} agents={agents} />
      </section>
    </div>
  );
}
