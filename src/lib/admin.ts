import { createClient } from "@supabase/supabase-js";

/** Emails allowed into /admin (from ADMIN_EMAIL env, comma-separated). */
export function isAdminEmail(email?: string | null): boolean {
  const admins = (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && admins.includes(email.toLowerCase());
}

/** Service-role Supabase client. SERVER ONLY — bypasses RLS. */
export function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
