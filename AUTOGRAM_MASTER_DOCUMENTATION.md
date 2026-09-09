# AUTOGRAM MASTER DOCUMENTATION

> Reverse-engineered from the actual source in `web/` and `engine/`. Exact paths,
> routes, table names, columns and env vars are taken from the code. Anything not
> confirmable from the repo is marked **UNKNOWN / NOT VERIFIED**.

---

## 1. Project Overview

**Autogram** is a multi-tenant SaaS that turns a seller's Telegram into an AI
customer-support / sales assistant.

- **Problem it solves:** small sellers can't reply to customers 24/7; Autogram
  answers instantly in the seller's voice, handles media, follows up, and hands
  back to a human when needed.
- **Users:** (a) *sellers* (tenants) who configure and run an assistant;
  (b) their *customers* who chat on Telegram; (c) a *super-admin* (platform owner).
- **Main journey:** sign up → verify email → connect Telegram (bot and/or personal
  account) → add a Gemini key → set persona/products → assistant replies to
  customers. Optional: media library, follow-ups, website integration.
- **Business model:** free tier (bring-your-own Gemini key); optional Pro plan
  gated by a super-admin (manual bKash/Nagad payment → admin approval).
- **High-level capabilities:** AI replies, photo/voice/document understanding,
  voice replies on request, keyword-triggered media (blur/spoiler), drip
  follow-ups, business hours, per-customer memory + daily summary, website/API
  live-data, realtime conversation viewer, monetization + feature flags + admin
  monitoring/suspend.

---

## 2. Product Features (inventory)

Availability legend: **F** = free tier, **P** = Pro (when monetization ON),
**A** = admin only. Gate keys refer to `feature_flags.key` (engine enforces).

| Feature | What it does | Avail | Frontend | Engine | Tables | API |
|---|---|---|---|---|---|---|
| Auth | Signup/login/verify, sessions | F | `app/signup,login,auth/*` | — | `profiles` | `/auth/confirm`, `/auth/signout` |
| Connect Telegram (bot) | BotFather token → PTB runtime | base | `dashboard/connect` | `ptbbot.py` | `telegram_accounts` | `/api/telegram/connect-bot` |
| Connect Telegram (personal) | api_id/hash + phone + code → Telethon | base | `dashboard/connect` | `bot.py`, `api.py` | `telegram_accounts` | `/api/telegram/send-code`, `/verify-code` |
| AI keys | Multiple Gemini keys, rotation | base | `dashboard/ai-key` | `ai.py` | `ai_keys` | `/api/ai-key` |
| Persona | Tone/topics/limits/commands/hours | base | `dashboard/settings` | `prompt.py` | `personas` | (client RLS) |
| Products | Catalog for accurate prices | base | `dashboard/products` | `prompt.py` | `products` | (client RLS) |
| Media library + smart send | Upload to Cloudinary; keyword→media | P (`media`) | `dashboard/media` | `bot.py`/`ptbbot.py` `_maybe_send_media` | `cloudinary_accounts`, `media_items`, `media_settings` | (client + Cloudinary) |
| Voice replies | edge-tts voice when asked | P (`voice`) | `dashboard/settings` toggle | `voice.py` | `personas` | — |
| Follow-ups | Idle N-day drip msg+media | P (`followups`) | `dashboard/followups` | `run_followups` | `followups`, `followup_sends`, `customers` | (client RLS) |
| Website/API integration | Live data from seller API | P (`integration`) | `dashboard/integration` | `integration.py` | `integrations` | `/api/integration` |
| Conversations viewer | Realtime chat log | P (`conversations`) | `dashboard/conversations` | (writes) | `conversations` | (client RLS + realtime) |
| Customers + summary | Per-customer profile/summary | P (`customers`) | `dashboard/customers` | `run_summaries` | `customers`, `customer_profiles` | (client RLS) |
| Business hours | Reply only in hours; away msg | P (`business_hours`) | `dashboard/settings` | `_handle` | `personas` | — |
| Bot mode (flag) | Whether bot runtime allowed | P (`bot_mode`) | — | (flag only) | `feature_flags` | — |
| Upgrade / subscription | Submit bKash/Nagad TrxID | F | `dashboard/upgrade` | — | `subscription_requests`, `platform_settings`, `plans` | (client insert) |
| Admin panel | Monetization, flags, plans, suspend, monitor, approve | A | `app/admin` | (enforced in `db.get_access` / `get_connected_connections`) | `platform_settings`, `feature_flags`, `plans`, `subscription_requests` | `/api/admin/data`, `/api/admin/update` |

**Note on `bot_mode`:** the flag exists in `feature_flags` and in `db.get_access`,
but the engine does **not** currently stop a bot from starting based on it
(enforced gates are `media`, `voice`, `followups`, `integration`). — 🟡 partial.

---

## 3. Technology Stack

### Web (`web/`, deploys to Vercel)
- **Framework:** Next.js **14.2.15** (App Router). React **18.3.1**.
- **Language:** TypeScript.
- **Styling:** **plain CSS** with CSS variables — single stylesheet `src/app/theme.css`
  (no Tailwind, no CSS-in-JS lib). `src/lib/utils.ts` has a dependency-free `cn()`.
- **Auth:** Supabase Auth via `@supabase/ssr` **0.5.1** + `@supabase/supabase-js` **2.45.4**.
- **Icons:** `lucide-react` **0.445.0**. Email SDK present: `resend` **4.0.0** (see §7 note).
- **Hosting:** Vercel.

### Engine (`engine/`, deploys to Render)
- **Python:** version not pinned in repo → **UNKNOWN** (Render observed running 3.14 in logs).
- **Libraries (`requirements.txt`):** `telethon>=1.36`, `python-telegram-bot>=20.7`,
  `google-genai>=1.0`, `edge-tts>=6.1`, `asyncpg>=0.29`, `cryptography>=42`,
  `aiohttp>=3.9`, `python-dotenv>=1.0`, `pdfplumber`, `python-docx`, `openpyxl`, `pillow`.
- **Telegram:** Telethon (personal/userbot) + python-telegram-bot (bot).
- **AI:** Google Gemini via `google-genai`. **TTS:** edge-tts. **Media analysis:** Pillow/pdfplumber/docx/openpyxl.
- **DB driver:** asyncpg (direct Postgres, service-role level, bypasses RLS).
- **Web server:** aiohttp (health + internal API). **Hosting:** Render.

### Database — Supabase (PostgreSQL)
- RLS on all tenant tables; Supabase Auth (`auth.users`); Realtime used for `conversations`.

