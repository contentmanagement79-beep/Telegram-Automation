import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callEngine } from "@/lib/engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { pending_token, code, password } = await req.json();
  if (!pending_token) return NextResponse.json({ error: "Session expired. Start again." }, { status: 400 });

  const { ok, data } = await callEngine("/internal/telegram/verify-code", { pending_token, code, password });
  return NextResponse.json(data, { status: ok ? 200 : 400 });
}
