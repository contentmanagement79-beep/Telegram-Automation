"use client";

import { useEffect, useState, useRef } from "react";
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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeId, groups]);

  const activeGroup = groups.find((g) => g.customer_id === activeId);

  return (
    <section className="dash">
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

      {/* Page specific styles to handle the Split-Screen layout elegantly */}
      <style dangerouslySetInnerHTML={{ __html: `
        .messenger-layout { display: flex; gap: 20px; height: calc(100vh - 280px); min-height: 550px; margin-top: 32px; position: relative; z-index: 10; }
        .sidebar { width: 340px; display: flex; flex-direction: column; overflow: hidden; }
        .chat-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-900); position: relative; }
        .sidebar-item { display: flex; items-center; gap: 12px; padding: 16px; border-bottom: 1px solid var(--line); cursor: pointer; transition: background 0.2s; }
        .sidebar-item:hover { background: var(--white-05); }
        .sidebar-item.active { background: rgba(109, 94, 246, 0.1); border-left: 3px solid var(--violet); }
        .scrollable { flex: 1; overflow-y: auto; overflow-x: hidden; }
        .scrollable::-webkit-scrollbar { width: 6px; }
        .scrollable::-webkit-scrollbar-thumb { background: var(--white-05); border-radius: 10px; }
        
        .mob-back { display: none; margin-right: 12px; }
        
        @media (max-width: 860px) {
          .sidebar { width: 100%; display: ${activeId ? 'none' : 'flex'}; }
          .chat-area { width: 100%; display: ${activeId ? 'flex' : 'none'}; }
          .mob-back { display: block; }
        }
      `}} />

      <div className="messenger-layout">
        {/* Awesome Background Glow from your theme */}
        <div className="chat-glow" />

        {/* ================= LEFT: SIDEBAR ================= */}
        <div className="sidebar chat-card glass">
          <div className="chat-head">
            <MessageSquare size={18} style={{ color: "var(--violet-soft)" }} />
            <span className="chat-name" style={{ fontSize: 16 }}>Chats</span>
          </div>
          
          <div className="scrollable">
            {loading ? (
              <p className="empty center" style={{ padding: "40px 20px" }}>Loading...</p>
            ) : groups.length === 0 ? (
              <p className="empty center" style={{ padding: "40px 20px" }}>No conversations yet.</p>
            ) : (
              groups.map((g) => {
                const lastMsg = g.messages[g.messages.length - 1];
                return (
                  <div 
                    key={g.customer_id} 
                    className={cn("sidebar-item", activeId === g.customer_id && "active")}
                    onClick={() => setActiveId(g.customer_id)}
                  >
                    <div className="chat-avatar">#{g.customer_id}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="chat-name" style={{ color: "var(--text)" }}>Customer #{g.customer_id}</div>
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

        {/* ================= RIGHT: CHAT BOX ================= */}
        <div className="chat-area chat-card glass">
          {activeId ? (
            <>
              {/* Header */}
              <div className="chat-head">
                <button className="icon-btn mob-back" onClick={() => setActiveId(null)}>
                  <ArrowLeft size={16} />
                </button>
                <div className="chat-avatar">#{activeId}</div>
                <div>
                  <div className="chat-name" style={{ color: "var(--text)" }}>Customer #{activeId}</div>
                  <div className="chat-status"><div className="dot" /> Active Session</div>
                </div>
              </div>

              {/* Thread (Using exact classes from your theme) */}
              <div className="chat-thread scrollable">
                {activeGroup?.messages.map((m, i) => (
                  <div key={i} className={cn("row", m.role === "assistant" ? "right" : "left")}>
                    <div className={cn("bubble", m.role === "assistant" ? "bot" : "cust")}>
                      {m.content}
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6, textAlign: m.role === "assistant" ? "right" : "left" }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} style={{ height: "1px" }} />
              </div>
            </>
          ) : (
            // Empty State
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 24, textAlign: "center" }}>
              <div className="chat-avatar" style={{ width: 64, height: 64, marginBottom: 20 }}>
                <MessageSquare size={28} />
              </div>
              <h2 className="dash-title" style={{ fontSize: 24 }}>AI Inbox</h2>
              <p className="muted" style={{ marginTop: 12, maxWidth: 300 }}>Select a customer from the left sidebar to view the live conversation.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
