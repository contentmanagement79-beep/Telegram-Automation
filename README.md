# Autogram — Web

Next.js frontend for the Autogram platform. Premium dark theme (aurora + glass + glow),
fully responsive, animated, and split into **real pages** so you can edit one page on
GitHub and see it live on Vercel without rewriting anything.

## Run locally (optional)

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

## Deploy (your workflow: GitHub → Vercel)

1. Push this `web/` folder to a GitHub repo.
2. On Vercel: **New Project → import the repo**. Framework auto-detects as Next.js.
3. Every push to GitHub → Vercel builds a **live preview URL** automatically.
4. Add env vars in Vercel when you reach Phase 2+ (see `.env.example`).

## Pages (each is its own route = its own file)

| URL | File | Edit this to change… |
|-----|------|----------------------|
| `/` | `src/app/page.tsx` | the home page (composes the sections below) |
| `/how-it-works` | `src/app/how-it-works/page.tsx` | the 3-step timeline |
| `/pricing` | `src/app/pricing/page.tsx` | the plans |
| `/faq` | `src/app/faq/page.tsx` | the questions list |
| `/privacy` | `src/app/privacy/page.tsx` | privacy policy |
| `/terms` | `src/app/terms/page.tsx` | terms of service |

Editing one page never touches the others. To add a new page, just create
`src/app/<name>/page.tsx` — the shared theme (nav, footer, background) is applied
automatically by `src/app/layout.tsx`.

## Structure

```
src/
  app/
    layout.tsx              # wraps EVERY page in the shared shell (nav+footer+bg)
    globals.css             # theme tokens + aurora/glass/glow/reveal utilities
    page.tsx, <route>/page.tsx
  components/
    layout/                 # navbar, footer, marketing-shell (the shared frame)
    sections/               # reusable blocks: hero, chat-mockup, metrics,
                            #   features, cta, legal-shell
    ui/                     # reveal (scroll animation), background (aurora+grid)
  lib/
    site.ts                 # ALL copy/config: brand, nav, metrics, pricing, faqs, legal
    utils.ts                # cn() class helper
```

### Where to change things
- **Text / pricing / FAQ / brand name / links:** `src/lib/site.ts`
- **Colors / fonts / radii:** `tailwind.config.ts` (+ CSS vars in `globals.css`)
- **A shared block (hero, features…):** `src/components/sections/`
- **Nav / footer:** `src/components/layout/`

## Theme notes
- Deep ink-navy base, one violet accent; iris/sky used only in the aurora & gradients;
  mint reserved for live/status signals.
- Type: Clash Display + General Sans (Fontshare). Prefer Inter? Swap the `<link>` in
  `layout.tsx` and the CSS vars at the top of `globals.css`.
- Animations: rotating aurora, floating mockup, scroll-reveal, interactive take-over
  toggle in the hero. All respect `prefers-reduced-motion`.
- Honest by design: no fake company logos, no invented stats, and the assistant is
  presented as an assistant (never a fake human).

## Next: Phase 2
Auth (signup/login) + branded email verification via **Resend** + protected routes.
