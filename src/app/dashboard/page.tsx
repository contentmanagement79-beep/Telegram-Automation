import { redirect } from "next/navigation";
import { LogOut, Bot, KeyRound, MessageSquare, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard — Autogram" };

// PROTECTED — server-checks the session (middleware guards it too).
// This is a Phase 2 placeholder; the real dashboard is built in Phase 3–4.
export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = (user.user_metadata?.full_name as string) || user.email;

  const cards = [
    { icon: Bot, title: "Connect Telegram", body: "Link your account so the assistant can reply. (Phase 3)" },
    { icon: KeyRound, title: "Add your AI key", body: "Bring your Gemini key to power replies. (Phase 3)" },
    { icon: MessageSquare, title: "Build the persona", body: "Set tone, topics, prices and limits. (Phase 3)" },
    { icon: Settings, title: "Go live", body: "Start replying and watch conversations. (Phase 4)" },
  ];

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-36 lg:px-8 sm:pt-44">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl">Welcome, {name} 👋</h1>
          <p className="mt-2 text-muted">You&apos;re signed in. Setup steps land here in the next phases.</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white/5 px-5 text-sm text-cloud transition-colors hover:bg-white/10">
            <LogOut size={16} /> Sign out
          </button>
        </form>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.title} className="glass rounded-3xl p-7 opacity-80">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.06] text-violet-soft">
              <c.icon size={20} />
            </span>
            <h3 className="mt-5 text-lg">{c.title}</h3>
            <p className="mt-2 text-sm text-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
