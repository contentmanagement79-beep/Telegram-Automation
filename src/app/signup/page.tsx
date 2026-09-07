"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { AuthCard, Field, SubmitButton } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        data: { full_name: String(form.get("name") ?? "") },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="We've sent a link to confirm your account."
        footer={<>Wrong address? <Link href="/signup" className="link">Try again</Link></>}
      >
        <div className="auth-sent">
          <span className="auth-sent-icon"><MailCheck size={26} /></span>
          <p className="muted" style={{ fontSize: 14 }}>
            Open the link in your inbox to verify and continue. It may take a minute to arrive.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start free with your own AI key."
      footer={<>Already have an account? <Link href="/login" className="link">Sign in</Link></>}
    >
      <form className="form" onSubmit={onSubmit}>
        <Field label="Full name" name="name" type="text" placeholder="Your name" autoComplete="name" />
        <Field label="Email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        <Field label="Password" name="password" type="password" placeholder="At least 6 characters" required minLength={6} autoComplete="new-password" />
        {error && <p className="form-error">{error}</p>}
        <SubmitButton type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</SubmitButton>
        <p className="form-fine">
          By continuing you agree to our <Link href="/terms" className="link">Terms</Link> and{" "}
          <Link href="/privacy" className="link">Privacy Policy</Link>.
        </p>
      </form>
    </AuthCard>
  );
}
