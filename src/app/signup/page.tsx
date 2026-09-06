"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthCard, Field, SubmitButton } from "@/components/sections/auth-card";

// SIGNUP — /signup. UI only for now; Supabase + Resend verification wire up in Phase 2.
export default function SignupPage() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="We've sent a verification link to confirm your account."
        footer={<>Wrong address? <Link href="/signup" className="text-violet-soft hover:underline">Try again</Link></>}
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-violet/15 text-violet-soft">
            <MailCheck size={26} />
          </span>
          <p className="text-sm text-muted">
            Open the link in your inbox to verify and continue to setup. It may take a minute to arrive.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start free with your own AI key."
      footer={<>Already have an account? <Link href="/login" className="text-violet-soft hover:underline">Sign in</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          // Phase 2: call Supabase signUp, then send the branded verification email via Resend.
          setSent(true);
        }}
      >
        <Field label="Full name" type="text" placeholder="Your name" required autoComplete="name" />
        <Field label="Email" type="email" placeholder="you@example.com" required autoComplete="email" />
        <Field label="Password" type="password" placeholder="At least 8 characters" required minLength={8} autoComplete="new-password" />
        <SubmitButton type="submit">Create account</SubmitButton>
        <p className="text-center text-xs text-muted">
          We&apos;ll email you a verification link. By continuing you agree to our{" "}
          <Link href="/terms" className="text-violet-soft hover:underline">Terms</Link> and{" "}
          <Link href="/privacy" className="text-violet-soft hover:underline">Privacy Policy</Link>.
        </p>
      </form>
    </AuthCard>
  );
}
