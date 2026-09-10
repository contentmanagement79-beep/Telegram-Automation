import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callEngine } from "@/lib/engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { api_url, header_name, header_value, enabled, note } = await req.json();
  const { ok, data } = await callEngine("/internal/integration", {
    user_id: user.id, api_url, header_name, header_value, enabled, note,
  });
  return NextResponse.json(data, { status: ok ? 200 : 400 });
}
