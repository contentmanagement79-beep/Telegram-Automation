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
      const tier = body.tier === "pro" ? "pro" : "free";
      await svc.from("feature_flags").update({ tier }).eq("key", body.key);
    } else if (body.type === "plan") {
      await svc.from("plans").upsert({
        user_id: body.user_id,
        plan: body.plan === "pro" ? "pro" : "free",
        expires_at: body.expires_at || null,
        updated_at: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({ error: "bad type" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
