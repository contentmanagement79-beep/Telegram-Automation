"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Mic } from "lucide-react";
import { demoScript } from "@/lib/site";
import { cn } from "@/lib/utils";

type Item = (typeof demoScript)[number] & { id: number };

const BARS = [0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.55, 0.8, 0.45, 0.75, 0.5, 0.95, 0.6, 0.85, 0.5, 0.7, 0.4, 0.65];

export function ChatDemo() {
  const [shown, setShown] = useState<Item[]>([]);
  const [indicator, setIndicator] = useState<null | { from: "customer" | "bot"; kind: "text" | "voice" }>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(demoScript.map((m, i) => ({ ...m, id: i })));
      return;
    }

    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      if (i >= demoScript.length) {
        timers.push(setTimeout(() => { setShown([]); i = 0; run(); }, 3400));
        return;
      }
      const msg = demoScript[i];
      setIndicator({ from: msg.from, kind: msg.kind });
      timers.push(
        setTimeout(() => {
          setIndicator(null);
          setShown((s) => [...s, { ...msg, id: i }]);
          i += 1;
          timers.push(setTimeout(run, 650));
        }, msg.kind === "voice" ? 1100 : 950),
      );
    };
    timers.push(setTimeout(run, 500));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [shown, indicator]);

  return (
    <div className="chat">
      <div className="chat-glow" />
      <div className="chat-card glass float">
        <div className="chat-head">
          <div className="chat-avatar">A</div>
          <div>
            <p className="chat-name">Your store</p>
            <p className="chat-status"><span className="dot" /> online</p>
          </div>
        </div>

        <div className="chat-thread" ref={scroller}>
          {shown.map((m) => (
            <div key={m.id} className={cn("row", m.from === "customer" ? "left" : "right")}>
              {m.kind === "text" ? (
                <p className={cn("bubble", m.from === "customer" ? "cust" : "bot")}>{m.text}</p>
              ) : (
                <VoiceBubble from={m.from} dur={m.dur ?? "0:05"} />
              )}
            </div>
          ))}

          {indicator && (
            <div className={cn("row", indicator.from === "customer" ? "left" : "right")}>
              <Indicator from={indicator.from} kind={indicator.kind} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VoiceBubble({ from, dur }: { from: "customer" | "bot"; dur: string }) {
  const bot = from === "bot";
  return (
    <div className={cn("bubble voice", bot ? "bot" : "cust")}>
      <span className={cn("voice-btn", bot ? "bot" : "cust")}><Play size={14} style={{ transform: "translateX(1px)" }} /></span>
      <span className="wave">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={cn("wave-bar", bot ? "bot" : "cust")}
            style={{ height: Math.round(h * 22) + "px", animationDelay: i * 0.05 + "s" }}
          />
        ))}
      </span>
      <span className="dur" style={{ color: bot ? "rgba(255,255,255,.7)" : "var(--muted)" }}>{dur}</span>
    </div>
  );
}

function Indicator({ from, kind }: { from: "customer" | "bot"; kind: "text" | "voice" }) {
  if (kind === "voice") {
    return (
      <div className={cn("indi", from === "customer" ? "left" : "right")}>
        <Mic size={14} className="rec-icon" /> <span className="rec-text">recording…</span>
      </div>
    );
  }
  return (
    <div className={cn("indi", from === "customer" ? "left" : "right")}>
      <span className="typing-dot" />
      <span className="typing-dot" style={{ animationDelay: ".2s" }} />
      <span className="typing-dot" style={{ animationDelay: ".4s" }} />
    </div>
  );
}
