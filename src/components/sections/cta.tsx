import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/lib/site";

export function Cta({
  title = "Ready to automate?",
  subtitle = "Stop losing sleep over unread messages. Deploy your inbound AI assistant today.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="relative z-10 border-t border-line px-6 py-28">
      <Reveal className="relative mx-auto max-w-4xl text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/15 blur-[120px]" />
        <h2 className="text-balance text-4xl font-semibold leading-tight sm:text-6xl">{title}</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">{subtitle}</p>
        <div className="mt-9 flex justify-center">
          <Link
            href={site.links.signup}
            className="glow-border group inline-flex h-[3.25rem] items-center gap-2 px-9 text-base font-semibold text-white"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              Start free <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
        <p className="mt-5 text-sm text-muted">Free with your own key. No card required.</p>
      </Reveal>
    </section>
  );
}
