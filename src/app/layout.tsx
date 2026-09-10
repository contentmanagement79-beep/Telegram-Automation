import type { Metadata } from "next";
import { BRAND, TAGLINE } from "@/lib/site";
import { MarketingShell } from "@/components/layout/marketing-shell";
import "./theme.css";

export const metadata: Metadata = {
  title: `${BRAND} — ${TAGLINE}`,
  description:
    "Turn your Telegram into a 24/7 AI assistant that replies to customers in your own voice — photos, voice notes and files included.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts (Fontshare). Prefer other fonts? change here + --font-* in theme.css */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=general-sans@400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <MarketingShell>{children}</MarketingShell>
      </body>
    </html>
  );
}
