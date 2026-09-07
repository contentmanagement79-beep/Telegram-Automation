import { Resend } from "resend";
import { BRAND } from "@/lib/site";
import { verificationEmailHtml } from "@/lib/emails";

/** Sends the branded verification email via the Resend API. Server only. */
export async function sendVerificationEmail(to: string, link: string, name?: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || `${BRAND} <onboarding@resend.dev>`;
  return resend.emails.send({
    from,
    to,
    subject: `Verify your email for ${BRAND}`,
    html: verificationEmailHtml({ name, link }),
  });
}
