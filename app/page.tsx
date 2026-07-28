import Link from "next/link";
import OrbitDashboard from "@/components/OrbitDashboard";

const FEATURES = [
  { title: "Finds brands for you", body: "Your Research agent scours the web for brands that sponsor creators in your niche and lines them up for you to approve." },
  { title: "Pitches in your voice", body: "Your Outreach agent writes a personalized first pitch — an email or a DM — that sounds like you wrote it yourself." },
  { title: "Builds priced proposals", body: "Once a brand is interested, your Proposal agent scopes and prices a deal based on your rates and audience." },
  { title: "Follows up for you", body: "Gone quiet? Your Follow-up agent sends a warm, on-voice nudge that builds on what was already said." },
  { title: "Books the call", body: "Just say it in plain English — 'book a call with Acme next Tuesday at 2pm' — and it lands on your calendar." },
  { title: "Shows you the team at work", body: "Your live dashboard shows every agent working in real time, with real numbers on pitches, brands, and booked calls." },
];

const STEPS = [
  { n: "01", title: "Fill in your Media Kit", body: "Your niche, audience, platforms, and rates — the profile every agent grounds their work in." },
  { n: "02", title: "Meet your AI team", body: "Five ready-made agents, each with one job — from finding brands to booking the call." },
  { n: "03", title: "Review & approve", body: "Discovered brands wait for your yes before any agent works them." },
  { n: "04", title: "Send and book", body: "Open pitches in your own mail app, send proposals, and watch calls land on your calendar." },
];

export default function LandingPage() {
  return (
    <div>
      <Nav />
      <main style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 26px" }}>
        <Hero />
        <Features />
        <HowItWorks />
        <WhoFor />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--color-canvas)",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "var(--max-width)",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: "none" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--color-red)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: 15,
              flex: "none",
            }}
          >
            A
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>Agentic Sales Team</span>
        </div>
        <div className="landing-nav-links" style={{ alignItems: "center", gap: 28, flex: "none" }}>
          <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-fog)", whiteSpace: "nowrap" }}>Features</a>
          <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-fog)", whiteSpace: "nowrap" }}>How it works</a>
          <a href="#who-for" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-fog)", whiteSpace: "nowrap" }}>Who it&apos;s for</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
          <Link
            href="/sign-in"
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "9px 12px",
              borderRadius: "var(--radius-btn)",
              border: "1px solid var(--color-ink)",
              color: "var(--color-ink)",
              whiteSpace: "nowrap",
            }}
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "9px 14px",
              borderRadius: "var(--radius-btn)",
              background: "var(--color-red)",
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section style={{ padding: "40px 0 80px", display: "flex", flexDirection: "column", gap: 40 }}>
      <div style={{ animation: "fadeUp .5s ease" }}>
        <OrbitDashboard avatarUrl="/icon.jpg" />
      </div>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, animation: "fadeUp .6s ease" }}>
        <h1 style={{ fontSize: 50, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1.85px", margin: 0 }}>
          Your AI team,<br />
          <em style={{ color: "var(--color-violet)", fontStyle: "italic" }}>closing deals.</em>
        </h1>
        <p style={{ fontSize: 20, color: "var(--color-fog)", maxWidth: 560, margin: 0, lineHeight: 1.4 }}>
          Agentic Sales Team finds brands, pitches them in your voice, prices the deal, follows up, and books the call — so you can just create.
        </p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8 }}>
          <Link
            href="/sign-up"
            style={{
              fontSize: 16,
              fontWeight: 600,
              padding: "12px 20px",
              borderRadius: "var(--radius-btn)",
              background: "var(--color-red)",
              color: "#fff",
            }}
          >
            Get started free
          </Link>
          <a href="#how-it-works" style={{ fontSize: 16, fontWeight: 500, color: "var(--color-ink)", textDecoration: "underline" }}>
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" style={{ padding: "80px 0" }}>
      <h2 style={{ fontSize: 38, fontWeight: 700, textAlign: "center", margin: "0 0 48px" }}>What your team does</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
        {FEATURES.map((f) => (
          <div
            key={f.title}
            style={{
              background: "var(--color-linen)",
              borderRadius: "var(--radius-card-sm)",
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{f.title}</h3>
            <p style={{ fontSize: 16, color: "var(--color-fog)", lineHeight: 1.5, margin: 0 }}>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "80px 0" }}>
      <h2 style={{ fontSize: 38, fontWeight: 700, textAlign: "center", margin: "0 0 48px" }}>How it works</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
        {STEPS.map((s) => (
          <div key={s.n} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "var(--color-violet)" }}>{s.n}</span>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{s.title}</h3>
            <p style={{ fontSize: 16, color: "var(--color-fog)", lineHeight: 1.5, margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhoFor() {
  return (
    <section id="who-for" style={{ padding: "80px 0", background: "var(--color-linen)", borderRadius: "var(--radius-card)", margin: "0 0 80px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", padding: "0 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 38, fontWeight: 700, margin: 0 }}>Built for creators, not managers</h2>
        <p style={{ fontSize: 16, color: "var(--color-fog)", lineHeight: 1.5, margin: 0 }}>
          If you&apos;re a content creator chasing brand deals without a team behind you — no manager, no agency, no time —
          this is the app that does that job for you.
        </p>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section style={{ padding: "40px 0 100px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <h2 style={{ fontSize: 38, fontWeight: 700, margin: 0 }}>Ready to get your AI team working?</h2>
      <Link
        href="/sign-up"
        style={{
          fontSize: 16,
          fontWeight: 600,
          padding: "12px 24px",
          borderRadius: "var(--radius-btn)",
          background: "var(--color-red)",
          color: "#fff",
        }}
      >
        Get started free
      </Link>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--color-linen)", padding: "32px 0" }}>
      <div
        style={{
          maxWidth: "var(--max-width)",
          margin: "0 auto",
          padding: "0 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700 }}>Agentic Sales Team</span>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/terms" style={{ fontSize: 14, color: "var(--color-fog)" }}>
            Terms
          </Link>
          <Link href="/privacy" style={{ fontSize: 14, color: "var(--color-fog)" }}>
            Privacy
          </Link>
          <span style={{ fontSize: 14, color: "var(--color-fog)" }}>© {new Date().getFullYear()} Agentic Sales Team. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
