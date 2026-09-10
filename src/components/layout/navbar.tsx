"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowRight, Bot } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // scroll style
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // auth state — updates instantly on login/logout
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className={cn("nav", scrolled && "scrolled")}>
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span className="brand-logo"><Bot size={20} /></span>
          <span className="brand-name">{site.brand}</span>
        </Link>

        <div className="nav-links">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className={cn("nav-link", pathname === item.href && "active")}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <button onClick={handleSignOut} className="nav-signin" style={{ background: "none", border: 0, cursor: "pointer", font: "inherit" }}>
                Sign out
              </button>
              <Link href="/dashboard" className="btn btn-glow btn-sm">
                <span>Dashboard <ArrowRight size={16} /></span>
              </Link>
            </>
          ) : (
            <>
              <Link href={site.links.login} className="nav-signin">Sign in</Link>
              <Link href={site.links.signup} className="btn btn-glow btn-sm">
                <span>Launch <ArrowRight size={16} /></span>
              </Link>
            </>
          )}
        </div>

        <button className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={cn("nav-mobile", open && "open")}>
        <div className="nav-mobile-inner">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="nav-mobile-link" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="nav-mobile-link" style={{ background: "none", border: 0, textAlign: "left", cursor: "pointer", font: "inherit" }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href={site.links.login} className="nav-mobile-link" onClick={() => setOpen(false)}>Sign in</Link>
              <Link href={site.links.signup} className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setOpen(false)}>
                Launch
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
