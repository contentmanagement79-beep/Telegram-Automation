import { LEGAL_UPDATED } from "@/lib/site";
import { Reveal } from "@/components/ui/reveal";

export function LegalShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="legal">
      <Reveal>
        <h1 className="legal-title">{title}</h1>
        <p className="legal-updated">Last updated: {LEGAL_UPDATED}</p>
        <p className="legal-intro">{intro}</p>
      </Reveal>
      <Reveal delay={80}>
        <div className="legal-blocks">{children}</div>
      </Reveal>
      <Reveal delay={120}>
        <p className="legal-note">
          This is a starting template, not legal advice. Have a qualified lawyer review it for your
          jurisdiction before you launch.
        </p>
      </Reveal>
    </section>
  );
}

export function LegalBlock({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="legal-block">
      <h2>{heading}</h2>
      <div>{children}</div>
    </div>
  );
}
