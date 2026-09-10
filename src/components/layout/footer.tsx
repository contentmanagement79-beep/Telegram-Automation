import Link from "next/link";
import { Bot } from "lucide-react";
import { site } from "@/lib/site";
import { FooterAuthLink } from "@/components/sections/footer-auth-link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link href="/" className="brand">
              <span className="brand-logo" style={{ width: 32, height: 32 }}><Bot size={18} /></span>
              <span className="brand-name" style={{ fontSize: 18 }}>{site.brand}</span>
            </Link>
            <p className="footer-tag">{site.tagline}</p>
          </div>

          <nav className="footer-nav">
            {[...site.nav, ...site.legalNav].map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
            <FooterAuthLink />
          </nav>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {site.brand}. Runs on your own account — an honest assistant, never a fake human.</p>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span className="dot" /> All systems normal
          </p>
        </div>
      </div>
    </footer>
  );
}
