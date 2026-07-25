import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalPageLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--color-canvas)",
          height: 64,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--color-linen)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 26px" }}>
          <Link href="/" style={{ fontSize: 14, fontWeight: 700 }}>
            Agentic Sales Team
          </Link>
        </div>
      </div>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "60px 26px 100px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px" }}>{title}</h1>
        <p style={{ fontSize: 13, color: "var(--color-stone)", margin: "0 0 40px" }}>Last updated {updated}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 15, lineHeight: 1.7, color: "var(--color-ink)" }}>{children}</div>
      </main>
    </div>
  );
}
