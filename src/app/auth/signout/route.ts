import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// POST /auth/signout
export async function POST() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}