### External services
- **Telegram** (Bot API + MTProto), **Google Gemini**, **Cloudinary** (media, unsigned upload),
  **Resend** (email delivery — configured as Supabase custom SMTP, see §7), **Supabase**, **Vercel**, **Render**.

---

## 4. System Architecture

```
                Customer (Telegram)
                       │  DM
                       ▼
      ┌───────────────────────────────┐        ┌──────────────────────────────┐
      │  RENDER — Python engine        │        │  VERCEL — Next.js (web)      │
      │  main.py → manager.loop()      │        │  dashboard / admin / landing │
      │   • Telethon (personal)        │        │  server + client components  │
      │   • python-telegram-bot (bot)  │        │  internal API routes         │
      │   • Gemini / edge-tts / Cloudinary       │  (hold INTERNAL_API_TOKEN)   │
      │   • aiohttp /health + /internal/* ◄──────┤  callEngine() with token     │
      └───────────────┬───────────────┘        └───────────────┬──────────────┘
        asyncpg (service role)                       @supabase/ssr (RLS, user token)
                       └───────────────┬─────────────────────────┘
                                       ▼
                         ┌──────────────────────────────┐
                         │  SUPABASE (Postgres + Auth)  │
                         │  config · memory · plans     │
                         └──────────────────────────────┘
```

Communication:
- **Browser ↔ Next.js:** React + Supabase browser client (RLS, per-user token).
- **Next.js server ↔ Supabase:** server client (`@supabase/ssr`) for auth-scoped reads;
  service-role client (`src/lib/admin.ts` / `src/lib/supabase/admin.ts`) for admin writes.
- **Next.js server ↔ engine:** HTTPS to `BOT_ENGINE_URL/internal/*` with header
  `x-internal-token` (`src/lib/engine.ts`). Used for Telegram login (personal), bot connect, AI-key, integration save.
- **Engine ↔ Supabase:** asyncpg with `DATABASE_URL` (service role, bypasses RLS).
- **Engine ↔ Telegram/Gemini/Cloudinary:** per-tenant, using decrypted per-tenant creds/keys.

---

## 5. Repository Structure

Two separate repos/folders. **Never** mix `.tsx` into `.py` or vice-versa.

```
web/                            → Vercel (Next.js)
├── middleware.ts               session refresh + route protection (matcher excludes static)
├── next.config.mjs, tsconfig.json, next-env.d.ts, package.json
├── README.md, PHASE-2-SETUP.md
├── supabase/                   *.sql migrations (see §9)
└── src/
    ├── app/
    │   ├── layout.tsx          root layout: fonts + <MarketingShell>
    │   ├── theme.css           ALL styling (CSS vars + component classes)
    │   ├── page.tsx            landing (Hero, Metrics, Features, Cta)
    │   ├── how-it-works, pricing, faq, privacy, terms/  public pages
    │   ├── login, signup/      auth pages (client)
    │   ├── auth/confirm/route.ts    email confirm (code or token_hash) → session
    │   ├── auth/signout/route.ts    sign out
    │   ├── dashboard/
    │   │   ├── page.tsx         hub: status + Pro locks + admin link + suspended lock
    │   │   ├── loading.tsx      instant loading UI
    │   │   ├── connect/         bot + personal connect (client)
    │   │   ├── ai-key/          add/list/delete Gemini keys
    │   │   ├── settings/        persona + tone + commands + business hours
    │   │   ├── products/        product CRUD
    │   │   ├── media/           Cloudinary accounts + media upload
    │   │   ├── followups/       follow-up rules
    │   │   ├── integration/     website API config
    │   │   ├── conversations/   realtime chat viewer
    │   │   ├── customers/       customer list + summaries
    │   │   └── upgrade/         bKash/Nagad subscription submit
    │   ├── admin/page.tsx       admin gate → <AdminPanel>
    │   └── api/
    │       ├── telegram/send-code, verify-code, connect-bot/route.ts
    │       ├── ai-key/route.ts, integration/route.ts
    │       └── admin/data/route.ts, admin/update/route.ts
    ├── components/
    │   ├── layout/  navbar (auth-aware), footer, marketing-shell
    │   ├── sections/ hero, chat-demo, metrics, features, cta, auth-card,
    │   │             auth-cta, footer-auth-link, legal-shell, admin-panel
    │   └── ui/ reveal (scroll anim), background (aurora+grid)
    └── lib/
        ├── site.ts             brand + copy + config (single source)
        ├── utils.ts            cn()
        ├── engine.ts           callEngine() (server→engine w/ token)
        ├── admin.ts            isAdminEmail() + serviceClient()
        ├── emails.ts, resend.ts  (present; see §7 note — not on active signup path)
        └── supabase/ client.ts, server.ts, middleware.ts, admin.ts

engine/                         → Render (Python)
├── main.py                     entry: asyncio.run(manager.run())
├── connect.py                  CLI to connect a personal account (optional, local)
├── requirements.txt, .env.example, README.md, schema-phase3b.sql
└── app/
    ├── config.py               env + constants (MEMORY_TURNS, DEBOUNCE_SECONDS, FOLLOWUP_INTERVAL…)
    ├── crypto.py               Fernet encrypt/decrypt (needs FERNET_KEY)
    ├── db.py                   asyncpg pool + ALL queries
    ├── ai.py                   GeminiClient (reply, see_image, hear_audio, summarize; rotation)
    ├── prompt.py               build_system_prompt() (persona+products+guardrails)
    ├── voice.py                edge-tts + wants_voice() + document text extraction
    ├── integration.py          call_integration() (seller API)
    ├── bot.py                  TenantBot — Telethon (personal) adapter + brain
    ├── ptbbot.py               PTBBot — python-telegram-bot (bot) adapter + brain
    ├── manager.py              BotManager (sync, follow-ups, summaries, purge) + aiohttp
    └── api.py                  internal HTTP endpoints (send-code/verify-code/connect-bot/ai-key/integration)
```

---

## 6. Frontend Architecture

- **App Router.** Root `layout.tsx` wraps everything in `MarketingShell` (background +
  `Navbar` + `Footer`) and loads fonts (Fontshare Clash Display + General Sans).
- **Server vs client:** landing/legal/how-it-works/pricing are server components (with
  client `Reveal`); auth, dashboard sub-pages, admin panel, navbar, footer-auth-link,
  chat-demo are **client** components (they use Supabase browser client / hooks).
  `dashboard/page.tsx`, `admin/page.tsx` are **server** (do the auth/redirect + reads).
- **Theme:** `src/app/theme.css` — CSS variables at top (`--violet`, `--bg`, fonts…),
  then component classes (`.glass`, `.btn`, `.panel`, `.dash-card`, `.switch`, aurora, etc.).
