"use client";

import Link from "next/link";
import { AuthCard, Field, SubmitButton } from "@/components/sections/auth-card";

// LOGIN — /login. UI only for now; Supabase auth wires up in Phase 2.
export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your dashboard."
      footer={<>New here? <Link href="/signup" className="text-violet-soft hover:underline">Start free</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          // Phase 2: call Supabase signInWithPassword, then redirect to /dashboard.
        }}
      >
        <Field label="Email" type="email" placeholder="you@example.com" required autoComplete="email" />
        <div>
          <Field label="Password" type="password" placeholder="Your password" required autoComplete="current-password" />
          <div className="mt-2 text-right">
            <Link href="/login" className="text-xs text-muted hover:text-cloud">Forgot password?</Link>
          </div>
        </div>
        <SubmitButton type="submit">Sign in</SubmitButton>
      </form>
    </AuthCard>
  );
}
