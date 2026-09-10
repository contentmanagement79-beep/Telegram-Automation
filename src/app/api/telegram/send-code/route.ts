import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callEngine } from "@/lib/engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { api_id, api_hash, phone } = await req.json();
  if (!api_id || !api_hash || !phone) {
    return NextResponse.json({ error: "api_id, api_hash and phone are required." }, { status: 400 });
  }

  const { ok, data } = await callEngine("/internal/telegram/send-code", {
    user_id: user.id, api_id, api_hash, phone,
  });
  return NextResponse.json(data, { status: ok ? 200 : 400 });
}
