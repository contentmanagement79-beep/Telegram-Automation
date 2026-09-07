"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { faqs } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function FaqPage() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="faq">
      <Reveal className="center">
        <h1 className="faq-title">Questions, <span className="gradient-text">answered.</span></h1>
        <p className="faq-sub">Everything about security, safety, and how it runs day to day.</p>
      </Reveal>

      <div className="faq-list">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={item.q} delay={i * 80} className={cn("faq-item glass", isOpen && "open")}>
              <button className="faq-btn" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                {item.q}
                {isOpen ? <Minus size={20} className="faq-icon" /> : <Plus size={20} className="faq-icon" style={{ color: "var(--muted)" }} />}
              </button>
              <div className={cn("faq-body", isOpen && "open")}>
                <p>{item.a}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
