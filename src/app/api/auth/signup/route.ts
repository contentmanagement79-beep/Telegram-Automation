import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendVerificationEmail } from "@/lib/resend";

// POST /api/auth/signup  — creates the user (unconfirmed) and emails a branded
// verification link via the Resend API. Supabase generates the secure token; we
// deliver it ourselves. No email is sent by Supabase here.
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Creates the user and returns a verification token WITHOUT sending an email.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: { data: { full_name: name ?? "" } },
    });

    if (error) {
      const msg = /already/i.test(error.message)
        ? "An account with this email already exists. Try signing in."
        : error.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const tokenHash = data.properties?.hashed_token;
    if (!tokenHash) {
      return NextResponse.json({ error: "Could not create verification link." }, { status: 500 });
    }

    const origin = new URL(request.url).origin;
    const link = `${origin}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=signup&next=/dashboard`;

    await sendVerificationEmail(email, link, name);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
