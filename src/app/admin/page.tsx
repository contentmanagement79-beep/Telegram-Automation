import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { AdminPanel } from "@/components/sections/admin-panel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Autogram" };

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/dashboard");
  return <AdminPanel />;
}
