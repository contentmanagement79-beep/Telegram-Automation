"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Radio,
  MessageSquare,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Clock,
  CheckCircle2,
  Pause,
  Play,
  ArrowUpRight,
  Settings,
  Terminal,
  Key,
  Users,
  TrendingUp,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Demo recent conversations
const INITIAL_CHATS = [
  {
    id: "chat-1",
    customer: "Rahim Ahmed",
    handle: "@rahim_dev",
    snippet: "Template er price koto? Instant download hobe?",
    reply: "Hey! $49, payment complete holei instant download link paben.",
    time: "2m ago",
    status: "ai",
    unread: false,
  },
  {
    id: "chat-2",
    customer: "Nafis Fuad",
    handle: "@nafis_99",
    snippet: "Ami bkash e payment korte chai, details den.",
    reply: "Human takeover initiated (//stop command)",
    time: "12m ago",
    status: "takeover",
    unread: true,
  },
  {
    id: "chat-3",
    customer: "Tanvir Hossain",
    handle: "@tanvir_h",
    snippet: "Voice note received (0:08)",
    reply: "Voice note transcribed: 'Docs bundle offer ki available?' -> Answered.",
    time: "34m ago",
    status: "ai",
    unread: false,
  },
  {
    id: "chat-4",
    customer: "Sadia Islam",
    handle: "@sadia_design",
    snippet: "Next.js 14 version e kaj korbe to?",
    reply: "Yes, fully compatible with Next.js 14 App Router.",
    time: "1h ago",
    status: "ai",
    unread: false,
  },
];

