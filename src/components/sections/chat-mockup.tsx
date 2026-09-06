"use client";

import { useState } from "react";
import { ArrowRight, Bot, UserCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interactive demo of the take-over feature.
 * Toggling shows the AI pausing for one customer while the owner replies.
 */
export function ChatMockup() {
  const [takeover, setTakeover] = useState(false);

  return (
    <div className="relative mx-auto mt-8 w-full max-w-4xl">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/20 blur-[120px]" />

      <div className="glass animate-float flex flex-col overflow-hidden rounded-3xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-line bg-black/30 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet to-iris font-display text-white">C</div>
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-ink-700 bg-mint" />
            </div>
            <div className="text-left leading-tight">
              <p className="flex items-center gap-2 text-sm font-medium text-cloud">
                Customer chat
                <span className="rounded-full border border-violet/30 bg-violet/15 px-2 py-0.5 text-[10px] text-violet-soft">
                  {takeover ? "Paused" : "AI handling"}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {takeover ? (
                  <span className="text-amber-400">You are in control</span>
                ) : (
                  "replies in seconds"
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setTakeover((v) => !v)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95",
              takeover
                ? "border-amber-500/30 bg-amber-500/15 text-amber-400"
                : "border-violet/30 bg-violet/15 text-violet-soft",
            )}
          >
            {takeover ? <Bot size={15} /> : <UserCheck size={15} />}
            <span className="hidden sm:inline">{takeover ? "Resume AI (//start)" : "Take over (//stop)"}</span>
            <span className="sm:hidden">{takeover ? "Resume" : "Take over"}</span>
          </button>
        </div>

        {/* thread */}
        <div className="flex h-[380px] flex-col gap-5 overflow-y-auto bg-black/20 p-6 text-left">
          <Bubble side="left" time="10:42 AM">
            Hey! Do you have the Next.js SaaS template? And do you take bKash?
          </Bubble>

          <Bubble side="right" ai time="10:42 AM">
            Hello! 👋 Yes, the Next.js SaaS template is <strong>৳3,900</strong>. And bKash works perfectly — payment confirmed, download link arrives instantly 🚀
          </Bubble>

          <Bubble side="left" time="10:43 AM">
            great, ekta discount hobe? bulk e 3 ta nibo
          </Bubble>

          {/* take-over reveal */}
          <div className={cn("flex flex-col gap-5 overflow-hidden transition-all duration-500", takeover ? "mt-1 max-h-[420px] opacity-100" : "max-h-0 opacity-0")}>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-400">
                🛑 You typed <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-white">//stop</code> — AI paused for this customer
              </span>
            </div>
            <Bubble side="right" owner time="10:44 AM">
              Owner here! 3 নিলে bundle 35% off — ৳7,600 সব মিলিয়ে। bKash number দিচ্ছি, পেমেন্ট হলেই তিনটার লিংক পাঠাই 🙌
            </Bubble>
          </div>
        </div>

        {/* input */}
        <div className="border-t border-line bg-black/30 p-4 backdrop-blur-xl">
          <div className="relative flex items-center">
            <input
              readOnly
              placeholder={takeover ? "Type your message manually…" : "AI is handling this conversation…"}
              className={cn(
                "w-full rounded-full border border-line bg-white/5 py-3.5 pl-5 pr-14 text-sm text-cloud placeholder-muted focus:outline-none",
                !takeover && "cursor-not-allowed opacity-60",
              )}
            />
            <button
              className={cn(
                "absolute right-2 grid h-9 w-9 place-items-center rounded-full transition-all",
                takeover ? "bg-violet text-white hover:scale-105" : "cursor-not-allowed bg-white/10 text-muted",
              )}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  side,
  ai,
  owner,
  time,
  children,
}: {
  side: "left" | "right";
  ai?: boolean;
  owner?: boolean;
  time: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex", side === "left" ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-md md:max-w-[70%]",
          side === "left" && "rounded-tl-none border border-line bg-white/5 text-cloud/90",
          side === "right" && ai && "rounded-tr-none border border-violet/20 bg-gradient-to-br from-violet/90 to-iris/80 text-white",
          side === "right" && owner && "rounded-tr-none border border-white/10 bg-ink-600 text-white",
        )}
      >
        <p>{children}</p>
        <span className={cn("mt-2 flex items-center justify-end gap-1 font-mono text-[10px]", side === "left" ? "text-muted" : "text-white/70")}>
          {ai && <Sparkles size={11} />}
          {owner && <UserCheck size={11} />}
          {ai ? "AI Assistant" : owner ? "You" : ""} · {time}
        </span>
      </div>
    </div>
  );
}
