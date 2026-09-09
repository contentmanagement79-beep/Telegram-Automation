import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Bot, KeyRound, MessageSquare, Package, MessagesSquare, Plug, Images, Clock, Users, Lock, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard — Autogram" };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = (user.user_metadata?.full_name as string) || user.email;

  const [tgRows, keyRes, personaRes, settingsRes, flagsRes, planRes] = await Promise.all([
    supabase.from("telegram_accounts").select("status").eq("user_id", user.id).eq("status", "connected"),
    supabase.from("ai_keys").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active"),
    supabase.from("personas").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("platform_settings").select("monetization_on").eq("id", 1).maybeSingle(),
    supabase.from("feature_flags").select("key,tier"),
    supabase.from("plans").select("plan,expires_at").eq("user_id", user.id).maybeSingle(),
  ]);

  const tgConnected = (tgRows.data?.length ?? 0) > 0;
  const hasKey = (keyRes.count ?? 0) > 0;
  const ready = tgConnected && hasKey;

  const mon = settingsRes.data?.monetization_on ?? false;
  const flagMap = new Map((flagsRes.data ?? []).map((f) => [f.key, f.tier]));
  const plan = planRes.data;
  const isPro = !!plan && plan.plan === "pro" && (!plan.expires_at || new Date(plan.expires_at) > new Date());
  const locked = (feature?: string) => !!feature && mon && flagMap.get(feature) === "pro" && !isPro;

  const cards = [
    { icon: Bot, title: "Connect Telegram", body: "Bot and/or personal account.", href: "/dashboard/connect", ok: tgConnected, okText: "Connected", offText: "Not connected" },
    { icon: KeyRound, title: "AI keys", body: "Your Gemini key(s).", href: "/dashboard/ai-key", ok: hasKey, okText: "Key added", offText: "No key yet" },
    { icon: MessageSquare, title: "Build the persona", body: "Tone, topics, prices, hours.", href: "/dashboard/settings", ok: !!personaRes.data, okText: "Configured", offText: "Defaults" },
    { icon: Package, title: "Products", body: "Your catalog for accurate prices.", href: "/dashboard/products" },
    { icon: Images, title: "Media library", body: "Photos/videos the bot can send.", href: "/dashboard/media", feature: "media" },
    { icon: MessagesSquare, title: "Conversations", body: "What the assistant told customers.", href: "/dashboard/conversations", feature: "conversations" },
    { icon: Users, title: "Customers", body: "Everyone who messaged + summary.", href: "/dashboard/customers", feature: "customers" },
    { icon: Clock, title: "Follow-ups", body: "Auto-message quiet customers.", href: "/dashboard/followups", feature: "followups" },
    { icon: Plug, title: "Website / API", body: "Live stock & prices from your site.", href: "/dashboard/integration", feature: "integration" },
  ];

  return (
    <section className="dash">
      <div className="dash-head">
        <div>
          <h1 className="dash-title">Welcome, {name} 👋</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            {ready ? "Your assistant is live. Message the account from another Telegram to test." : "Finish the steps below to go live."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {isAdminEmail(user.email) && (
            <Link href="/admin" className="btn btn-outline btn-sm"><Shield size={16} /> Admin</Link>
          )}
          <form action="/auth/signout" method="post">
            <button className="btn btn-outline btn-sm" type="submit"><LogOut size={16} /> Sign out</button>
          </form>
        </div>
      </div>

      <div className="dash-cards">
        {cards.map((c) => {
          const isLocked = locked(c.feature);
          return (
            <Link key={c.title} href={isLocked ? "#" : c.href} className="dash-card glass glass-hover" style={{ opacity: isLocked ? 0.7 : 1 }}>
              <span className="dash-ico"><c.icon size={20} /></span>
              <h3 style={{ marginTop: 20, fontSize: 18 }}>{c.title}</h3>
              <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>{c.body}</p>
              {isLocked ? (
                <span className="badge badge-off" style={{ marginTop: 14 }}><Lock size={12} /> Pro</span>
              ) : "ok" in c ? (
                <span className={cn("badge", c.ok ? "badge-ok" : "badge-off")} style={{ marginTop: 14 }}>
                  <span className="dot" style={{ background: c.ok ? "var(--mint)" : "var(--muted)" }} /> {c.ok ? c.okText : c.offText}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
