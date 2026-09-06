import { Reveal } from "@/components/ui/reveal";
import { metrics } from "@/lib/site";

const accentColor = ["text-mint", "text-iris", "text-violet-soft", "text-sky"];

export function Metrics() {
  return (
    <section className="relative z-10 border-y border-line bg-ink-900/40 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 divide-line px-6 text-center sm:grid-cols-4 sm:divide-x lg:px-8">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 90}>
            <div className="font-display text-4xl tracking-tight text-cloud sm:text-5xl">
              {m.value}
              {m.accent && <span className={accentColor[i % accentColor.length]}>{m.accent}</span>}
            </div>
            <div className="mt-2 text-xs uppercase tracking-widest text-muted">{m.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