- **Loading:** `dashboard/loading.tsx`. **Error states:** inline in each client page
  (no global `error.tsx` found → 🟡).
- **Navigation / protected routes:** `middleware.ts` (see §7). Navbar is auth-aware
  (shows Dashboard/Sign out when logged in).

### Page map (actual)
```
/                       landing
/how-it-works /pricing /faq /privacy /terms   public
/login /signup          auth (client); middleware redirects logged-in → /dashboard
/auth/confirm           GET route (email link)          /auth/signout  POST route
/dashboard              hub (protected)
/dashboard/connect      Telegram bot + personal
/dashboard/ai-key       Gemini keys
/dashboard/settings     persona + business hours
/dashboard/products     catalog
/dashboard/media        Cloudinary + media
/dashboard/followups    drip rules
/dashboard/integration  website API
/dashboard/conversations realtime viewer
/dashboard/customers    customers + summaries
/dashboard/upgrade      subscription
/admin                  super-admin (gated by ADMIN_EMAIL)
/api/telegram/{send-code,verify-code,connect-bot}   /api/ai-key   /api/integration
/api/admin/{data,update}
```

---

## 7. Authentication & Authorization

- **Provider:** Supabase Auth via `@supabase/ssr`. Clients: `lib/supabase/client.ts`
  (browser), `server.ts` (cookies), `middleware.ts` (session refresh).
- **Signup** (`app/signup/page.tsx`, client): `supabase.auth.signUp({ email, password,
  options: { data:{full_name}, emailRedirectTo: '/auth/confirm?next=/dashboard' } })`.
  If email confirmation is ON, shows "check your email"; if a session returns (confirm off),
  goes to `/dashboard`.
- **Email verification:** the link hits `app/auth/confirm/route.ts` which handles **both**
  a PKCE `code` (`exchangeCodeForSession`) and a `token_hash`+`type` (`verifyOtp`), then
  redirects to `next` (default `/dashboard`). Email delivery = **Resend configured as
  Supabase custom SMTP** (Supabase dashboard setting).
- **Login** (`app/login/page.tsx`): `signInWithPassword` → `/dashboard`.
- **Profiles:** `profiles` table + `handle_new_user` trigger (Phase-2 SQL) auto-creates a
  row with `full_name` on signup.
- **Session handling / route protection:** `web/middleware.ts` → `lib/supabase/middleware.ts`
  `updateSession()`: refreshes session cookies; redirects unauthenticated `/dashboard*`
  → `/login`; redirects authenticated `/login`,`/signup` → `/dashboard`.
- **Admin authorization:** `lib/admin.ts` `isAdminEmail(email)` checks against
  `ADMIN_EMAIL` env (comma-sep). Enforced in `app/admin/page.tsx` (redirect) **and** in
  both admin API routes (403). Admin writes use `serviceClient()` (service role).
- **Service role:** used server-side only — `lib/admin.ts serviceClient()` (web admin
  APIs) and engine asyncpg. Bypasses RLS.
- **RLS:** every tenant table has `own …` policies keyed on `auth.uid() = user_id`
  (see §8). Config tables (`platform_settings`, `feature_flags`) are world-readable
  (select true); `plans` is own-read.

> **Note (Resend / `lib/resend.ts`, `lib/emails.ts`, `EMAIL_FROM`, `RESEND_API_KEY`):**
> these exist from an earlier custom-verification design but are **not** imported by the
> current signup path (signup uses Supabase `signUp`, delivered via Supabase SMTP=Resend).
> — 🟡 present but not on the active path.

---

## 8. Database Architecture

All tables in `public`. `user_id` references `auth.users(id) on delete cascade`.

| Table | PK | Key columns | RLS | Read/write by |
|---|---|---|---|---|
| `profiles` | `id`(=auth.uid) | `full_name` | own (all) | web (trigger insert) |
| `telegram_accounts` | `id` | `user_id`, `mode`('user'/'bot'), `api_id`, `api_hash_enc`, `phone`, `session_string_enc`, `bot_token_enc`, `status` | own (all); `unique(user_id,mode)` | web connect (via engine), engine reads |
| `ai_keys` | `id` | `user_id`, `key_enc`, `hint`, `status`('active'/'invalid') | own | web list/delete; engine reads + marks invalid |
| `personas` | `user_id` | name, role_bio, tone_config(jsonb), topics, limitations, custom_instructions, store_info, greeting, disclose_ai, voice_enabled, voice_name, cmd_takeover_stop/start, cmd_global_stop/start, mode, bot_running, hours_enabled, hours_start, hours_end, tz_offset, away_message | own | web settings; engine reads + toggles bot_running/pause |
| `products` | `id` | user_id, name, category, price, description, is_active | own | web CRUD; engine reads |
| `conversations` | `id`(identity) | user_id, customer_id(bigint), role('user'/'assistant'), content, created_at | select own; realtime | engine writes; web viewer reads |
| `chat_states` | (user_id,customer_id) | paused | select own | engine read/write (per-customer pause) |
| `customers` | (user_id,customer_id) | last_msg_at, via('user'/'bot') | own (all) | engine upsert; web customers/admin read |
| `customer_profiles` | (user_id,customer_id) | summary | select own | engine (daily job) writes; web reads |
| `followups` | `id` | user_id, name, delay_days, message, media_id→media_items, enabled | own | web CRUD; engine reads |
| `followup_sends` | (user_id,customer_id,followup_id) | sent_at | own | engine writes; cleared on new customer msg |
| `cloudinary_accounts` | `id` | user_id, cloud_name, upload_preset, status | own | web CRUD (browser uploads direct to Cloudinary) |
| `media_items` | `id` | user_id, name, keyword, caption, url, public_id, kind('image'/'video'), blur, spoiler, self_destruct | own | web CRUD; engine reads |
| `media_settings` | `user_id` | max_photo_mb, max_video_mb | own | web |
| `integrations` | `user_id` | api_url, header_name, header_value_enc, enabled, note | own | web (save via engine encrypt); engine reads |
| `platform_settings` | `id`(=1) | monetization_on, price_text, pay_number, pay_instructions, pro_days | select true | admin writes (service role); engine + web read |
| `feature_flags` | `key` | tier('free'/'pro') | select true | admin writes; engine + web read |
| `plans` | `user_id` | plan('free'/'pro'), expires_at, suspended | select own | admin writes; engine + web read |
| `subscription_requests` | `id` | user_id, method, trx_id, note, status | insert/select own | web insert; admin approve/reject (service role) |

