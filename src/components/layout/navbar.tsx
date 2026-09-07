"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Bot } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <Link href={site.links.login} className="nav-signin">Sign in</Link>
          <Link href={site.links.signup} className="btn btn-glow btn-sm">
            <span>Launch <ArrowRight size={16} /></span>
          </Link>
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
          <Link href={site.links.signup} className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setOpen(false)}>
            Launch
          </Link>
        </div>
      </div>
    </nav>
  );
}
