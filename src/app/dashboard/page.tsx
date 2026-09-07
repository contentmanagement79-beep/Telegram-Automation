import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Bot, KeyRound, MessageSquare, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard — Autogram" };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = (user.user_metadata?.full_name as string) || user.email;

  const cards = [
    { icon: MessageSquare, title: "Build the persona", body: "Set tone, topics, prices and limits.", href: "/dashboard/settings" },
    { icon: Package, title: "Products", body: "Add your catalog so prices are always accurate.", href: "/dashboard/products" },
    { icon: Bot, title: "Connect Telegram", body: "Link your account so the assistant can reply.", soon: true },
    { icon: KeyRound, title: "Add your AI key", body: "Bring your Gemini key to power replies.", soon: true },
  ];

  return (
    <section className="dash">
      <div className="dash-head">
        <div>
          <h1 className="dash-title">Welcome, {name} 👋</h1>
          <p className="muted" style={{ marginTop: 8 }}>Set up your assistant below.</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="btn btn-outline btn-sm" type="submit"><LogOut size={16} /> Sign out</button>
        </form>
      </div>

      <div className="dash-cards">
        {cards.map((c) => {
          const inner = (
            <>
              <span className="dash-ico"><c.icon size={20} /></span>
              <h3 style={{ marginTop: 20, fontSize: 18 }}>{c.title}{c.soon && <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}> · soon</span>}</h3>
              <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>{c.body}</p>
            </>
          );
          return c.href ? (
            <Link key={c.title} href={c.href} className="dash-card glass glass-hover" style={{ opacity: 1 }}>{inner}</Link>
          ) : (
            <div key={c.title} className="dash-card glass">{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
