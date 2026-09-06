import type { Metadata } from "next";
import { Shield, Cpu, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Cta } from "@/components/sections/cta";
import { steps } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "How it works — Sathi" };

const icons = [Shield, Cpu, Zap];

// HOW IT WORKS — its own route (/how-it-works). Edit freely; theme comes from layout.
export default function HowItWorksPage() {
  return (
    <>
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-8 pt-36 lg:px-8 sm:pt-44">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-6xl">
            Three steps to <span className="text-gradient">automation.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            A guided setup that gets your assistant live without touching a single line of code.
          </p>
        </Reveal>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 lg:px-8">
        <div className="relative space-y-6">
          {/* connecting line */}
          <div className="absolute left-1/2 top-6 bottom-6 hidden w-px -translate-x-1/2 bg-gradient-to-b from-violet/50 via-iris/40 to-transparent md:block" />
          {steps.map((s, i) => {
            const Icon = icons[i] ?? Shield;
            const right = i % 2 === 1;
            return (
              <Reveal key={s.num} delay={i * 120}>
                <div className={cn("flex flex-col items-center gap-8 md:flex-row md:gap-14", right && "md:flex-row-reverse")}>
                  <div className={cn("flex w-full flex-col md:w-1/2", right ? "md:items-start md:text-left" : "md:items-end md:text-right")}>
                    <h3 className="flex items-center gap-3 text-2xl">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-violet-soft"><Icon size={20} /></span>
                      {s.title}
                    </h3>
                    <p className="mt-3 max-w-md text-muted">{s.body}</p>
                  </div>

                  <div className="relative z-10 grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-violet/30 bg-ink-700 font-display text-xl text-white shadow-[0_0_30px_rgba(109,94,246,0.25)]">
                    {s.num}
                  </div>

                  <div className="glass w-full max-w-md rounded-2xl p-6 md:w-1/2">
                    <div className="mb-4 h-3 w-1/3 rounded bg-white/5" />
                    <div className="mb-3 h-3 w-full rounded bg-white/5" />
                    <div className="mb-3 h-3 w-5/6 rounded bg-white/5" />
                    <div className="h-3 w-4/6 rounded bg-white/5" />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <Cta title="Set it up once." subtitle="From the account you already have to an assistant that never clocks out." />
    </>
  );
}
