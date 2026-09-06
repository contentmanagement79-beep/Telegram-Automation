import Link from "next/link";
import { Bot } from "lucide-react";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-ink-900/60 pb-10 pt-16">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-violet to-iris text-white">
                <Bot size={18} />
              </span>
              <span className="font-display text-lg">{site.brand}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">{site.tagline}</p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
            {[...site.nav, ...site.legalNav].map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-cloud">
                {item.label}
              </Link>
            ))}
            <Link href={site.links.login} className="hover:text-cloud">Sign in</Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {site.brand}. Runs on your own account — an honest assistant, never a fake human.
          </p>
          <p className="flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-2 rounded-full bg-mint" /> All systems normal
          </p>
        </div>
      </div>
    </footer>
  );
}
