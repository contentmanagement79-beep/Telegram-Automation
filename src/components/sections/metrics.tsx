import { Reveal } from "@/components/ui/reveal";
import { metrics } from "@/lib/site";

const accents = ["var(--mint)", "var(--iris)", "var(--violet-soft)", "var(--sky)"];

export function Metrics() {
  return (
    <section className="metrics">
      <div className="container metrics-grid">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 90}>
            <div className="metric-val">
              {m.value}
              {m.accent && <span style={{ color: accents[i % accents.length] }}>{m.accent}</span>}
            </div>
            <div className="metric-label">{m.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
