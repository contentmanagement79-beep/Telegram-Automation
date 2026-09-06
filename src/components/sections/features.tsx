import { ShieldCheck, Hand, Mic, Lock, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { features } from "@/lib/site";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  guardrails: ShieldCheck,
  takeover: Hand,
  media: Mic,
  isolation: Lock,
};

const span: Record<string, string> = {
  lead: "md:col-span-2 md:row-span-2",
  wide: "md:col-span-2",
  sm: "",
};

const glow: Record<string, string> = {
  guardrails: "bg-violet/20",
  takeover: "bg-iris/20",
  media: "bg-sky/20",
  isolation: "bg-mint/15",
};

export function Features() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-8">
      <Reveal className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="text-4xl leading-tight sm:text-5xl">
          Architected for <span className="text-gradient">conversion.</span>
        </h2>
        <p className="mt-5 text-lg text-muted">
          Every part is built to turn your Telegram inbox into a calm, reliable sales desk.
        </p>
      </Reveal>

      <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-5 md:grid-cols-4">
        {features.map((f, i) => {
          const Icon = icons[f.key] ?? ShieldCheck;
          const lead = f.size === "lead";
          return (
            <Reveal key={f.key} delay={(i % 3) * 90} className={cn(span[f.size], "[&>*]:h-full")}>
              <article className="group glass glass-hover relative flex h-full flex-col justify-end overflow-hidden rounded-3xl p-8">
                <div className={cn("pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100", glow[f.key], "opacity-70")} />
                <span className={cn("relative grid place-items-center rounded-xl", lead ? "h-12 w-12 bg-gradient-to-br from-violet to-iris text-white" : "h-11 w-11 bg-white/[0.06] text-violet-soft")}>
                  <Icon size={lead ? 22 : 20} />
                </span>
                <h3 className={cn("relative mt-5", lead ? "text-2xl sm:text-3xl" : "text-lg")}>{f.title}</h3>
                <p className={cn("relative mt-3 leading-relaxed text-muted", lead ? "max-w-md text-base" : "text-sm")}>{f.body}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
