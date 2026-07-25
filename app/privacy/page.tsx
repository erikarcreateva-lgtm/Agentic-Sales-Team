import LegalPageLayout from "@/components/LegalPageLayout";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 10px" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated="July 24, 2026">
      <p>This explains what information Agentic Sales Team collects, why, and how it's protected.</p>

      <Section title="What we collect">
        <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>Account details (name, email) from Clerk, our sign-in provider.</li>
          <li>Your Media Kit — niche, bio, platforms, audience, tone, rates.</li>
          <li>Brand/deal data you add or that your Research helper finds.</li>
          <li>AI-drafted pitches, proposals, briefs, follow-ups, and your chat messages with your AI team.</li>
          <li>Calendar bookings you make.</li>
          <li>If you connect TikTok: your profile photo, display name, and follower/engagement stats.</li>
        </ul>
      </Section>

      <Section title="How we use it">
        <p>
          Solely to run the app for you: to ground your AI helpers' work in your real profile and audience, to show
          your dashboard and analytics, and to save your work so it's there next time you log in.
        </p>
      </Section>

      <Section title="Who we share it with">
        <p>We don't sell your personal data. Data passes through these providers only as needed to run the app:</p>
        <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <li><strong>Clerk</strong> — handles sign-up, login, and account security.</li>
          <li><strong>Neon</strong> — hosts the database that stores your data.</li>
          <li><strong>Google Gemini</strong> — generates your AI-drafted content.</li>
          <li><strong>Firecrawl</strong> — powers brand discovery web searches.</li>
          <li><strong>TikTok</strong> — only if you choose to connect your account.</li>
        </ul>
      </Section>

      <Section title="TikTok data specifically">
        <p>
          If you connect TikTok, we store your profile photo, display name, and stats to auto-fill your Media Kit. The
          access token TikTok gives us is encrypted before storage (AES-256-GCM) and is never shown in the app or sent
          to your browser. You can disconnect at any time from your Profile page, which stops any further access.
        </p>
      </Section>

      <Section title="Data security">
        <p>All data is transmitted over encrypted connections. Sensitive tokens are encrypted at rest.</p>
      </Section>

      <Section title="Your choices">
        <p>You can edit or clear your Media Kit at any time, disconnect TikTok whenever you like, and clear your notifications (this only hides them — it doesn't delete your activity history).</p>
      </Section>

      <Section title="Children">
        <p>The app is not directed at children under 13 and we don't knowingly collect their data.</p>
      </Section>

      <Section title="Changes">
        <p>We may update this policy as the app changes. Material changes will be reflected here with a new "last updated" date.</p>
      </Section>

      <Section title="Contact">
        <p>Questions about your data? Reach us at erikapaala.rcreateva@gmail.com.</p>
      </Section>
    </LegalPageLayout>
  );
}
