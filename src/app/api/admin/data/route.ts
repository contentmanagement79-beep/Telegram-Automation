import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail, serviceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const svc = serviceClient();
  const [settings, flags, plans, usersRes, reqs, customers, tg, convos] = await Promise.all([
    svc.from("platform_settings").select("monetization_on,price_text,pay_number,pay_instructions,pro_days").eq("id", 1).maybeSingle(),
    svc.from("feature_flags").select("key,tier"),
    svc.from("plans").select("user_id,plan,expires_at,suspended"),
    svc.auth.admin.listUsers(),
    svc.from("subscription_requests").select("id,user_id,method,trx_id,status,created_at").order("created_at", { ascending: false }).limit(100),
    svc.from("customers").select("user_id,last_msg_at").limit(20000),
    svc.from("telegram_accounts").select("user_id,mode,status"),
    svc.from("conversations").select("user_id").limit(20000),
  ]);

  const planMap = new Map((plans.data ?? []).map((p) => [p.user_id, p]));
  const emailMap = new Map((usersRes.data?.users ?? []).map((u) => [u.id, u.email]));

  // per-user aggregates
  const custCount = new Map<string, number>();
  const lastActive = new Map<string, string>();
  for (const c of customers.data ?? []) {
    custCount.set(c.user_id, (custCount.get(c.user_id) ?? 0) + 1);
    const prev = lastActive.get(c.user_id);
    if (!prev || new Date(c.last_msg_at) > new Date(prev)) lastActive.set(c.user_id, c.last_msg_at);
  }
  const msgCount = new Map<string, number>();
  for (const m of convos.data ?? []) msgCount.set(m.user_id, (msgCount.get(m.user_id) ?? 0) + 1);
  const conns = new Map<string, string[]>();
  for (const t of tg.data ?? []) {
    if (t.status === "connected") {
      const arr = conns.get(t.user_id) ?? [];
      arr.push(t.mode || "user");
      conns.set(t.user_id, arr);
    }
  }

  const users = (usersRes.data?.users ?? []).map((u) => {
    const p = planMap.get(u.id);
    return {
      id: u.id, email: u.email,
      plan: p?.plan ?? "free", expires_at: p?.expires_at ?? null, suspended: p?.suspended ?? false,
      customers: custCount.get(u.id) ?? 0,
      messages: msgCount.get(u.id) ?? 0,
      last_active: lastActive.get(u.id) ?? null,
      connections: conns.get(u.id) ?? [],
    };
  });
  const requests = (reqs.data ?? []).map((r) => ({ ...r, email: emailMap.get(r.user_id) ?? r.user_id.slice(0, 8) }));

  const s = settings.data;
  return NextResponse.json({
    monetization_on: s?.monetization_on ?? false,
    paysettings: { price_text: s?.price_text ?? "", pay_number: s?.pay_number ?? "", pay_instructions: s?.pay_instructions ?? "", pro_days: s?.pro_days ?? 30 },
    flags: flags.data ?? [],
    users,
    requests,
  });
}
