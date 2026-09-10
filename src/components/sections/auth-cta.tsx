"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function AuthCta({
  className,
  signedOutHref = "/signup",
  signedOutLabel = "Start free",
  signedInHref = "/dashboard",
  signedInLabel = "Open dashboard",
  arrow = true,
}: {
  className?: string;
  signedOutHref?: string;
  signedOutLabel?: string;
  signedInHref?: string;
  signedInLabel?: string;
  arrow?: boolean;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const href = user ? signedInHref : signedOutHref;
  const label = user ? signedInLabel : signedOutLabel;

  return (
    <Link href={href} className={className}>
      <span>{label}{arrow && <> <ArrowRight size={18} /></>}</span>
    </Link>
  );
}
