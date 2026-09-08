"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, RefreshCw, MessageSquare, ArrowLeft, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Msg = { customer_id: number; role: string; content: string; created_at: string };
type Group = { customer_id: number; messages: Msg[] };

export default function ConversationsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New States for Messenger-style UI
  const [activeId, setActiveId] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from("conversations")
        .select("customer_id,role,content,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(400);
        
      const rows = (data as Msg[]) ?? [];
      const order: number[] = [];
      const map = new Map<number, Msg[]>();
      
      for (const r of rows) {
        if (!map.has(r.customer_id)) { 
          map.set(r.customer_id, []); 
          order.push(r.customer_id); 
        }
        map.get(r.customer_id)!.push(r);
      }
      
      const formattedGroups = order.map((id) => ({ 
        customer_id: id, 
        messages: map.get(id)!.slice().reverse() 
      }));
      
      setGroups(formattedGroups);
      setLoading(false);
      
      // Auto-select the first conversation on desktop if nothing is selected
      if (typeof window !== "undefined" && window.innerWidth >= 768 && !activeId && formattedGroups.length > 0) {
        setActiveId(formattedGroups[0].customer_id);
      }
    }

    load();

    const channel = supabase
      .channel("conversations-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  // Auto-scroll to the bottom when a new message arrives or chat changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeId, groups]);

  const activeGroup = groups.find((g) => g.customer_id === activeId);

  return (
    <section className="dash" style={{ display: "flex", flexDirection: "column", height: "100vh", paddingBottom: "24px" }}>
      
      {/* Page Header */}
      <div className="flex-shrink-0 mb-6">
        <Link href="/dashboard" className="back-link mb-4 inline-flex"><ChevronLeft size={16} /> Back to dashboard</Link>
        <div className="dash-head flex flex-wrap gap-4 items-start justify-between">
          <div>
            <h1 className="dash-title">Inbox</h1>
            <p className="muted mt-2 text-sm">Live conversations between your AI and customers.</p>
          </div>
          <span className="badge-ok" style={{ boxShadow: "0 0 12px rgba(61,220,151,0.2)" }}>
            <RefreshCw size={13} className="animate-spin-slow" /> Live Sync
          </span>
        </div>
      </div>

      {/* Messenger UI Container */}
      <div className="glass flex-1 flex overflow-hidden rounded-2xl relative shadow-2xl" style={{ border: "1px solid var(--line)", background: "rgba(18, 20, 31, 0.7)" }}>
        
        {/* LEFT SIDEBAR: Customer List */}
        <div className={cn(
          "w-full md:w-80 flex-col border-r border-[var(--line)] bg-[var(--surface)] transition-all duration-300",
          activeId !== null ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b border-[var(--line)] font-medium text-[var(--text)] flex items-center gap-2">
            <MessageSquare size={18} className="text-[var(--violet-soft)]" /> Chats
          </div>
          
          <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
            {loading ? (
              <p className="empty text-center mt-10 text-sm">Loading chats…</p>
            ) : groups.length === 0 ? (
              <p className="empty text-center mt-10 text-sm px-4">No conversations yet.</p>
            ) : (
              groups.map((g) => {
                const isActive = g.customer_id === activeId;
                const lastMsg = g.messages[g.messages.length - 1];
                return (
                  <button
                    key={g.customer_id}
                    onClick={() => setActiveId(g.customer_id)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl transition-all duration-300 flex items-start gap-3 border",
                      isActive 
                        ? "bg-gradient-to-br from-[var(--violet)] to-[var(--violet-deep)] border-transparent shadow-[0_4px_20px_rgba(109,94,246,0.3)]" 
                        : "bg-[var(--white-05)] border-[var(--line)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(109,94,246,0.3)]"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", isActive ? "bg-white/20 text-white" : "bg-[var(--white-06)] text-[var(--violet-soft)]")}>
                      <User size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-medium text-sm truncate", isActive ? "text-white" : "text-[var(--text)]")}>
                        Customer #{g.customer_id}
                      </div>
                      <div className={cn("text-xs mt-1 truncate", isActive ? "text-white/80" : "text-[var(--muted)]")}>
                        {lastMsg?.content}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT AREA: Main Chat Box */}
        <div className={cn(
          "flex-1 flex-col bg-[var(--bg-900)] relative transition-all duration-300",
          activeId === null ? "hidden md:flex" : "flex"
        )}>
          {/* Subtle Background Glow for Chat */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[rgba(109,94,246,0.05)] blur-[100px] rounded-full pointer-events-none" />

          {activeId ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-[var(--line)] bg-[rgba(18,20,31,0.9)] backdrop-blur-md px-6 flex items-center gap-4 sticky top-0 z-10">
                <button 
                  onClick={() => setActiveId(null)}
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--white-05)] text-[var(--text)]"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--violet)] to-[var(--iris)] flex items-center justify-center text-white font-medium shadow-[0_0_15px_rgba(109,94,246,0.3)]">
                  #{activeId}
                </div>
                <div>
                  <div className="font-medium text-[var(--text)] text-sm">Customer #{activeId}</div>
                  <div className="text-xs text-[var(--mint)] flex items-center gap-1 mt-0.5">
                    <span className="dot" style={{ width: 6, height: 6 }}></span> Online Session
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {activeGroup?.messages.map((m, i) => (
                  <div key={i} className={cn("msg-row relative", m.role === "assistant" && "right")}>
                    <div className={cn(
                      "msg shadow-lg !max-w-[85%] md:!max-w-[70%]", 
                      m.role === "assistant" 
                        ? "bot bg-gradient-to-br from-[var(--violet)] to-[var(--violet-deep)] text-white border-none" 
                        : "cust bg-[var(--white-06)] border-[var(--line)] text-[var(--text)]"
                    )} style={{ animation: "msg-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
                      
                      <div className="whitespace-pre-wrap text-[14px] leading-relaxed">{m.content}</div>
                      
                      <div className={cn(
                        "text-[10px] mt-2 text-right",
                        m.role === "assistant" ? "text-white/70" : "text-[var(--muted)]"
                      )}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {/* Auto-scroll target */}
                <div ref={chatEndRef} className="h-4" />
              </div>
            </>
          ) : (
            // Empty State (When no chat is selected on desktop)
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 rounded-2xl bg-[var(--white-05)] flex items-center justify-center text-[var(--violet-soft)] mb-6 shadow-xl border border-[var(--line)]">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-xl font-medium text-[var(--text)] mb-2">Your AI Inbox</h3>
              <p className="text-[var(--muted)] max-w-sm text-sm">Select a customer from the left to view their real-time conversation with your AI assistant.</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar CSS (Invisible standard scroll, sleek thin scroll) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow { animation: spin 3s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--white-05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--violet-soft); }
      `}} />
    </section>
  );
}
