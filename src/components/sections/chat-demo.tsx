"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Mic, Paperclip, Send, CheckCheck, ShieldCheck, Sparkles } from "lucide-react";
import { demoScript } from "@/lib/site";
import { cn } from "@/lib/utils";

type Item = (typeof demoScript)[number] & { id: number; time: string };

const BARS =;

export function ChatDemo() {
  const [shown, setShown] = useState<Item[]>([]);
  const [indicator, setIndicator] = useState<null | { from: "customer" | "bot"; kind: "text" | "voice" }>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(
        demoScript.map((m, i) => ({
          ...m,
          id: i,
          time: `10:4${i} AM`,
        })),
      );
      return;
    }

    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      if (i >= demoScript.length) {
        timers.push(
          setTimeout(() => {
            setShown([]);
            i = 0;
            run();
          }, 3600),
        );
        return;
      }
      const msg = demoScript[i];
      setIndicator({ from: msg.from, kind: msg.kind });
      timers.push(
        setTimeout(() => {
          setIndicator(null);
          setShown((s) => [
            ...s,
            { ...msg, id: i, time: `10:4${Math.min(i, 9)} AM` },
          ]);
          i += 1;
          timers.push(setTimeout(run, 750));
        }, msg.kind === "voice" ? 1150 : 900),
      );
    };
    timers.push(setTimeout(run, 600));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [shown, indicator]);

  return (
    <div className="chat-demo-wrapper">
      <style>{`
        .chat-demo-wrapper {
          position: relative;
          width: 100%;
          max-width: 480px;
          margin: 44px auto 0;
          perspective: 1000px;
        }

        .chat-demo-glow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 130%;
          height: 120%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(109, 94, 246, 0.22) 0%, rgba(168, 85, 247, 0.12) 40%, transparent 70%);
          filter: blur(80px);
          border-radius: 9999px;
          pointer-events: none;
          z-index: -1;
        }

        .chat-demo-window {
          background: rgba(18, 20, 31, 0.72);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 28px 70px -15px rgba(0, 0, 0, 0.65), 0 0 35px rgba(109, 94, 246, 0.16);
          display: flex;
          flex-direction: column;
        }

        .chat-demo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(6, 7, 12, 0.5);
        }

        .chat-demo-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          background: linear-gradient(135deg, #6d5ef6, #a855f7);
          box-shadow: 0 4px 14px rgba(109, 94, 246, 0.4);
        }

        .chat-demo-thread {
          height: 380px;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: radial-gradient(circle at top right, rgba(109, 94, 246, 0.04), transparent 60%);
          scrollbar-width: none;
        }
        .chat-demo-thread::-webkit-scrollbar {
          display: none;
        }

        .chat-bubble {
          max-width: 84%;
          border-radius: 18px;
          padding: 12px 16px;
          font-size: 14.5px;
          line-height: 1.45;
          position: relative;
          word-break: break-word;
          animation: msg-pop 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .chat-bubble.cust {
          align-self: flex-start;
          border-bottom-left-radius: 4px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #f4f5fb;
        }

        .chat-bubble.bot {
          align-self: flex-end;
          border-bottom-right-radius: 4px;
          background: linear-gradient(135deg, #6d5ef6, #5647d9);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(109, 94, 246, 0.25);
        }

        .chat-meta {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          margin-top: 4px;
          font-size: 11px;
          opacity: 0.65;
        }

        .chat-demo-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(6, 7, 12, 0.6);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .chat-input-fake {
          flex: 1;
          font-size: 13.5px;
          color: var(--muted);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 9999px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          background: var(--violet);
          color: #fff;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(109, 94, 246, 0.4);
        }

        @media (max-width: 640px) {
          .chat-demo-wrapper {
            max-width: 100%;
            margin-top: 32px;
          }
          .chat-demo-thread {
            height: 330px;
            padding: 14px;
          }
        }
      `}</style>

      <div className="chat-demo-glow" />

      <div className="chat-demo-window">
        {/* Header */}
        <div className="chat-demo-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="chat-demo-avatar">A</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Your Store Support</span>
                <span style={{ display: "inline-flex", color: "var(--sky)" }}>
                  <Sparkles size={14} />
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--mint)", marginTop: 2 }}>
                <span className="dot" style={{ width: 7, height: 7 }} />
                <span>Autogram AI · Online 24/7</span>
              </div>
            </div>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 9999, background: "rgba(61, 220, 151, 0.1)", border: "1px solid rgba(61, 220, 151, 0.2)", fontSize: 11, color: "var(--mint)" }}>
            <ShieldCheck size={13} /> Guardrails Active
          </div>
        </div>

        {/* Message Thread */}
        <div className="chat-demo-thread" ref={scroller}>
          {shown.map((m) => (
            <div
              key={m.id}
              className={cn("chat-bubble", m.from === "customer" ? "cust" : "bot")}
            >
              {m.kind === "text" ? (
                <div>{m.text}</div>
              ) : (
                <VoiceBubble from={m.from} dur={m.dur ?? "0:05"} />
              )}
              <div className="chat-meta">
                <span>{m.time}</span>
                {m.from === "bot" && <CheckCheck size={14} style={{ color: "#a5b4fc" }} />}
              </div>
            </div>
          ))}

          {indicator && (
            <div
              className={cn(
                "chat-bubble",
                indicator.from === "customer" ? "cust" : "bot",
                "indi",
              )}
              style={{ padding: "10px 14px" }}
            >
              <Indicator from={indicator.from} kind={indicator.kind} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="chat-demo-footer">
          <Paperclip size={18} style={{ color: "var(--muted)", cursor: "pointer", flexShrink: 0 }} />
          <div className="chat-input-fake">
            <span>Autogram replying autonomously...</span>
            <Mic size={15} style={{ color: "var(--violet-soft)" }} />
          </div>
          <div className="chat-send-btn">
            <Send size={15} style={{ transform: "translateX(1px)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function VoiceBubble({ from, dur }: { from: "customer" | "bot"; dur: string }) {
  const bot = from === "bot";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 9999,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          background: bot ? "rgba(255,255,255,0.2)" : "rgba(109,94,246,0.2)",
          color: bot ? "#fff" : "var(--violet-soft)",
        }}
      >
        <Play size={13} style={{ transform: "translateX(1px)" }} />
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 3, height: 24 }}>
        {BARS.map((h, i) => (
          <span
            key={i}
            className={cn("wave-bar", bot ? "bot" : "cust")}
            style={{
              height: Math.round(h * 20) + "px",
              animationDelay: i * 0.05 + "s",
            }}
          />
        ))}
      </span>
      <span style={{ flexShrink: 0, fontFamily: "monospace", fontSize: 11, color: bot ? "rgba(255,255,255,0.8)" : "var(--muted)" }}>
        {dur}
      </span>
    </div>
  );
}

function Indicator({ from, kind }: { from: "customer" | "bot"; kind: "text" | "voice" }) {
  if (kind === "voice") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
        <Mic size={14} className="rec-icon" />
        <span style={{ color: "var(--muted)" }}>recording voice note…</span>
      </div>
    );
  }
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
      <span className="typing-dot" />
      <span className="typing-dot" style={{ animationDelay: ".2s" }} />
      <span className="typing-dot" style={{ animationDelay: ".4s" }} />
    </div>
  );
}
