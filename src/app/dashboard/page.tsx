import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Bot, KeyRound, MessageSquare, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard — Autogram" };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = (user.user_metadata?.full_name as string) || user.email;

  // connection status
  const { data: tg } = await supabase.from("telegram_accounts").select("status").eq("user_id", user.id).maybeSingle();
  const { count: keyCount } = await supabase
    .from("ai_keys").select("id", { count: "exact", head: true })
    .eq("user_id", user.id).eq("status", "active");
  const { data: persona } = await supabase.from("personas").select("user_id").eq("user_id", user.id).maybeSingle();

  const tgConnected = tg?.status === "connected";
  const hasKey = (keyCount ?? 0) > 0;
  const hasPersona = !!persona;

  const cards = [
    { icon: Bot, title: "Connect Telegram", body: "Link the account the assistant replies from.", href: "/dashboard/connect", ok: tgConnected, okText: "Connected", offText: "Not connected" },
    { icon: KeyRound, title: "Add your AI key", body: "Your Gemini key powers the replies.", href: "/dashboard/ai-key", ok: hasKey, okText: "Key added", offText: "No key yet" },
    { icon: MessageSquare, title: "Build the persona", body: "Set tone, topics, prices and limits.", href: "/dashboard/settings", ok: hasPersona, okText: "Configured", offText: "Using defaults" },
    { icon: Package, title: "Products", body: "Add your catalog so prices stay accurate.", href: "/dashboard/products" },
  ];

  const ready = tgConnected && hasKey;

  return (
    <section className="dash">
      <div className="dash-head">
        <div>
          <h1 className="dash-title">Welcome, {name} 👋</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            {ready ? "Your assistant is live. Message the account from another Telegram to test." : "Finish the steps below to go live."}
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="btn btn-outline btn-sm" type="submit"><LogOut size={16} /> Sign out</button>
        </form>
      </div>

      <div className="dash-cards">
        {cards.map((c) => (
          <Link key={c.title} href={c.href} className="dash-card glass glass-hover" style={{ opacity: 1 }}>
            <span className="dash-ico"><c.icon size={20} /></span>
            <h3 style={{ marginTop: 20, fontSize: 18 }}>{c.title}</h3>
            <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>{c.body}</p>
            {"ok" in c && (
              <span className={cn("badge", c.ok ? "badge-ok" : "badge-off")} style={{ marginTop: 14 }}>
                <span className="dot" style={{ background: c.ok ? "var(--mint)" : "var(--muted)" }} /> {c.ok ? c.okText : c.offText}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
