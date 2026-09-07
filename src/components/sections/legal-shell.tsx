import { LEGAL_UPDATED } from "@/lib/site";
import { Reveal } from "@/components/ui/reveal";

/** Consistent shell for legal pages (privacy, terms) so they match the theme. */
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
    <section className="relative z-10 mx-auto max-w-3xl px-6 pb-28 pt-36 lg:px-8 sm:pt-44">
      <Reveal>
        <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">Last updated: {LEGAL_UPDATED}</p>
        <p className="mt-6 text-lg text-muted">{intro}</p>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-12 space-y-10">{children}</div>
      </Reveal>

      <Reveal delay={120}>
        <p className="mt-14 rounded-2xl border border-line bg-white/[0.03] p-5 text-sm text-muted">
          This is a starting template, not legal advice. Have a qualified lawyer review it for your
          jurisdiction before you launch.
        </p>
      </Reveal>
    </section>
  );
}

/** A titled block within a legal page. */
export function LegalBlock({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl text-cloud">{heading}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted">{children}</div>
    </div>
  );
}
