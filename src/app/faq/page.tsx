"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { faqs } from "@/lib/site";
import { cn } from "@/lib/utils";

// FAQ — /faq. Questions live in src/lib/site.ts.
export default function FaqPage() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28 pt-36 lg:px-8 sm:pt-44">
      <Reveal className="mb-14 text-center">
        <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-6xl">
          Questions, <span className="text-gradient">answered.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Everything about security, safety, and how it runs day to day.
        </p>
      </Reveal>

      <div className="space-y-4">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={item.q} delay={i * 80}>
              <div className={cn("glass overflow-hidden rounded-2xl", isOpen && "border-violet/30")}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-7 py-6 text-left text-lg text-cloud"
                  aria-expanded={isOpen}
                >
                  {item.q}
                  {isOpen ? <Minus size={20} className="shrink-0 text-violet-soft" /> : <Plus size={20} className="shrink-0 text-muted" />}
                </button>
                <div className={cn("grid overflow-hidden px-7 transition-all duration-300", isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]")}>
                  <p className="min-h-0 leading-relaxed text-muted">{item.a}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
