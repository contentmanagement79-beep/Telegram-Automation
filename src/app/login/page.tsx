"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard, Field, SubmitButton } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setError(
        /confirm/i.test(error.message)
          ? "Please verify your email first — check your inbox for the link."
          : "Wrong email or password.",
      );
      setLoading(false);
      return;
    }
    router.refresh();
    router.push("/dashboard");
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your dashboard."
      footer={<>New here? <Link href="/signup" className="text-violet-soft hover:underline">Start free</Link></>}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        <div>
          <Field label="Password" name="password" type="password" placeholder="Your password" required autoComplete="current-password" />
          <div className="mt-2 text-right">
            <Link href="/login" className="text-xs text-muted hover:text-cloud">Forgot password?</Link>
          </div>
        </div>

        {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <SubmitButton type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