export default function DashboardPage() {
  const [isActive, setIsActive] = useState(true);
  const [filter, setFilter] = useState<"all" | "ai" | "takeover">("all");
  const [chats] = useState(INITIAL_CHATS);

  const filteredChats = chats.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  return (
    <div className="dash-container">
      <style>{`
        .dash-container {
          position: relative;
          z-index: 10;
          max-width: 80rem;
          margin: 0 auto;
          padding: 120px 24px 80px;
          min-height: 100vh;
        }

        .dash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 36px;
        }

        .dash-title-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .dash-h1 {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(28px, 4vw, 36px);
          font-weight: 600;
          color: #f4f5fb;
          letter-spacing: -0.02em;
        }

        .dash-sub {
          color: var(--muted);
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dash-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dash-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 36px;
        }

        .dash-stat-card {
          border-radius: 20px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dash-stat-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.05);
        }

        .dash-stat-number {
          font-family: var(--font-display, sans-serif);
          font-size: 32px;
          font-weight: 700;
          color: #f4f5fb;
          line-height: 1;
        }

        .dash-stat-label {
          font-size: 13px;
          color: var(--muted);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* 2-Column Section */
        .dash-main-layout {
          display: grid;
          grid-template-columns: 1.65fr 1fr;
          gap: 24px;
        }

        .dash-panel {
          border-radius: 24px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .panel-title {
          font-size: 18px;
          font-weight: 600;
          color: #f4f5fb;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-pill-group {
          display: flex;
          gap: 6px;
          background: rgba(255, 255, 255, 0.04);
          padding: 3px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .filter-pill {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          color: var(--muted);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-pill.active {
          background: var(--violet);
          color: #fff;
        }

        .chat-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-row-item {
          padding: 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chat-row-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(109, 94, 246, 0.3);
          transform: translateY(-2px);
        }

        .chat-row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-avatar-mini {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(109,94,246,0.3), rgba(168,85,247,0.3));
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .badge-status {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .badge-status.ai {
          background: rgba(61, 220, 151, 0.12);
          color: var(--mint);
          border: 1px solid rgba(61, 220, 151, 0.25);
        }

        .badge-status.takeover {
          background: rgba(168, 85, 247, 0.15);
          color: var(--iris);
          border: 1px solid rgba(168, 85, 247, 0.3);
        }

        .status-config-block {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .config-card {
          padding: 16px;
          border-radius: 16px;
          background: rgba(6, 7, 12, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @media (max-width: 960px) {
          .dash-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dash-main-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .dash-metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div className="dash-header">
        <div className="dash-title-group">
          <h1 className="dash-h1">Assistant Control Desk</h1>
          <p className="dash-sub">
            <span
              className="dot"
              style={{
                background: isActive ? "var(--mint)" : "#ef4444",
                boxShadow: isActive ? "0 0 10px var(--mint)" : "none",
              }}
            />
            {isActive ? "Telegram listener active · Inbound answering online" : "Automation paused"}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setIsActive(!isActive)}
            className="dash-toggle-btn"
            style={{
              background: isActive ? "rgba(61, 220, 151, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: isActive ? "var(--mint)" : "#fca5a5",
              borderColor: isActive ? "rgba(61, 220, 151, 0.3)" : "rgba(239, 68, 68, 0.3)",
            }}
          >
            {isActive ? <Pause size={15} /> : <Play size={15} />}
            {isActive ? "Pause Assistant" : "Resume Assistant"}
          </button>

          <Link href="/pricing" className="btn btn-outline btn-sm">
            <Settings size={15} /> Settings
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="dash-metrics-grid">
        <div className="dash-stat-card glass glass-hover">
          <div className="dash-stat-icon-wrap" style={{ color: "var(--violet-soft)" }}>
            <MessageSquare size={20} />
          </div>
          <div className="dash-stat-number">1,284</div>
          <div className="dash-stat-label">
            <span>Inbound Conversations</span>
            <span style={{ color: "var(--mint)", display: "inline-flex", alignItems: "center", gap: 2 }}>
              <TrendingUp size={13} /> +18%
            </span>
          </div>
        </div>

        <div className="dash-stat-card glass glass-hover">
          <div className="dash-stat-icon-wrap" style={{ color: "var(--mint)" }}>
            <Zap size={20} />
          </div>
          <div className="dash-stat-number">94.2%</div>
          <div className="dash-stat-label">
            <span>Autonomous Resolution</span>
            <span style={{ color: "var(--mint)" }}>Zero hallucination</span>
          </div>
        </div>

        <div className="dash-stat-card glass glass-hover">
          <div className="dash-stat-icon-wrap" style={{ color: "var(--sky)" }}>
            <Clock size={20} />
          </div>
          <div className="dash-stat-number">0.75s</div>
          <div className="dash-stat-label">
            <span>Average Latency</span>
            <span style={{ color: "var(--sky)" }}>Fast response</span>
          </div>
        </div>

        <div className="dash-stat-card glass glass-hover">
          <div className="dash-stat-icon-wrap" style={{ color: "var(--iris)" }}>
            <Users size={20} />
          </div>
          <div className="dash-stat-number">12</div>
          <div className="dash-stat-label">
            <span>Human Takeovers</span>
            <span style={{ fontFamily: "monospace", color: "var(--iris)" }}>//stop</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Recent Chats + System Config */}
      <div className="dash-main-layout">
        {/* Left Column: Live Telegram Inbound Stream */}
        <div className="dash-panel glass">
          <div className="panel-header">
            <div className="panel-title">
              <Radio size={18} className="rec-icon" /> Live Telegram Stream
            </div>

            <div className="filter-pill-group">
              <button
                onClick={() => setFilter("all")}
                className={cn("filter-pill", filter === "all" && "active")}
              >
                All
              </button>
              <button
                onClick={() => setFilter("ai")}
                className={cn("filter-pill", filter === "ai" && "active")}
              >
                AI Handled
              </button>
              <button
                onClick={() => setFilter("takeover")}
                className={cn("filter-pill", filter === "takeover" && "active")}
              >
                Takeovers
              </button>
            </div>
          </div>

          <div className="chat-list">
            {filteredChats.map((c) => (
              <div key={c.id} className="chat-row-item">
                <div className="chat-row-top">
                  <div className="chat-user-info">
                    <div className="chat-avatar-mini">{c.customer.charAt(0)}</div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#f4f5fb" }}>
                        {c.customer}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>
                        {c.handle}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      className={cn("badge-status", c.status === "ai" ? "ai" : "takeover")}
                    >
                      {c.status === "ai" ? (
                        <>
                          <Bot size={12} /> AI Replying
                        </>
                      ) : (
                        <>
                          <Users size={12} /> Manual Takeover
                        </>
                      )}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{c.time}</span>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: "rgba(244,245,251,0.8)", paddingLeft: 42 }}>
                  <span style={{ color: "var(--muted)" }}>Customer:</span> &ldquo;{c.snippet}&rdquo;
                </div>

                <div
                  style={{
                    fontSize: 12.5,
                    color: c.status === "ai" ? "var(--violet-soft)" : "var(--iris)",
                    paddingLeft: 42,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ color: "var(--muted)" }}>Latest:</span> {c.reply}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Connection & Gateway Health */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Telegram Gateway Card */}
          <div className="dash-panel glass">
            <div className="panel-title">
              <Phone size={18} style={{ color: "var(--sky)" }} /> Telegram Gateway
            </div>

            <div className="status-config-block">
              <div className="config-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Session Protocol</span>
                  <span style={{ fontSize: 12, color: "var(--mint)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <Lock size={12} /> AES-256 Validated
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Listener Daemon</span>
                  <span style={{ fontSize: 12, color: "#f4f5fb", fontFamily: "monospace" }}>PID 4192 (Online)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Account Mode</span>
                  <span style={{ fontSize: 12, color: "var(--sky)" }}>Inbound-Only (Safe)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini BYOK Status */}
          <div className="dash-panel glass">
            <div className="panel-title">
              <Sparkles size={18} style={{ color: "var(--violet-soft)" }} /> Gemini Model (BYOK)
            </div>

            <div className="status-config-block">
              <div className="config-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Active Model</span>
                  <span style={{ fontSize: 12, color: "var(--violet-soft)", fontWeight: 600 }}>Gemini 1.5 Flash</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>API Key Status</span>
                  <span style={{ fontSize: 12, color: "var(--mint)", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={12} /> Connected
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Price Guardrail</span>
                  <span style={{ fontSize: 12, color: "var(--text)" }}>Locked to $49 Catalog</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Voice Synthesis</span>
                  <span style={{ fontSize: 12, color: "var(--text)" }}>edge-tts (Active)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Takeover Helper */}
          <div className="dash-panel glass" style={{ border: "1px solid rgba(168, 85, 247, 0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--iris)" }}>
              <Terminal size={16} /> Human Take-over Commands
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              যেকোনো টেলিগ্রাম চ্যাটে গিয়ে <code style={{ color: "#fff", background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>//stop</code> লিখলেই সেই কাস্টমারের জন্য বট মিউট হয়ে যাবে। আপনি নিজে কথা শেষ করার পর <code style={{ color: "#fff", background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>//start</code> লিখলে বট আবার স্বয়ংক্রিয় রিপ্লাই শুরু করবে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
