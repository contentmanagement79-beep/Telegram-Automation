import type { Metadata } from "next";
import { LegalShell, LegalBlock } from "@/components/sections/legal-shell";
import { BRAND, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: `Terms of Service — ${BRAND}` };

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      intro={`The rules for using ${BRAND}. By creating an account you agree to these terms.`}
    >
      <LegalBlock heading="1. What the service does">
        <p>{BRAND} runs an AI assistant on your own Telegram account that replies to customers who message you. You are responsible for the content it sends on your behalf and for the settings you give it.</p>
      </LegalBlock>
      <LegalBlock heading="2. Acceptable use">
        <p>You agree not to use {BRAND} to send bulk unsolicited or cold messages (the service is inbound-only by design); to deceive customers or run scams; to sell illegal goods or services; or to infringe others&apos; rights or Telegram&apos;s or any AI provider&apos;s terms.</p>
      </LegalBlock>
      <LegalBlock heading="3. Honest assistant">
        <p>The assistant is designed to help as an assistant and to be honest when asked, rather than to impersonate a human. You agree not to configure it to deceive customers about its nature.</p>
      </LegalBlock>
      <LegalBlock heading="4. Your account & credentials">
        <p>You are responsible for the Telegram account and API keys you connect and for keeping your login secure. Automating a personal Telegram account carries inherent risk (including possible restrictions by Telegram); you accept that risk.</p>
      </LegalBlock>
      <LegalBlock heading="5. Plans & payment">
        <p>A free tier is available where you bring your own AI key. Paid plans, when offered, are billed as described at checkout. Fair-use limits may apply to managed plans.</p>
      </LegalBlock>
      <LegalBlock heading="6. Suspension">
        <p>We may suspend or terminate accounts that break these terms, abuse the platform, or put it at legal or operational risk.</p>
      </LegalBlock>
      <LegalBlock heading="7. Disclaimer & liability">
        <p>The service is provided &quot;as is.&quot; AI replies can be imperfect; you are responsible for reviewing them and for outcomes with your customers. To the extent allowed by law, {BRAND} is not liable for indirect or consequential damages.</p>
      </LegalBlock>
      <LegalBlock heading="8. Contact">
        <p>Questions about these terms? Email <span className="link">{CONTACT_EMAIL}</span>.</p>
      </LegalBlock>
    </LegalShell>
  );
}
