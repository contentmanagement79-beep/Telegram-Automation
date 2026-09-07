import type { Metadata } from "next";
import { Shield, Cpu, Zap, CheckCircle2, Lock, Sparkles, Radio, Terminal, Bot, MessageSquare } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Cta } from "@/components/sections/cta";
import { steps, BRAND } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: `How it works — ${BRAND}` };

const icons = [Shield, Cpu, Zap];

export default function HowItWorksPage() {
  return (
    <>
      {/* Scoped CSS for timeline points and rich interactive cards */}
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 rgba(109, 94, 246, 0.7);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 28px 10px rgba(168, 85, 247, 0.4);
            opacity: 1;
          }
          100% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 rgba(109, 94, 246, 0.7);
            opacity: 0.9;
          }
        }

        @keyframes line-glow {
          0% { transform: translateY(-100%); opacity: 0; }
          40% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }

        @keyframes dot-ping {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.2); }
        }

        .step-num-animated {
          position: relative;
          z-index: 2;
          width: 68px;
          height: 68px;
          flex-shrink: 0;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at 30% 30%, #1f233a, #0d0f1a);
          border: 2px solid rgba(139, 124, 248, 0.5);
          font-family: var(--font-display, sans-serif);
          font-size: 22px;
          font-weight: 700;
          color: #f4f5fb;
          animation: pulse-ring 3.2s ease-in-out infinite;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .step-num-animated:hover {
          transform: scale(1.12);
          border-color: rgba(168, 85, 247, 0.8);
        }

        .step-num-aura {
          position: absolute;
          inset: -10px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(109, 94, 246, 0.35) 0%, transparent 70%);
          pointer-events: none;
          z-index: -1;
          animation: float 4s ease-in-out infinite;
        }

        .step-line-beam {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 90px;
          background: linear-gradient(180deg, transparent, var(--violet-soft), var(--iris), transparent);
          animation: line-glow 4.5s ease-in-out infinite;
        }

        .step-mockup-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--line);
          backdrop-filter: blur(8px);
        }

        /* Card 1: Console / Terminal */
        .mock-console {
          background: rgba(6, 7, 12, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 12px 14px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .console-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .console-tag {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .tag-pass { background: rgba(61, 220, 151, 0.15); color: var(--mint); }
        .tag-enc { background: rgba(109, 94, 246, 0.18); color: var(--violet-soft); }
        .tag-run {
          background: rgba(56, 189, 248, 0.15);
          color: var(--sky);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* Card 2: Persona Config */
        .mock-persona {
          background: rgba(6, 7, 12, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 13px;
        }
        .persona-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .persona-lbl { color: var(--muted); font-size: 12px; }
        .persona-val { color: var(--text); font-weight: 500; }
        .persona-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 11px;
          color: var(--violet-soft);
        }

        /* Card 3: Live Chat Stream */
        .mock-chat {
          background: rgba(6, 7, 12, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
        }
        .chat-bubble-mini {
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 1.4;
          max-width: 90%;
        }
        .bubble-in {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.06);
          color: var(--text);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .bubble-out {
          align-self: flex-end;
          background: linear-gradient(135deg, rgba(109, 94, 246, 0.35), rgba(168, 85, 247, 0.35));
          border: 1px solid rgba(109, 94, 246, 0.3);
          color: #fff;
        }
        .live-ping {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: var(--mint);
          animation: dot-ping 1.6s ease-in-out infinite;
        }
      `}</style>

      <section className="how">
        <Reveal className="how-head">
          <h1 className="h2 balance">
            Three steps to <span className="gradient-text">automation.</span>
          </h1>
          <p className="section-sub">
            A guided setup that gets your assistant live without touching a single line of code.
          </p>
        </Reveal>

        <div className="steps">
          {/* Timeline Line with traveling light beam */}
          <div className="step-line" style={{ overflow: "hidden" }}>
            <div className="step-line-beam" />
          </div>

          {steps.map((s, i) => {
            const Icon = icons[i] ?? Shield;
            const right = i % 2 === 1;

            return (
              <Reveal key={s.num} delay={i * 120}>
                <div className={cn("step", right && "right")}>
                  {/* Text Description */}
                  <div className={cn("step-side", right ? "r" : "l")}>
                    <h3 className="step-title">
                      <span className="step-ico">
                        <Icon size={20} />
                      </span>
                      {s.title}
                    </h3>
                    <p className="step-body">{s.body}</p>
                  </div>

                  {/* Animated Point / Milestone Node */}
                  <div className="step-num-animated">
                    <div className="step-num-aura" />
                    <span>{s.num}</span>
                  </div>

                  {/* Visual Step Card with Rich Mockups */}
                  <div className="step-card glass glass-hover">
                    {i === 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span className="step-mockup-badge" style={{ color: "var(--mint)" }}>
                            <span className="dot" style={{ background: "var(--mint)", boxShadow: "0 0 8px var(--mint)" }} />
                            Telegram Session Active
                          </span>
                          <span style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Lock size={12} /> AES-256 Encrypted
                          </span>
                        </div>

                        {/* Interactive Terminal Stream */}
                        <div className="mock-console">
                          <div className="console-row">
                            <span style={{ color: "var(--muted)" }}>&gt; API credentials verified</span>
                            <span className="console-tag tag-pass">READY</span>
                          </div>
                          <div className="console-row">
                            <span style={{ color: "var(--muted)" }}>&gt; Session token encrypted</span>
                            <span className="console-tag tag-enc">AES-256</span>
                          </div>
                          <div className="console-row">
                            <span style={{ color: "var(--muted)" }}>&gt; Inbound event listener</span>
                            <span className="console-tag tag-run">
                              <span className="live-ping" /> ACTIVE
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {i === 1 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span className="step-mockup-badge" style={{ color: "var(--violet-soft)" }}>
                            <Sparkles size={13} /> Gemini 1.5 (BYOK)
                          </span>
                          <span className="step-mockup-badge" style={{ color: "var(--sky)" }}>
                            <CheckCircle2 size={13} /> Guardrails Locked
                          </span>
                        </div>

                        {/* Interactive Persona Card */}
                        <div className="mock-persona">
                          <div className="persona-item">
                            <span className="persona-lbl">Tone:</span>
                            <span className="persona-val" style={{ color: "var(--violet-soft)" }}>Warm Banglish &amp; English</span>
                          </div>
                          <div className="persona-item">
                            <span className="persona-lbl">Guardrails:</span>
                            <span className="persona-val" style={{ fontSize: 12, color: "var(--mint)" }}>Strict Catalog Price Lock</span>
                          </div>
                          <div className="persona-item" style={{ paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            <span className="persona-lbl">Supports:</span>
                            <div className="persona-chips">
                              <span className="chip">Voice Notes</span>
                              <span className="chip">Photos/Vision</span>
                              <span className="chip">PDF Docs</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {i === 2 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span className="step-mockup-badge" style={{ color: "var(--mint)" }}>
                            <Radio size={13} className="rec-icon" /> 24/7 Live Answering
                          </span>
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--iris)", background: "rgba(168,85,247,0.12)", padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(168,85,247,0.25)" }}>
                            //stop to take over
                          </span>
                        </div>

                        {/* Interactive Live Dialogue Stream */}
                        <div className="mock-chat">
                          <div className="chat-bubble-mini bubble-in">
                            <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 2 }}>Customer</span>
                            Hi! Template er price koto?
                          </div>
                          <div className="chat-bubble-mini bubble-out">
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 2 }}>Assistant (0.6s)</span>
                            Hey! $49, instant download link pathiye dicchi 👇
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--mint)", marginTop: 2 }}>
                            <span className="live-ping" /> Auto-reply dispatched
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <Cta
        title="Set it up once."
        subtitle="From the account you already have to an assistant that never clocks out."
      />
    </>
  );
}
