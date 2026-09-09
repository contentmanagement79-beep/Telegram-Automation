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
  const [settings, flags, plans, usersRes] = await Promise.all([
    svc.from("platform_settings").select("monetization_on").eq("id", 1).maybeSingle(),
    svc.from("feature_flags").select("key,tier"),
    svc.from("plans").select("user_id,plan,expires_at"),
    svc.auth.admin.listUsers(),
  ]);

  const planMap = new Map((plans.data ?? []).map((p) => [p.user_id, p]));
  const users = (usersRes.data?.users ?? []).map((u) => {
    const p = planMap.get(u.id);
    return { id: u.id, email: u.email, plan: p?.plan ?? "free", expires_at: p?.expires_at ?? null };
  });

  return NextResponse.json({
    monetization_on: settings.data?.monetization_on ?? false,
    flags: flags.data ?? [],
    users,
  });
}
