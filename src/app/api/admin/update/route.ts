import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail, serviceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const svc = serviceClient();

  try {
    if (body.type === "settings") {
      await svc.from("platform_settings").update({ monetization_on: !!body.monetization_on }).eq("id", 1);
    } else if (body.type === "flag") {
      await svc.from("feature_flags").update({ tier: body.tier === "pro" ? "pro" : "free" }).eq("key", body.key);
    } else if (body.type === "plan") {
      await svc.from("plans").upsert({
        user_id: body.user_id, plan: body.plan === "pro" ? "pro" : "free",
        expires_at: body.expires_at || null, updated_at: new Date().toISOString(),
      });
    } else if (body.type === "suspend") {
      await svc.from("plans").upsert({
        user_id: body.user_id, suspended: !!body.suspended, updated_at: new Date().toISOString(),
      });
    } else if (body.type === "paysettings") {
      await svc.from("platform_settings").update({
        price_text: body.price_text ?? "", pay_number: body.pay_number ?? "",
        pay_instructions: body.pay_instructions ?? "", pro_days: Number(body.pro_days) || 30,
      }).eq("id", 1);
    } else if (body.type === "request") {
      if (body.action === "approve") {
        const { data: s } = await svc.from("platform_settings").select("pro_days").eq("id", 1).maybeSingle();
        const days = s?.pro_days ?? 30;
        const exp = new Date(Date.now() + days * 86400000).toISOString();
        await svc.from("plans").upsert({ user_id: body.user_id, plan: "pro", expires_at: exp, updated_at: new Date().toISOString() });
        await svc.from("subscription_requests").update({ status: "approved" }).eq("id", body.request_id);
      } else {
        await svc.from("subscription_requests").update({ status: "rejected" }).eq("id", body.request_id);
      }
    } else {
      return NextResponse.json({ error: "bad type" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