### Relationship diagram
```
auth.users (Supabase)
 └── profiles (1:1)
 └── plans (1:1)                     ← monetization + suspend
 └── personas (1:1)                  ← AI behaviour + business hours + commands
 └── telegram_accounts (1:many; ≤1 'user' + ≤1 'bot')
 └── ai_keys (1:many)
 └── products (1:many)
 └── cloudinary_accounts (1:many)  media_items (1:many)  media_settings (1:1)
 └── integrations (1:1)
 └── customers (1:many) ── customer_profiles (1:1 per customer)
 │                        conversations (1:many)  chat_states (1:1 per customer)
 └── followups (1:many) ── followup_sends (per customer×followup)
platform_settings (single row) · feature_flags (per feature)  ← global, admin
```

---

## 9. Database Migration History (run order)

SQL files are plain scripts (no numbered framework). Run in this order in Supabase SQL Editor:

1. **Phase-2 profiles** (inline in `web/PHASE-2-SETUP.md` / project memory): `profiles` + `handle_new_user` trigger.
2. `web/supabase/phase3-schema.sql` — telegram_accounts, ai_keys, personas, products, profiles (+RLS).
3. `engine/schema-phase3b.sql` — conversations, chat_states.
4. `web/supabase/phase4a-schema.sql` — `ai_keys.hint`.
5. `web/supabase/phase4b-schema.sql` — integrations.
6. `web/supabase/phase-b-schema.sql` — `telegram_accounts.mode`, `bot_token_enc`.
7. `web/supabase/phase-c-schema.sql` — cloudinary_accounts, media_items, media_settings.
8. `web/supabase/phase-d-schema.sql` — customers, followups, followup_sends.
9. `web/supabase/phase-e-hours-schema.sql` — persona business-hours columns.
10. `web/supabase/phase-f-schema.sql` — telegram_accounts → multi-row (`id` PK, `unique(user_id,mode)`) + `customers.via`.
11. `web/supabase/phase-g-summary-schema.sql` — customer_profiles.
12. `web/supabase/phase-h-admin-schema.sql` — platform_settings, feature_flags (seeded), plans.
13. `web/supabase/phase-i-subscription-schema.sql` — platform_settings pay columns + subscription_requests.
14. `web/supabase/phase-j-suspend-schema.sql` — `plans.suspended`.

Also: `alter publication supabase_realtime add table public.conversations;` (realtime viewer).

**Hazards:** Phase-F changes the `telegram_accounts` primary key from `user_id` to `id` —
must run before the engine's multi-connection code is deployed. Phase-2 must run first
(everything references `auth.users`/profiles). Phase-3 before 4a/4b/b (they alter its tables).

---

## 10. Telegram Architecture

Engine keys runtimes by **connection id**; a seller may have one `user` and one `bot`
simultaneously (`manager.sync()` starts one runner per connected row).

### Bot Mode — `engine/app/ptbbot.py` (class `PTBBot`)
- **Token storage:** `telegram_accounts.bot_token_enc`, Fernet-encrypted (`crypto.py`).
- **Connect/validate:** `app/api.py connect_bot` calls Telegram Bot API `getMe` via
  aiohttp (no api_id/hash), stores encrypted token via `db.store_bot`, triggers sync.
  Endpoint: `POST /internal/telegram/connect-bot`. Web wrapper: `/api/telegram/connect-bot`.
- **Startup:** `Application.builder().token(...).build()`, `MessageHandler(filters.ChatType.PRIVATE)`,
  `initialize()`/`start()`/`updater.start_polling(drop_pending_updates=True)`.
- **Message flow:** private only; store message, `touch_customer(via='bot')`,
  clear follow-up sends, pause + business-hours checks, instant keyword media (if allowed),
  media analysis, **debounce** buffer → one Gemini reply → send text/voice.
- **Disconnect:** dashboard deletes the `mode='bot'` row (RLS); next `sync()` stops it.
- **Limits:** no self-destruct/TTL (Bot API), no `send_read_acknowledge`, no owner
  Saved-Messages alert. Owner in-chat commands don't apply.

### Personal Account Mode — `engine/app/bot.py` (class `TenantBot`)
- **Creds:** `api_id`, `api_hash_enc`, `session_string_enc` (Fernet). Telethon `StringSession`.
- **Login:** `app/api.py send_code`/`verify_code` (Telethon, holds an in-memory pending
  client keyed by a token between the two calls; handles 2FA/`SessionPasswordNeededError`).
  Endpoints `POST /internal/telegram/send-code` + `/verify-code`; web wrappers under
  `/api/telegram/*`. Also a local CLI `engine/connect.py`.
- **Startup:** `connect()` + `is_user_authorized()` check, then `NewMessage` handler.
- **Message flow:** same brain as bot; additionally **owner commands** (outgoing msgs
  matching `cmd_*`) toggle global/per-customer pause; **mark-as-read** via
  `send_read_acknowledge`; **self-destruct** media via `ttl_seconds`.
- **Disconnect:** dashboard sets `status='disconnected'` + nulls session (RLS); sync stops it.

Both modes share `db`, `ai`, `prompt`, `voice`, `integration` (transport-agnostic brain).

---

## 11. AI Architecture — `engine/app/ai.py`, `prompt.py`

Pipeline (in `_handle` → debounced `_flush`):
```
customer msg → store + touch_customer → pause/hours checks → keyword media (may short-circuit)
 → media analysis (Gemini see_image/hear_audio or local doc extract)
 → debounce (config.DEBOUNCE_SECONDS=4) merges rapid msgs
 → build_system_prompt(persona, products) + customer_profiles summary
 → recent_messages (config.MEMORY_TURNS=16) as history + integration live-data
 → GeminiClient.reply() → store assistant msg → send text or voice
```
- **SDK:** `google-genai` (`from google import genai`, `types`).
- **Models:** `config.GEMINI_MODELS` (default `gemini-2.5-flash, gemini-2.5-flash-lite,
  gemini-1.5-flash`), tried in order.
