"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, RefreshCw, MessageSquare, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Msg = { customer_id: number; role: string; content: string; created_at: string };
type Group = { customer_id: number; messages: Msg[] };

export default function ConversationsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

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
        if (!map.has(r.customer_id)) { map.set(r.customer_id, []); order.push(r.customer_id); }
        map.get(r.customer_id)!.push(r);
      }
      
      const formattedGroups = order.map((id) => ({ customer_id: id, messages: map.get(id)!.slice().reverse() }));
      setGroups(formattedGroups);
      setLoading(false);

      // ডেস্কটপে প্রথম চ্যাট অটো-সিলেক্ট করার জন্য
      if (typeof window !== "undefined" && window.innerWidth >= 860 && !activeId && formattedGroups.length > 0) {
        setActiveId(formattedGroups[0].customer_id);
      }
    }

    load();

    const channel = supabase
      .channel("conversations-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeId]);

  const activeGroup = groups.find((g) => g.customer_id === activeId);

  return (
    <section className="dash" style={{ paddingBottom: 0, height: "100vh", display: "flex", flexDirection: "column" }}>
      
      <div style={{ flexShrink: 0 }}>
        <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
        <div className="dash-head">
          <div>
            <h1 className="dash-title">Conversations</h1>
            <p className="muted" style={{ marginTop: 8 }}>Live inbox connecting your AI assistant and customers.</p>
          </div>
          <span className="badge-ok glass" style={{ padding: "8px 16px" }}>
            <RefreshCw size={14} className="float" style={{ animationDuration: "3s" }} /> Live Sync
          </span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .msg-layout { display: flex; gap: 24px; margin-top: 32px; flex: 1; overflow: hidden; min-height: 500px; padding-bottom: 32px; }
        
        /* Sidebar Styles */
        .msg-sidebar { width: 340px; display: flex; flex-direction: column; overflow: hidden; border-radius: var(--radius-xl); }
        .msg-list { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .msg-list::-webkit-scrollbar { width: 4px; }
        .msg-list::-webkit-scrollbar-thumb { background: var(--white-06); border-radius: 4px; }
        
        .chat-item { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 14px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
        .chat-item:hover { background: var(--white-05); }
        .chat-item.active { background: rgba(109, 94, 246, 0.15); border-color: rgba(109, 94, 246, 0.3); }
        .chat-item-avatar { width: 42px; height: 42px; border-radius: 999px; background: linear-gradient(135deg, var(--violet), var(--violet-deep)); display: grid; place-items: center; font-weight: 600; color: #fff; flex-shrink: 0; }
        
        /* Animated Multi-Color Border Setup */
        .animated-border-box {
          flex: 1;
          position: relative;
          border-radius: var(--radius-xl);
          overflow: hidden;
          padding: 2px; /* বর্ডারের পুরুত্ব */
          display: flex;
          flex-direction: column;
        }
        .animated-border-box::before {
          content: "";
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: conic-gradient(
            transparent, 
            var(--violet-soft), 
            var(--sky), 
            var(--mint), 
            var(--iris), 
            transparent 30%
          );
          animation: spin-border 4s linear infinite;
          z-index: 0;
        }
        @keyframes spin-border { 100% { transform: rotate(360deg); } }
        
        .chat-inner {
          position: relative;
          z-index: 1;
          background: var(--surface);
          border-radius: calc(var(--radius-xl) - 2px);
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-messages { flex: 1; overflow-y: auto; padding: 24px; }
        .chat-messages::-webkit-scrollbar { width: 6px; }
        .chat-messages::-webkit-scrollbar-thumb { background: var(--white-06); border-radius: 4px; }
        
        .mob-back { display: none; margin-right: 12px; }
        
        /* Mobile Responsive */
        @media (max-width: 860px) {
          .msg-sidebar { width: 100%; display: ${activeId ? 'none' : 'flex'}; }
          .animated-border-box { display: ${activeId ? 'flex' : 'none'}; }
          .mob-back { display: grid; }
        }
      `}} />

      <div className="msg-layout">
        
        {/* ================= LEFT: SIDEBAR ================= */}
        <div className="msg-sidebar glass">
          <div className="chat-head" style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", background: "rgba(18,20,31,0.5)" }}>
            <MessageSquare size={18} style={{ color: "var(--violet-soft)" }} />
            <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text)" }}>Inbox</span>
          </div>
          
          <div className="msg-list">
            {loading ? (
              <p className="empty center" style={{ marginTop: 40 }}>Loading...</p>
            ) : groups.length === 0 ? (
              <p className="empty center" style={{ marginTop: 40 }}>No conversations yet.</p>
            ) : (
              groups.map((g) => {
                const lastMsg = g.messages[g.messages.length - 1];
                return (
                  <div 
                    key={g.customer_id} 
                    className={cn("chat-item", activeId === g.customer_id && "active")}
                    onClick={() => setActiveId(g.customer_id)}
                  >
                    <div className="chat-item-avatar">#{g.customer_id.toString().slice(-2)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "var(--text)", fontWeight: 500, fontSize: 14 }}>Customer #{g.customer_id}</div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {lastMsg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT: CHAT BOX WITH ANIMATED BORDER ================= */}
        <div className="animated-border-box">
          <div className="chat-inner">
            {activeId ? (
              <>
                <div className="chat-head" style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", background: "rgba(18,20,31,0.8)", backdropFilter: "blur(10px)" }}>
                  <button className="icon-btn mob-back" onClick={() => setActiveId(null)}>
                    <ArrowLeft size={18} />
                  </button>
                  <div className="chat-item-avatar" style={{ width: 36, height: 36, fontSize: 12 }}>#{activeId.toString().slice(-2)}</div>
                  <div>
                    <div style={{ color: "var(--text)", fontWeight: 500, fontSize: 15 }}>Customer #{activeId}</div>
                    <div className="chat-status" style={{ marginTop: 4 }}><div className="dot" /> Active Session</div>
                  </div>
                </div>

                <div className="chat-messages">
                  {activeGroup?.messages.map((m, i) => (
                    <div key={i} className={cn("row", m.role === "assistant" ? "right" : "left")} style={{ marginBottom: 16 }}>
                      <div className={cn("bubble", m.role === "assistant" ? "bot" : "cust")} style={{ color: m.role === "assistant" ? "#fff" : "var(--text)" }}>
                        {m.content}
                        <div style={{ fontSize: 10, opacity: 0.6, marginTop: 8, textAlign: m.role === "assistant" ? "right" : "left" }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 24, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "16px", background: "var(--white-05)", display: "grid", placeItems: "center", color: "var(--violet-soft)", marginBottom: 20 }}>
                  <MessageSquare size={28} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--text)" }}>Select a Chat</h2>
                <p className="muted" style={{ marginTop: 12, maxWidth: 300 }}>Click on a customer from the left sidebar to view their live conversation.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </section>
  );
}
