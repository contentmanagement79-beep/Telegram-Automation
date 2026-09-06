import type { Metadata } from "next";
import { LegalShell, LegalBlock } from "@/components/sections/legal-shell";
import { BRAND, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy — Sathi" };

// PRIVACY — /privacy. Linked from the footer on every page.
export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      intro={`How ${BRAND} handles the data of sellers who use the platform and of the customers who message them.`}
    >
      <LegalBlock heading="1. What we collect">
        <p>
          <strong className="text-cloud">Account data:</strong> your email and login details (via our
          authentication provider).
        </p>
        <p>
          <strong className="text-cloud">Telegram connection:</strong> your API ID, API hash, phone
          number, and the login session needed to run the assistant on your account. These are stored
          encrypted.
        </p>
        <p>
          <strong className="text-cloud">AI keys:</strong> the API key(s) you provide, stored encrypted.
        </p>
        <p>
          <strong className="text-cloud">Conversation data:</strong> messages exchanged between you and
          your customers, so the assistant can reply in context.
        </p>
      </LegalBlock>

      <LegalBlock heading="2. How we use it">
        <p>
          Solely to operate the service: to run your assistant, generate replies, show you your
          dashboard, and keep the platform secure. We do not sell your data or your customers&apos; data.
        </p>
      </LegalBlock>

      <LegalBlock heading="3. Service providers">
        <p>
          We rely on third parties to run the platform: an AI provider (e.g. Google Gemini) to generate
          replies, Telegram to deliver messages, and infrastructure/hosting and email providers. Data is
          shared with them only as needed to provide the service, under their own terms.
        </p>
      </LegalBlock>

      <LegalBlock heading="4. Security">
        <p>
          Sensitive data — your Telegram session and API keys — is encrypted at rest. Encryption keys are
          held in our environment, never in the database. Each seller&apos;s data is isolated with
          row-level security.
        </p>
      </LegalBlock>

      <LegalBlock heading="5. Retention">
        <p>
          Raw customer messages are kept only as long as needed for context and are deleted on a rolling
          basis (about 7 days), while short conversation summaries may be kept longer so the assistant can
          maintain continuity. You can request deletion of your data at any time.
        </p>
      </LegalBlock>

      <LegalBlock heading="6. Your controls">
        <p>
          You can disconnect your Telegram account in one click, which removes the stored session. You can
          also request export or deletion of your account and associated data.
        </p>
      </LegalBlock>

      <LegalBlock heading="7. Customers' data">
        <p>
          As the seller, you are responsible for how you use conversations with your own customers and for
          complying with the laws that apply to you. {BRAND} processes that data on your behalf to provide
          the service.
        </p>
      </LegalBlock>

      <LegalBlock heading="8. Contact">
        <p>
          Questions about privacy? Email <span className="text-violet-soft">{CONTACT_EMAIL}</span>.
        </p>
      </LegalBlock>
    </LegalShell>
  );
}
