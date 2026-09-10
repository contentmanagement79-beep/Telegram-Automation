"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { BRAND } from "@/lib/site";
import { cn } from "@/lib/utils";

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
    <section className="auth">
      <div className="auth-card">
        <div className="auth-glow" />
        <div className="auth-head">
          <Link href="/" className="auth-brand">
            <span className="brand-logo"><Bot size={20} /></span>
            <span className="brand-name">{BRAND}</span>
          </Link>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-sub">{subtitle}</p>
        </div>
        <div className="auth-box glass">{children}</div>
        <p className="auth-foot">{footer}</p>
      </div>
    </section>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: "block" }}>
      <span className="field-label">{label}</span>
      <input {...props} className="field-input" />
    </label>
  );
}

export function SubmitButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={cn("btn btn-primary btn-block", className)}>
      {children}
    </button>
  );
}
