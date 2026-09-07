import { redirect } from "next/navigation";
import { LogOut, Bot, KeyRound, MessageSquare, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard — Autogram" };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = (user.user_metadata?.full_name as string) || user.email;

  const cards = [
    { icon: Bot, title: "Connect Telegram", body: "Link your account so the assistant can reply. (Phase 3)" },
    { icon: KeyRound, title: "Add your AI key", body: "Bring your Gemini key to power replies. (Phase 3)" },
    { icon: MessageSquare, title: "Build the persona", body: "Set tone, topics, prices and limits. (Phase 3)" },
    { icon: Settings, title: "Go live", body: "Start replying and watch conversations. (Phase 4)" },
  ];

  return (
    <section className="dash">
      <div className="dash-head">
        <div>
          <h1 className="dash-title">Welcome, {name} 👋</h1>
          <p className="muted" style={{ marginTop: 8 }}>You&apos;re signed in. Setup steps land here in the next phases.</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="btn btn-outline btn-sm" type="submit"><LogOut size={16} /> Sign out</button>
        </form>
      </div>

      <div className="dash-cards">
        {cards.map((c) => (
          <div key={c.title} className="dash-card glass">
            <span className="dash-ico"><c.icon size={20} /></span>
            <h3 style={{ marginTop: 20, fontSize: 18 }}>{c.title}</h3>
            <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
