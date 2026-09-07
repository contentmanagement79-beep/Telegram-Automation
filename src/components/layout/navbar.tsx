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
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "border-b border-line bg-ink-900/80 py-3 backdrop-blur-xl" : "bg-transparent py-5",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet to-iris text-white shadow-[0_0_20px_rgba(109,94,246,0.35)]">
            <Bot size={20} />
          </span>
          <span className="font-display text-xl">{site.brand}</span>
        </Link>

        <div className="hidden items-center gap-7 rounded-full border border-line bg-white/[0.03] px-7 py-2.5 backdrop-blur-md md:flex">
          {site.nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("text-sm transition-colors", active ? "text-violet-soft" : "text-muted hover:text-cloud")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link href={site.links.login} className="text-sm text-muted transition-colors hover:text-cloud">
            Sign in
          </Link>
          <Link
            href={site.links.signup}
            className="glow-border group inline-flex h-11 items-center gap-2 px-6 text-sm font-semibold text-white"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              Launch <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-cloud md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div
        className={cn(
          "mx-6 mt-2 grid overflow-hidden rounded-2xl transition-all duration-300 md:hidden",
          open ? "grid-rows-[1fr] border border-line bg-ink-900/95 backdrop-blur-xl" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0">
          <div className="flex flex-col gap-1 p-4">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-muted hover:bg-white/5 hover:text-cloud"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={site.links.signup}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-violet px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              Launch
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
