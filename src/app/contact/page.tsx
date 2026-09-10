import type { Metadata } from "next";
import { BRAND, site } from "@/lib/site";

export const metadata: Metadata = { title: `Contact — ${BRAND}` };

export default function ContactPage() {
  const email = site.contact || "hello@example.com";
  return (
    <section className="legal" style={{ maxWidth: "40rem" }}>
      <h1 className="h2">Contact us</h1>
      <p className="muted" style={{ marginTop: 8 }}>Questions, help with setup, or want us to build your integration API — reach out.</p>

      <div className="panel glass" style={{ marginTop: 24 }}>
        <p className="panel-title">Build my API for me</p>
        <p className="muted">No developer? We can build your product-search API endpoint and connect it to your assistant. Tell us your website/data source and what the bot should answer.</p>
      </div>

      <div className="panel glass">
        <p className="panel-title">Email</p>
        <p>
          <a className="mono" style={{ color: "var(--violet-soft)" }} href={`mailto:${email}?subject=Autogram%20help`}>{email}</a>
        </p>
        <div style={{ marginTop: 14 }}>
          <a className="btn btn-primary btn-sm" href={`mailto:${email}?subject=Autogram%20-%20build%20my%20API`}>Email us</a>
        </div>
      </div>
    </section>
  );
}
