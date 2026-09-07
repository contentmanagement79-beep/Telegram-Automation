"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Mic } from "lucide-react";
import { demoScript } from "@/lib/site";
import { cn } from "@/lib/utils";

type Item = (typeof demoScript)[number] & { id: number };

// Fixed bar heights so the waveform looks intentional (not random each render).
const BARS = [0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.55, 0.8, 0.45, 0.75, 0.5, 0.95, 0.6, 0.85, 0.5, 0.7, 0.4, 0.65];

export function ChatDemo() {
  const [shown, setShown] = useState<Item[]>([]);
  const [indicator, setIndicator] = useState<null | { from: "customer" | "bot"; kind: "text" | "voice" }>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      // show a typing / recording indicator on the sender's side first
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
    <div className="relative mx-auto mt-10 w-full max-w-sm">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/20 blur-[120px]" />

      <div className="glass animate-float overflow-hidden rounded-3xl">
        {/* header */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet to-iris font-display text-white">A</div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-cloud">Your store</p>
            <p className="flex items-center gap-1.5 text-xs text-mint"><span className="h-1.5 w-1.5 rounded-full bg-mint" /> online</p>
          </div>
        </div>

        {/* thread */}
        <div ref={scroller} className="h-[360px] space-y-2.5 overflow-y-auto px-4 py-4">
          {shown.map((m) => (
            <Row key={m.id} from={m.from}>
              {m.kind === "text" ? <TextBubble from={m.from} text={m.text ?? ""} /> : <VoiceBubble from={m.from} dur={m.dur ?? "0:05"} />}
            </Row>
          ))}

          {indicator && (
            <Row from={indicator.from}>
              <Indicator from={indicator.from} kind={indicator.kind} />
            </Row>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ from, children }: { from: "customer" | "bot"; children: React.ReactNode }) {
  return <div className={cn("flex", from === "customer" ? "justify-start" : "justify-end")}>{children}</div>;
}

const bubbleBase = "msg-in max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug";
const side = (from: "customer" | "bot") =>
  from === "customer"
    ? "rounded-bl-md border border-line bg-white/[0.06] text-cloud"
    : "rounded-br-md bg-gradient-to-br from-violet to-violet-deep text-white";

function TextBubble({ from, text }: { from: "customer" | "bot"; text: string }) {
  return <p className={cn(bubbleBase, side(from))}>{text}</p>;
}

function VoiceBubble({ from, dur }: { from: "customer" | "bot"; dur: string }) {
  const bot = from === "bot";
  return (
    <div className={cn(bubbleBase, side(from), "flex items-center gap-3 py-3")}>
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", bot ? "bg-white/20 text-white" : "bg-violet/20 text-violet-soft")}>
        <Play size={14} className="translate-x-[1px]" />
      </span>
      <span className="flex h-6 items-center gap-[3px]">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={cn("wave-bar w-[3px] rounded-full", bot ? "bg-white/70" : "bg-violet-soft/70")}
            style={{ height: `${Math.round(h * 22)}px`, animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </span>
      <span className={cn("shrink-0 font-mono text-[11px]", bot ? "text-white/70" : "text-muted")}>{dur}</span>
    </div>
  );
}

function Indicator({ from, kind }: { from: "customer" | "bot"; kind: "text" | "voice" }) {
  const bot = from === "bot";
  const shell = cn(
    "flex items-center gap-2 rounded-2xl px-4 py-3",
    from === "customer" ? "rounded-bl-md border border-line bg-white/[0.06]" : "rounded-br-md bg-violet/80",
  );
  if (kind === "voice") {
    return (
      <div className={shell}>
        <Mic size={14} className={cn("rec-pulse", bot ? "text-white" : "text-violet-soft")} />
        <span className={cn("text-xs", bot ? "text-white/80" : "text-muted")}>recording…</span>
      </div>
    );
  }
  return (
    <div className={shell}>
      <span className="typing-dot" />
      <span className="typing-dot" style={{ animationDelay: "0.2s" }} />
      <span className="typing-dot" style={{ animationDelay: "0.4s" }} />
    </div>
  );
}
