import type { Metadata } from "next";
import { Shield, Cpu, Zap, CheckCircle2, FileText, MessageSquare } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Cta } from "@/components/sections/cta";
import { steps, BRAND } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: `How it works — ${BRAND}` };

const icons = [Shield, Cpu, Zap];

// Custom Component for Animated Step Cards
const StepVisual = ({ index }: { index: number }) => {
  if (index === 0) {
    // Step 1: Configuration & Connection Animation
    return (
      <div className="float" style={{ animationDuration: "5s" }}>
        <div className="key-row" style={{ marginBottom: "16px", background: "var(--surface-2)", borderColor: "rgba(109, 94, 246, 0.3)" }}>
          <span style={{ color: "var(--text)", fontWeight: 500, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={16} className="mint" /> Store API Connected
          </span>
          <span className="badge-ok">Active</span>
        </div>
        <div className="switch-row" style={{ border: "none", padding: 0, marginBottom: "16px" }}>
          <span style={{ color: "var(--text)", fontSize: "14px", opacity: 0.9 }}>Auto-sync inventory</span>
          <div className="switch on"><div className="switch-knob" /></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="step-bar" style={{ width: "100%", height: "6px", margin: 0, background: "var(--white-06)" }} />
          <div className="step-bar" style={{ width: "65%", height: "6px", margin: 0, background: "var(--violet-soft)" }} />
        </div>
      </div>
    );
  }

  if (index === 1) {
    // Step 2: Training / Processing Animation
    return (
      <div className="float" style={{ animationDirection: "reverse", animationDuration: "6s" }}>
        <div style={{ color: "var(--text)", fontSize: "14px", fontWeight: 500, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Cpu size={16} className="mint" /> Processing Knowledge...
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[1, 2, 3].map((num) => (
            <div key={num} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="feat-icon" style={{ width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0 }}>
                <FileText size={14} />
              </div>
              <div style={{ flex: 1, height: "6px", background: "var(--white-05)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  background: "linear-gradient(90deg, var(--violet-soft), var(--sky))",
                  animation: `loadBar 2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate ${num * 0.4}s`
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (index === 2) {
    // Step 3: Live Chat & Typing Animation
    return (
      <div className="float" style={{ animationDuration: "7s" }}>
        <div className="convo" style={{ margin: 0, background: "var(--bg-900)", borderColor: "rgba(109, 94, 246, 0.2)" }}>
          <div className="msg-row left">
            <div className="msg cust" style={{ animation: "msg-pop 0.5s both", color: "var(--text)" }}>Do you have this in Blue?</div>
          </div>
          <div className="msg-row right" style={{ marginTop: "12px" }}>
            <div className="msg bot" style={{ animation: "msg-pop 0.5s 1.5s both" }}>Yes! The blue variant is in stock.</div>
          </div>
          <div className="msg-row left" style={{ marginTop: "12px" }}>
            <div className="indi left" style={{ padding: "8px 12px", animation: "msg-pop 0.5s 3s both" }}>
              <div className="typing-dot" />
              <div className="typing-dot" style={{ animationDelay: "0.2s" }} />
              <div className="typing-dot" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


export default function HowItWorksPage() {
  return (
    <>
      {/* Custom Keyframes for the data loading bar */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loadBar {
          0% { transform: translateX(-100%); opacity: 0.5; }
          100% { transform: translateX(0%); opacity: 1; }
        }
      `}} />

      <section className="how">
        <Reveal className="how-head">
          <h1 className="h2 balance">Three steps to <span className="gradient-text">automation.</span></h1>
          <p className="section-sub">A guided setup that gets your assistant live without touching a single line of code.</p>
        </Reveal>

        <div className="steps">
          <div className="step-line" />
          {steps.map((s, i) => {
            const Icon = icons[i] ?? Shield;
            const right = i % 2 === 1;
            return (
              <Reveal key={s.num} delay={i * 120}>
                <div className={cn("step", right && "right")}>
                  <div className={cn("step-side", right ? "r" : "l")}>
                    <h3 className="step-title"><span className="step-ico"><Icon size={20} /></span>{s.title}</h3>
                    <p className="step-body">{s.body}</p>
                  </div>
                  <div className="step-num">{s.num}</div>
                  
                  {/* Detailed Animated Box */}
                  <div className="step-card glass">
                    <StepVisual index={i} />
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
