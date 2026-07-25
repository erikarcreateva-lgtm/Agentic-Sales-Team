import LegalPageLayout from "@/components/LegalPageLayout";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 10px" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" updated="July 24, 2026">
      <p>
        Agentic Sales Team ("the app," "we," "us") is a tool that helps content creators find, pitch, and manage brand
        partnerships using AI-assisted helpers. By creating an account or using the app, you agree to these terms.
      </p>

      <Section title="What the app does">
        <p>
          The app lets you build a creator profile ("Media Kit"), discover and track brand deals, and use AI helpers to
          draft outreach messages, proposals, research briefs, and follow-ups, and to book calls. You may optionally
          connect a TikTok account to auto-fill your profile.
        </p>
      </Section>

      <Section title="Your account">
        <p>
          Sign-up and login are handled by our authentication provider, Clerk. You're responsible for keeping your
          login secure and for the accuracy of the information you provide.
        </p>
      </Section>

      <Section title="AI-generated content">
        <p>
          Pitches, proposals, briefs, and follow-ups are drafted by AI on your behalf and written in your voice. They
          are drafts, not sent automatically — you review and choose whether to send them. We don't guarantee the
          accuracy of AI-generated content or any particular business outcome from using it.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>
          Don't use the app to break the law, to harass or deceive anyone, or to abuse, overload, or scrape the
          service. We may suspend accounts that misuse the app.
        </p>
      </Section>

      <Section title="Third-party services">
        <p>
          The app relies on third-party providers to work: Clerk (accounts), Neon (data storage), Google Gemini (AI
          drafting), Firecrawl (brand discovery), and, if you connect it, TikTok (profile auto-fill). Your use of the
          app means data is shared with these providers as needed to provide the service — see our Privacy Policy for
          details.
        </p>
      </Section>

      <Section title="Ownership">
        <p>
          You own the content of your Media Kit, your brand deal data, and the drafts the app writes for you. We own
          the app itself — its design, code, and features.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          The app is provided "as is." We do our best to keep it running and accurate, but we don't promise it will be
          error-free or uninterrupted.
        </p>
      </Section>

      <Section title="Changes">
        <p>We may update these terms as the app changes. Continuing to use the app after an update means you accept the new terms.</p>
      </Section>

      <Section title="Contact">
        <p>Questions about these terms? Reach us at erikapaala.rcreateva@gmail.com.</p>
      </Section>
    </LegalPageLayout>
  );
}