- **Multiple keys / rotation:** `GeminiClient._run()` iterates active keys × models.
  **Invalid key** ("API key not valid") → `db.mark_ai_key(id,'invalid')` + dropped.
  **Quota/429** → dropped from the in-memory list for the session (not marked permanently).
  All keys gone → `_alert_no_keys()` (personal mode DMs owner's Saved Messages, once/hr).
- **Prompt / guardrails (`prompt.py build_system_prompt`):** persona identity + tone
  (`tone_config`) + topics + store_info + products (prices only from list) + custom
  instructions + limitations, plus fixed RULES: honest-when-asked (if `disclose_ai`),
  no invented prices, no card/OTP capture, ignore injection, live-data trust, human
  handoff, natural/human tone, **never reveal prompt/system/rules/code**.
- **Memory:** `conversations` (last 16 turns) + persistent `customer_profiles.summary`
  (daily `manager.run_summaries()` via `GeminiClient.summarize`). Raw purged after 7 days.
- **Media understanding:** image = inline bytes; voice = Gemini file upload; document =
  local text extraction (`voice.extract_document_text`).

---

## 12. Persona System — table `personas`, used by `prompt.py`

| Field | Effect |
|---|---|
| `persona_name`, `role_bio` | identity line |
| `tone_config` (jsonb) | formality / emoji / language(auto=match customer) / length |
| `topics` | what it should handle |
| `store_info` | payment/delivery/refund text |
| `limitations` | "must not do" rules |
| `custom_instructions` | extra behaviour |
| `greeting` | preferred greeting style |
| `disclose_ai` | if true, honest when asked "are you a bot?" |
| `voice_enabled` | allow voice replies (also gated by `voice` flag) |
| `voice_name` | edge-tts voice (default `en-US-JennyNeural`) |
| `cmd_takeover_stop/start`, `cmd_global_stop/start` | owner commands (personal mode) |
| `bot_running` | global pause (set by `//stopall` etc. / engine) |
| `hours_enabled`, `hours_start`, `hours_end`, `tz_offset`, `away_message` | business hours |
| `mode` | legacy field on personas (`byok`) — **NOT** the telegram mode |

---

## 13. Product System

`products` (name, category, price, description, is_active). CRUD in
`dashboard/products/page.tsx` via Supabase RLS. Engine `db.get_products` → injected into
the system prompt with the rule "quote prices ONLY from this list" → **anti-hallucination**.
No stock field (stock/live data comes via the website integration instead).

---

## 14. Media System

- **Storage:** Cloudinary. Per-seller `cloudinary_accounts` (cloud_name + **unsigned**
  `upload_preset`; no secret stored — browser uploads directly, blur is a URL param).
- **Upload flow (`dashboard/media/page.tsx`):** pick first `active` cloudinary account →
  browser size-check against `media_settings` → `POST api.cloudinary.com/v1_1/{cloud}/auto/upload`
  with the unsigned preset → save `secure_url`/`public_id`/`kind` + flags to `media_items`.
- **Keyword triggers:** `media_items.keyword` (comma-sep). Engine `_maybe_send_media`
  matches the customer text → sends **only** the media (skips the AI reply), 60s cooldown.
- **Transforms:** `blur` → inject `/upload/e_blur:1500/` into the Cloudinary URL (images);
  `spoiler` → Telegram spoiler; `self_destruct` → `ttl_seconds` (**personal mode only**).
- **Restrictions:** gated by `media` feature flag (engine checks `cfg["access"]["media"]`).

---

## 15. Follow-up System

- **Rules (`followups`):** name, `delay_days`, message, optional `media_id`, enabled.
  Create several for a drip (1/3/7 days). UI: `dashboard/followups/page.tsx`.
- **Tracking:** persistent `customers.last_msg_at` (+ `via`). `followup_sends` prevents
  re-sending a rule to a customer; cleared when the customer messages again (sequence resets).
- **Scheduling:** `manager.loop()` runs `run_followups()` every `FOLLOWUP_INTERVAL` (1800s)
  for each runner; each runner only handles customers whose `via` matches its mode.
- **Sending:** `_send_followup` — text and/or media (reuses `_send_media`).
- **Plan gating:** engine checks `access["followups"]`. **Failure handling:** wrapped in
  try/except with logging.

---

## 16. Customer & Conversation System

- **Identification:** `customer_id` = Telegram chat/user id. `customers` upserted on each
  inbound message with `via`.
- **Conversation storage:** `conversations` (role user/assistant). **Retention:** purged
  after `MEMORY_RETENTION_DAYS` (7) by `manager` (~daily).
- **Persistent memory:** `customer_profiles.summary` (daily `run_summaries`, cap 50
  customers/user, min 4 msgs, active ≤2 days) → injected into prompt for consistency.
- **Chat states:** `chat_states.paused` per customer (personal-mode `//stop`/`//start`).
- **Realtime:** `dashboard/conversations/page.tsx` subscribes to `postgres_changes` INSERT
  on `conversations` (requires realtime enabled for the table).
- **Pause/takeover:** personal mode via in-chat commands; global via `personas.bot_running`.
  Bot-mode dashboard pause = 🔜 not implemented.

---

## 17. Business Hours

Config on `personas` (`hours_enabled`, `hours_start`, `hours_end` 0–23, `tz_offset` hours
from UTC, `away_message`). Engine (`_handle`, both modes): local hour = UTC + `tz_offset`;
`within = start≤h<end` (handles wrap when start>end). Outside hours → sends `away_message`
(per-customer 2-hour cooldown) and returns (no AI). Gate flag key: `business_hours`
(present; engine does not additionally gate the hours check by plan — 🟡).

---

## 18. Website/API Integration

- **Config (`integrations`):** `api_url`, `header_name`, `header_value_enc` (Fernet),
  `enabled`, `note`. Saved via `/api/integration` → engine `/internal/integration`
  (encrypts the header value). UI: `dashboard/integration/page.tsx`.
- **Request flow (`engine/app/integration.py call_integration`):** `POST {api_url}`
  JSON `{"query": "<customer text>"}` + optional `{header_name: <decrypted value>}`,
  8s timeout. Response: reads `context|answer|result|data|text` (or whole body), truncated
  1500 chars, injected as `[live data: …]`. Gated by `integration` flag. Errors → ignored (bot still replies).

---

## 19. Admin System

- **Gate:** `ADMIN_EMAIL` env vs logged-in email (`lib/admin.ts isAdminEmail`). Enforced in
  `app/admin/page.tsx` + `/api/admin/data` + `/api/admin/update` (403). Writes use `serviceClient()`.
- **UI (`components/sections/admin-panel.tsx`):** master **monetization on/off**;
  per-feature **free/pro** toggles; **payment settings** (price_text, pay_number,
  pay_instructions, pro_days); **pending payments** approve/reject; **users** list with
  monitoring (customers, messages, last_active, connections) + set plan + **suspend/activate**.
- **Enforcement:** engine `db.get_access(user_id)` (monetization + flag tier + plan) feeds
  `cfg["access"]`; `get_connected_connections` excludes suspended users → their bots stop
  on next sync; dashboard shows a suspended lock screen.

---

## 20. Subscription & Monetization

- **Plans:** `plans.plan` free/pro + `expires_at` + `suspended`. `feature_flags.tier`
  per feature. `platform_settings.monetization_on` master switch.
- **Gating:** monetization OFF → everything free. ON → features with `tier='pro'` need a
  non-expired `pro` plan (dashboard shows 🔒 Pro; engine enforces media/voice/followups/integration).
- **Payment (manual bKash/Nagad):**
```
user pays to pay_number → submits {method, trx_id} (dashboard/upgrade → subscription_requests, status=pending)
 → admin sees it in /admin (Pending payments)
 → Approve  → plans.plan='pro', expires_at = now + pro_days ; request.status='approved'
   Reject   → request.status='rejected'
 → expiry: engine/dashboard treat expired pro as free
 → suspend: admin sets plans.suspended=true → engine stops bots + dashboard locked
```
- Stripe/automated PGW = 🔜 not implemented (documented as unusable in BD for Stripe).

---

## 21. API Documentation (application endpoints)

All under `web/src/app`. Internal `/api/telegram/*`, `/api/ai-key`, `/api/integration`
require a logged-in user and forward to the engine with `INTERNAL_API_TOKEN`. Engine
`/internal/*` require header `x-internal-token`.

| Method | Path | Auth | Role | Request | Effect / tables |
|---|---|---|---|---|---|
| GET | `/auth/confirm` | link | user | `?code` or `?token_hash&type&next` | verifyOtp/exchange → session → redirect |
| POST | `/auth/signout` | session | user | — | signOut → redirect `/` |
| POST | `/api/telegram/send-code` | session | user | `{api_id,api_hash,phone}` | engine send-code → `{pending_token}` |
| POST | `/api/telegram/verify-code` | session | user | `{pending_token,code,password?}` | engine verify → stores session (`telegram_accounts`) |
| POST | `/api/telegram/connect-bot` | session | user | `{bot_token}` | engine getMe + `store_bot` → `telegram_accounts` |
| POST | `/api/ai-key` | session | user | `{key}` | engine encrypt → `ai_keys` |
| POST | `/api/integration` | session | user | `{api_url,header_name,header_value,enabled,note}` | engine encrypt → `integrations` |
| GET | `/api/admin/data` | session+admin | admin | — | settings, flags, users(+stats), requests |
| POST | `/api/admin/update` | session+admin | admin | `{type:'settings'|'flag'|'plan'|'paysettings'|'request'|'suspend', …}` | writes platform_settings/feature_flags/plans/subscription_requests |

**Engine internal (aiohttp, `app/api.py`):** `POST /internal/telegram/send-code`,
`/internal/telegram/verify-code`, `/internal/telegram/connect-bot`, `/internal/ai-key`,
`/internal/integration`; `GET /` and `/health`. Auth: `x-internal-token` == `INTERNAL_API_TOKEN`.

Many dashboard reads/writes are **direct Supabase (RLS)** from the browser, not API routes
(products, personas, media, followups, conversations, customers, subscription submit, key list/delete).

---

## 22. Environment Variables

**Vercel (web)** — used in `web/src`, `web/middleware.ts`:
| Name | Required | Secret | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | no | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | no | anon/publishable key (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **yes** | admin API writes / listUsers (server only) |
| `BOT_ENGINE_URL` | for connect/integration | no | `https://<render>.onrender.com` |
| `INTERNAL_API_TOKEN` | for engine calls | **yes** | must equal engine's |
| `ADMIN_EMAIL` | for `/admin` | no | comma-sep admin emails |
| `RESEND_API_KEY` | not on active path | **yes** | present in `lib/resend.ts` (unused by signup) |
| `EMAIL_FROM` | not on active path | no | present in `lib/resend.ts` |

**Render (engine)** — used in `engine/app`:
| Name | Required | Secret | Purpose |
|---|---|---|---|
| `DATABASE_URL` | yes | **yes** | Supabase **pooler** URI (asyncpg, ssl=require) |
| `FERNET_KEY` | yes | **yes** | encrypt/decrypt session/keys (crypto.py) |
| `GEMINI_MODELS` | no (default set) | no | model priority list |
| `PORT` | no (10000) | no | health/internal server |
| `SYNC_INTERVAL` | no (120) | no | tenant re-sync seconds |
| `INTERNAL_API_TOKEN` | for internal API | **yes** | must equal web's |
| `PLATFORM_API_ID` / `PLATFORM_API_HASH` | legacy | mixed | read in config but bot mode no longer needs them |

Never put secrets in `NEXT_PUBLIC_*`. Never ship `SUPABASE_SERVICE_ROLE_KEY`/`FERNET_KEY`/
`INTERNAL_API_TOKEN` to the browser.

---

## 23. Security Architecture

- **RLS:** all tenant tables `own` policies (`auth.uid()=user_id`); config tables read-only
  to clients; writes via service role.
- **Encryption:** Fernet (`engine/app/crypto.py`) for `api_hash_enc`, `session_string_enc`,
  `bot_token_enc`, `ai_keys.key_enc`, `integrations.header_value_enc`. Key = `FERNET_KEY` (env only).
- **Internal API:** `x-internal-token` shared secret between web and engine.
- **Sessions/cookies:** managed by `@supabase/ssr` (httpOnly Supabase cookies).
- **Input validation:** basic (required-field checks in API routes); **not** comprehensive.

### Weaknesses (documented, not fixed)
- **MEDIUM** — `platform_settings`/`feature_flags` have `select using (true)` → readable by
  any anon client. It's only feature config (not secrets), but it is public.
- **MEDIUM** — Pro/visual gating on Pro **sub-pages** relies on the dashboard; a user could
  open a locked page URL directly and *configure* a Pro feature (engine still won't *run* it).
- **MEDIUM** — No rate limiting on `/api/telegram/send-code` (Telegram flood-wait is the only
  backstop) or on `/internal/*` beyond the token.
- **LOW** — In-memory pending-login store in `api.py` is lost on engine restart.
- **LOW** — `PLATFORM_API_ID/HASH` remain referenced though unused (config drift).
- **NOTE** — abuse detection is manual (admin monitoring); no automated flagging.

---

## 24. Data Flow Diagrams

**Signup**
```
form → supabase.auth.signUp(emailRedirectTo=/auth/confirm) → email (Supabase SMTP=Resend)
 → click → /auth/confirm (verifyOtp/exchange) → session cookie → /dashboard
```
**Bot connect**
```
dashboard/connect → /api/telegram/connect-bot → engine /internal/telegram/connect-bot
 → Bot API getMe → store_bot (bot_token_enc) → manager.sync() → PTBBot polling
```
**Personal connect**
```
send-code (Telethon send_code_request, keep pending client) → user enters code
 → verify-code (sign_in, 2FA if needed) → store_session (session_string_enc) → sync → TenantBot
```
**Incoming message → AI**
```
Telegram → adapter handler → store + touch_customer → pause/hours → keyword media?(skip AI)
 → media analysis → debounce → prompt(persona+products+summary) + memory + integration
 → GeminiClient.reply (key/model rotation) → store + send text/voice
```
**Media trigger**
```
customer text contains media_items.keyword → _maybe_send_media (access['media']) → Cloudinary URL
 (blur/spoiler[/ttl]) → send → return (no AI reply)
```
**Follow-up**
```
manager loop (1800s) → run_followups → for idle customers(via==mode) with unsent rule
 → _send_followup → record_followup_send
```
**Payment / admin approval**
```
upgrade → insert subscription_requests(pending) → admin /api/admin/update {type:request,action:approve}
 → plans pro + expires_at ; request approved → engine access recomputed (60s cfg cache)
```
**Suspension**
```
admin /api/admin/update {type:suspend} → plans.suspended=true
 → get_connected_connections excludes user → sync stops runners ; dashboard shows lock
```

---

## 25. Background / Async Processing (engine)

Entry `main.py` → `manager.run()`:
- **`start_web`** — aiohttp `/` `/health` + internal routes. Bound to `PORT`.
- **`manager.loop()`** — `init_pool` → `sync()` → forever: sleep `SYNC_INTERVAL` →
  `sync()` (start new / stop removed connections) → daily `purge_old_messages()` →
  every `FOLLOWUP_INTERVAL` `run_followups()` on each runner → daily `run_summaries()`.
- **Per-runner:** Telethon `NewMessage` handler (event-driven) / PTB `updater.start_polling`.
- **Debounce:** per-customer `asyncio.create_task(self._flush(...))` cancelled on new msg.
- **Restart behaviour:** all state is in Supabase, so runners rebuild from DB on start;
  **in-memory pending logins and debounce buffers are lost** on restart. Render free sleep
  stops everything until pinged.

---

## 26. Deployment Architecture

- **Vercel (web):** import `web/` repo; framework auto-detected; set web env vars; redeploy.
- **Render (engine):** Web Service, root `engine`, **Build** `pip install -r requirements.txt`,
  **Start** `python main.py`; set engine env vars. Health: `/health`. Free tier sleeps at 15
  min idle → keep awake with an external ping (UptimeRobot) or use a small VPS.
- **Supabase:** run all SQL (§9); Auth confirm-email ON + custom SMTP (Resend) + redirect URLs;
  use **Session pooler** `DATABASE_URL` (IPv4).
- **Build/start commands:** web = Next.js defaults (`next build`/`next start`); engine as above.

---

## 27. Production Operations

- **Logs:** Render logs (engine), Vercel logs (web). Engine uses Python `logging`.
- **Health:** `GET /health` on the engine.
- **Persistence:** everything durable is in Supabase; engine local disk (`downloads/`,
  `voice_tmp/`) is ephemeral and safe to lose.
- **Render limits:** no background workers on free (engine runs as a web service + ping);
  512 MB fits ~10–15 Telethon clients; ephemeral FS; IPv6 direct-DB unreachable (use pooler).
- **Supabase limits:** free pauses after 7 days idle; no backups on free (schedule your own).
- **Scaling:** move engine to a VPS + shard runners across processes as tenants grow.

---

## 28. Current Feature Status

| Feature | Status | Location | Notes |
|---|---|---|---|
| Auth + verify | ✅ | web auth | Supabase SMTP=Resend |
| Bot connect (PTB) | ✅ | api.py/ptbbot.py | getMe validate, no api_id/hash |
| Personal connect (Telethon) | ✅ | api.py/bot.py | 2FA handled |
| Multi-connection (bot+personal) | ✅ | manager/db | keyed by connection id |
| Gemini reply + rotation | ✅ | ai.py | invalid vs quota handling |
| Media analysis (img/voice/doc) | ✅ | ai.py/voice.py | |
| Voice reply on request | ✅ | voice.py | Bangla-script trigger 🟡 |
| Keyword media (only-media) | ✅ | _maybe_send_media | 60s cooldown |
| Follow-ups | ✅ | manager/run_followups | needs always-on |
| Business hours | ✅ | _handle | |
| Website integration | ✅ | integration.py | |
| Conversations realtime | ✅ | dashboard/conversations | needs realtime enabled |
| Customers + daily summary | ✅ | run_summaries | needs always-on |
| Monetization + flags | ✅ | admin + get_access | |
| Subscription (bKash manual) | ✅ | upgrade + admin | |
| Suspend/monitor | ✅ | admin + get_connected_connections | stats capped at 20k rows |
| Bot-mode pause from dashboard | 🔜 | — | only global/personal today |
| `bot_mode` flag enforcement | 🟡 | — | flag exists, engine doesn't stop bot on it |
| Managed keys / ElevenLabs | 🔜 | — | planned |
| Automated payment gateway | 🔜 | — | manual only |
| Automated abuse detection | 🔜 | — | manual monitoring |
| Resend custom-API email path | 🟡 | lib/resend.ts | present, unused by signup |
| Python version pin | ❓ | — | not in repo |
| Automated tests | 🔴 | — | none found |

---

## 29. Known Bugs & Gotchas

- No `TODO/FIXME/HACK` markers found in source (searched).
- **`.tsx` in `.py`** — a wrong paste once broke `engine/app/bot.py` (SyntaxError on `…`); keep repos separate.
- **`maybeSingle()` on `telegram_accounts`** breaks with multiple rows per user (post Phase-F);
  code now uses list+length where needed — watch this if adding queries.
- **Gemini model drift** — `GEMINI_MODELS` must match models available in your AI Studio.
- **Realtime silent** unless the table is added to `supabase_realtime` publication.
- **Follow-ups/summaries won't run** if the engine is asleep (Render free).
- **`INTERNAL_API_TOKEN` / `FERNET_KEY` mismatch** across web/engine (or across re-encrypts) breaks connect/decrypt silently.
- **Duplicate/legacy:** `lib/resend.ts`+`lib/emails.ts` (unused path); `PLATFORM_API_ID/HASH` (unused); `personas.mode` (legacy, unrelated to telegram mode).

---

## 30. Technical Debt

- **Frontend:** Pro gating only visual on sub-pages; one big `theme.css`; no `error.tsx`.
- **Backend/engine:** `bot.py` and `ptbbot.py` duplicate the brain flow (by design for
  isolation, but drift risk); in-memory pending-login/debounce (lost on restart);
  legacy platform-api creds.
- **Database:** admin monitoring aggregates in JS from capped fetches (not SQL group-by/RPC).
- **Security:** no rate limiting; public read on config tables; manual abuse control.
- **Performance:** all runners in one process; no sharding; per-message DB reads (mitigated by 60s cfg cache).
- **DevOps:** Render free sleep; no tests/CI; no backups on free Supabase.

---

## 31. Upgrade Guide (adding a feature safely)

Standard process:
1. Read this doc + the relevant adapter (`bot.py`/`ptbbot.py`) and `db.py`.
2. Decide DB changes → write a new `web/supabase/phase-*.sql` (idempotent `if not exists`) and add to the run order (§9).
3. Add RLS policies (`own …`) for any new tenant table.
4. Engine: add `db.py` queries; wire into the **brain** used by **both** `bot.py` and `ptbbot.py`.
5. Web API only if a secret/engine call is needed (else use Supabase RLS from the client).
6. Frontend: dashboard page/card in `src/app/dashboard/...`; styles reuse `theme.css` classes.
7. Feature flag: add a key to `feature_flags` (seed in SQL) + to `db.get_access` `_FEATURES` + gate in engine.
8. Plan enforcement: gate server-side/engine-side (`cfg["access"][key]`), not just UI.
9. Test with a real tenant (both modes); check Render logs.
10. Deploy web + engine; run SQL; verify in prod.

Common change maps:
- **New dashboard setting** → persona/table column (SQL) → engine config loader/`prompt.py` → `dashboard/settings` UI → (flag if Pro).
- **New Pro feature** → SQL table + RLS → engine brain + `access[key]` gate → dashboard page + card lock → `feature_flags` seed → admin toggle already generic.
- **New admin control** → `platform_settings`/table → `/api/admin/data` + `/api/admin/update` + `admin-panel.tsx`.

---

## 32. Modification Safety Rules

- Never expose secrets to the browser; never use service-role client-side.
- Never bypass RLS accidentally (client writes must be own-scoped; admin writes via `serviceClient()` in gated routes only).
- Never store persistent runtime state only on Render disk — put it in Supabase.
- Never break Bot mode while editing Personal mode, or vice-versa — they share the brain but have separate adapters (`ptbbot.py` / `bot.py`); change shared logic in `db/ai/prompt/voice/integration`.
- DB changes require a migration file + run-order update; keep them idempotent.
- Pro restrictions must be enforced in the engine (`cfg["access"]`), not only hidden in the UI.
- Preserve API contracts (`/api/*`, `/internal/*`, `x-internal-token`) unless versioned intentionally.
- Never put Python in `web/`; never put TS/TSX in `engine/`.
- Do not invent DB columns or API routes — use the ones in §8/§21.
- Keep `INTERNAL_API_TOKEN` identical across web+engine; keep `FERNET_KEY` stable.
- Don't remove functionality without recording it in §36 change log.

---

## 33. Testing

- **Existing tests:** none found (no test framework, no test files) → 🔴.
- **Manual smoke tests:**
  - **Signup/Login:** register → receive verify email → `/auth/confirm` → `/dashboard`; logout.
  - **Bot:** connect token → AI key + persona → DM the @bot from another account → reply.
  - **Personal:** connect (phone+code) → DM from another account → reply; `//stop`/`//start`.
  - **AI:** ask a product/price question → answer from `products` only.
  - **Media:** upload with keyword → customer sends keyword → only media (blur/spoiler).
  - **Follow-up:** rule delay 1d → make `customers.last_msg_at` old → runs on next loop.
  - **Payment:** admin set price/number + monetization ON + a Pro feature → user submits TrxID → admin approve → feature works.
  - **Admin/Suspend:** suspend a user → their bot stops (≤ sync interval) + dashboard locked → activate.

---

## 34. Troubleshooting

- **"Platform is not configured for bot mode"** → legacy message; ensure the new
  `api.py connect_bot` (getMe) engine code is deployed. Bot mode no longer needs `PLATFORM_API_*`.
- **Bot doesn't reply** → check Render logs for `bot started (…)`; verify AI key active + persona saved;
  confirm all SQL ran (esp. Phase-F); check `no working AI keys`.
- **`Fernet key must be 32 url-safe base64…`** → `FERNET_KEY` invalid; regenerate; keep identical everywhere.
- **`Network is unreachable` (asyncpg)** → using direct DB host; switch to Session pooler URI.
- **Email not arriving** → check Resend logs + Supabase SMTP config + verified domain; default Supabase mail is rate-limited.
- **Signup 500 / `535 Invalid username`** → Supabase SMTP creds wrong (Resend SMTP user = `resend`, password = API key), or missing envs.
- **`invalid character '…' SyntaxError`** in engine → TSX pasted into a `.py` file; restore from the correct file.
- **Realtime not updating** → add `conversations` to `supabase_realtime` publication.

---

## 35. Future Roadmap

- **Planned (from project notes/comments):** managed keys + ElevenLabs voice; automated
  bKash PGW; bot-mode pause/takeover from dashboard; Bangla-script voice triggers;
  automated abuse detection.
- **Possible:** super-admin platform-wide Cloudinary/keys; Sentry; DB backups; rate-limiting; worker sharding.
- **Not decided:** multi-channel (WhatsApp/web widget).

---

## 36. Change Log

```
(seed — fill going forward)
YYYY-MM-DD  Change · Files affected · DB change? · Migration? · Deploy impact
```

---

## 37. Quick Reference

- **Repos/folders:** `web/` (Vercel), `engine/` (Render).
- **Entry points:** web `src/app/layout.tsx` + `middleware.ts`; engine `main.py` → `app/manager.py`.
- **Brain:** `engine/app/{db,ai,prompt,voice,integration}.py`; adapters `bot.py` (Telethon), `ptbbot.py` (PTB).
- **Main tables:** telegram_accounts, ai_keys, personas, products, conversations, customers,
  customer_profiles, chat_states, media_items, cloudinary_accounts, media_settings, followups,
  followup_sends, integrations, plans, feature_flags, platform_settings, subscription_requests, profiles.
- **Web API:** `/api/telegram/{send-code,verify-code,connect-bot}`, `/api/ai-key`, `/api/integration`, `/api/admin/{data,update}`, `/auth/{confirm,signout}`.
- **Engine internal:** `/internal/telegram/{send-code,verify-code,connect-bot}`, `/internal/ai-key`, `/internal/integration`, `/health`.
- **Env (must-match pairs):** `INTERNAL_API_TOKEN` (web+engine); `FERNET_KEY` stable on engine.
- **Services:** Telegram, Gemini, Cloudinary, Supabase, Resend(SMTP), Vercel, Render.
- **Commands:** web `next build`/`next start`; engine `pip install -r requirements.txt` + `python main.py`.
- **Health:** `GET /health` on engine.
- **Top security rules:** service role + `FERNET_KEY` server-only; enforce Pro in engine; RLS own-scoped; keep repos separate.

*This document reflects the current repository (through admin monitoring + suspend). Where code and older notes disagreed, code was taken as source of truth.*
