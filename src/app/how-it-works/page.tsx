import type { Metadata } from "next";
import { Shield, Cpu, Zap, Database, Server, CheckCircle2, Play, Mic, FileText } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Cta } from "@/components/sections/cta";
import { steps, BRAND } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: `How it works — ${BRAND}` };

const icons = [Shield, Cpu, Zap];

const StepVisual = ({ index }: { index: number }) => {
  if (index === 0) {
    // Step 1: Glowing Server Connection
    return (
      <div className="relative z-10 w-full h-full flex flex-col justify-center gap-4 py-2">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[rgba(109,94,246,0.15)] blur-[60px] rounded-full -z-10" />
        
        <div className="key-row float relative overflow-hidden" style={{ background: "rgba(18, 20, 31, 0.8)", borderColor: "rgba(109, 94, 246, 0.4)", animationDuration: "4s" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(109,94,246,0.1), transparent)", animation: "shimmer 2.5s infinite" }} />
          <div className="flex items-center gap-3 relative z-10">
            <div className="feat-icon !w-8 !h-8 !rounded-lg"><Server size={14} /></div>
            <div style={{ color: "var(--text)", fontSize: "14px", fontWeight: 500 }}>Store API</div>
          </div>
          <span className="badge-ok relative z-10" style={{ boxShadow: "0 0 12px rgba(61,220,151,0.3)" }}>Connected</span>
        </div>

        <div className="key-row float relative overflow-hidden" style={{ background: "rgba(18, 20, 31, 0.8)", borderColor: "var(--line)", animationDuration: "5s", animationDelay: "0.5s" }}>
          <div className="flex items-center gap-3">
            <div className="feat-icon !w-8 !h-8 !rounded-lg !bg-[var(--white-05)] !text-[var(--text)]"><Database size={14} /></div>
            <div style={{ color: "var(--text)", fontSize: "14px" }}>Auto-Sync</div>
          </div>
          <div className="switch on shadow-[0_0_12px_rgba(109,94,246,0.5)]">
            <div className="switch-knob" />
          </div>
        </div>
      </div>
    );
  }

  if (index === 1) {
    // Step 2: AI Document Scanning (Laser Effect)
    return (
      <div className="relative z-10 w-full flex items-center justify-center py-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[rgba(56,189,248,0.1)] blur-[50px] rounded-full -z-10" />
        
        <div className="float relative border border-[var(--line)] rounded-xl p-4 bg-[var(--surface-2)] w-full max-w-[240px] overflow-hidden" style={{ animationDuration: "6s" }}>
          {/* Scanning Laser Line */}
          <div className="absolute left-0 right-0 h-[2px] bg-[var(--sky)] shadow-[0_0_15px_3px_rgba(56,189,248,0.5)] z-20" style={{ animation: "scanLaser 2.5s ease-in-out infinite" }} />
          
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <FileText size={20} className="text-[var(--sky)]" />
            <div style={{ height: "6px", width: "40%", background: "var(--white-06)", borderRadius: "4px" }} />
          </div>
          
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-2 items-center">
                <div style={{ height: "6px", flex: 1, background: "var(--white-05)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, var(--sky), var(--violet-soft))", animation: `fillBar 2s ease-out infinite alternate ${i * 0.2}s` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (index === 2) {
    // Step 3: Live Voice & Text Automation
    return (
      <div className="relative z-10 w-full float" style={{ animationDuration: "7s" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[rgba(168,85,247,0.15)] blur-[60px] rounded-full -z-10" />
        
        <div className="convo !m-0 !bg-[rgba(6,7,12,0.6)] !border-[rgba(109,94,246,0.3)] backdrop-blur-md shadow-2xl">
          <div className="msg-row left">
            <div className="msg cust !text-[var(--text)]" style={{ animation: "msg-pop 0.4s both" }}>Can you send a voice note?</div>
          </div>
          
          <div className="msg-row right mt-3">
            <div className="bubble bot !max-w-full" style={{ animation: "msg-pop 0.4s 1s both" }}>
              <div className="voice">
                <div className="voice-btn bot shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                  <Play size={14} fill="currentColor" />
                </div>
                <div className="wave">
                  {[1,2,3,4,5,6,7,8].map((w) => (
                    <div key={w} className="wave-bar bot" style={{ animationDelay: `${w * 0.1}s`, height: w % 2 === 0 ? '16px' : '24px' }} />
                  ))}
                </div>
                <div className="dur">0:04</div>
              </div>
            </div>
          </div>

          <div className="msg-row right mt-2">
            <div className="msg bot !bg-[var(--violet-deep)] !text-white" style={{ animation: "msg-pop 0.4s 2s both" }}>
              Sure! How else can I help?
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
      {/* Advanced Custom Keyframes for WOW Effect */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes fillBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
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
                  
                  {/* Step Card with Glass-Hover Effect */}
                  <div className="step-card glass glass-hover relative">
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
