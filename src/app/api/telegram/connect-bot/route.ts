import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callEngine } from "@/lib/engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { bot_token } = await req.json();
  if (!bot_token || !String(bot_token).trim()) {
    return NextResponse.json({ error: "Bot token is required." }, { status: 400 });
  }

  const { ok, data } = await callEngine("/internal/telegram/connect-bot", {
    user_id: user.id, bot_token: String(bot_token).trim(),
  });
  return NextResponse.json(data, { status: ok ? 200 : 400 });
}
