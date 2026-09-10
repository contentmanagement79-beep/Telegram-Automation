import { BRAND } from "@/lib/site";

/** Branded, inline-styled HTML for the verification email (email clients need inline CSS). */
export function verificationEmailHtml({ name, link }: { name?: string; link: string }) {
  const hi = name ? `Hi ${escapeHtml(name)},` : "Hi,";
  return `<!doctype html>
<html>
  <body style="margin:0;background:#06070C;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#EAECF5;">
    <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;">
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6D5EF6,#A855F7);"></div>
        <span style="font-size:20px;font-weight:700;color:#F4F5FB;">${BRAND}</span>
      </div>

      <div style="background:#12141F;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;">
        <h1 style="margin:0 0 12px;font-size:22px;color:#F4F5FB;">Confirm your email</h1>
        <p style="margin:0 0 8px;color:#9AA3B8;line-height:1.6;">${hi}</p>
        <p style="margin:0 0 24px;color:#9AA3B8;line-height:1.6;">
          Welcome to ${BRAND}. Tap the button below to verify your email and start setting up your assistant.
        </p>
        <a href="${link}" style="display:inline-block;background:#6D5EF6;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:9999px;">
          Verify email
        </a>
        <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
          If the button doesn't work, copy and paste this link:<br/>
          <a href="${link}" style="color:#8B7CF8;word-break:break-all;">${link}</a>
        </p>
      </div>

      <p style="margin:24px 0 0;color:#6b7280;font-size:12px;line-height:1.6;">
        You received this because someone signed up for ${BRAND} with this address.
        If it wasn't you, you can safely ignore this email.
      </p>
    </div>
  </body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
