"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/site";

/** Centered glass card used by the signup and login pages. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <section className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-32">
      <div className="w-full max-w-md">
        <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-violet/20 blur-[120px]" />

        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-6 flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet to-iris text-white shadow-[0_0_20px_rgba(109,94,246,0.35)]">
              <Bot size={20} />
            </span>
            <span className="font-display text-xl">{BRAND}</span>
          </Link>
          <h1 className="text-3xl">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
        </div>

        <div className="glass rounded-3xl p-8">{children}</div>

        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </div>
    </section>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-cloud/90">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-line bg-white/5 px-4 py-3 text-sm text-cloud placeholder-muted transition-colors focus:border-violet/50 focus:outline-none focus:ring-2 focus:ring-violet/30"
      />
    </label>
  );
}

export function SubmitButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center rounded-full bg-violet text-sm font-semibold text-white transition-colors hover:bg-violet-deep disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}
