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
  const [settings, flags, plans, usersRes, reqs] = await Promise.all([
    svc.from("platform_settings").select("monetization_on,price_text,pay_number,pay_instructions,pro_days").eq("id", 1).maybeSingle(),
    svc.from("feature_flags").select("key,tier"),
    svc.from("plans").select("user_id,plan,expires_at"),
    svc.auth.admin.listUsers(),
    svc.from("subscription_requests").select("id,user_id,method,trx_id,status,created_at").order("created_at", { ascending: false }).limit(100),
  ]);

  const planMap = new Map((plans.data ?? []).map((p) => [p.user_id, p]));
  const emailMap = new Map((usersRes.data?.users ?? []).map((u) => [u.id, u.email]));
  const users = (usersRes.data?.users ?? []).map((u) => {
    const p = planMap.get(u.id);
    return { id: u.id, email: u.email, plan: p?.plan ?? "free", expires_at: p?.expires_at ?? null };
  });
  const requests = (reqs.data ?? []).map((r) => ({ ...r, email: emailMap.get(r.user_id) ?? r.user_id.slice(0, 8) }));

  const s = settings.data;
  return NextResponse.json({
    monetization_on: s?.monetization_on ?? false,
    paysettings: {
      price_text: s?.price_text ?? "", pay_number: s?.pay_number ?? "",
      pay_instructions: s?.pay_instructions ?? "", pro_days: s?.pro_days ?? 30,
    },
    flags: flags.data ?? [],
    users,
    requests,
  });
}
