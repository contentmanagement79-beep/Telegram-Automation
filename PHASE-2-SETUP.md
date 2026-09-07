# Phase 2 — Auth + Email Verification (setup)

This wires up **Supabase Auth** with **branded verification emails sent through the
Resend API** from your own domain, plus a protected `/dashboard`.

## How the flow works
1. User submits the signup form → `POST /api/auth/signup`.
2. The server uses Supabase (service role) to create the user and generate a secure
   verification **token** — Supabase does **not** send an email here.
3. We build a link to `/auth/confirm?...` and send it via the **Resend API** using our
   own branded template (`src/lib/emails.ts`).
4. User clicks the link → `/auth/confirm` verifies the token, starts the session, and
   redirects to `/dashboard`.
5. Login uses email + password; middleware protects `/dashboard`.

> Security note: Supabase still generates and validates the token (proven + safe). We
> only control **delivery and design** of the email. We do not hand-roll token logic.

## 1. Create a Supabase project
- supabase.com → New project.
- **Project Settings → API**, copy:
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)

### Auth settings (Supabase → Authentication)
- **Providers → Email:** enable, and keep **"Confirm email" ON** (so users must verify).
- **URL Configuration → Site URL:** your production URL (e.g. `https://your-app.vercel.app`).
- **Redirect URLs:** add both:
  - `http://localhost:3000/**`
  - `https://your-app.vercel.app/**`
- You do **not** need to configure Supabase SMTP — we send the email ourselves via Resend.

## 2. Set up Resend
- resend.com → create an API key → `RESEND_API_KEY`.
- Add & verify your domain (Domains → add DNS records). Then set:
  - `EMAIL_FROM="Autogram <hello@yourdomain.com>"` (must be on the verified domain).
- **Testing without a domain:** Resend lets you send from `onboarding@resend.dev` to your
  own account email. The code falls back to that if `EMAIL_FROM` is unset.

## 3. Environment variables
Copy `.env.example` → `.env.local` for local dev, and add the **same** vars in Vercel
(Project → Settings → Environment Variables). Redeploy after adding them.

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
EMAIL_FROM="Autogram <hello@yourdomain.com>"
```

## 4. Install & run
```bash
npm install     # pulls in @supabase/ssr, @supabase/supabase-js, resend
npm run dev
```
Then: sign up → check your inbox → click the link → you land on `/dashboard`.

## New files in this phase
```
middleware.ts                         # refresh session + protect /dashboard
src/lib/supabase/client.ts            # browser client
src/lib/supabase/server.ts            # server client
src/lib/supabase/admin.ts             # service-role client (server only)
src/lib/supabase/middleware.ts        # session/guard helper
src/lib/resend.ts                     # Resend sender
src/lib/emails.ts                     # branded verification email
src/app/api/auth/signup/route.ts      # create user + email link via Resend
src/app/auth/confirm/route.ts         # verify token → start session
src/app/auth/signout/route.ts         # sign out
src/app/dashboard/page.tsx            # protected placeholder
src/app/signup/page.tsx  (updated)    # real signup
src/app/login/page.tsx   (updated)    # real login
```

## Troubleshooting
- **Email not arriving:** check the Resend dashboard "Emails" log. In test mode you can
  only send to your own account email until a domain is verified.
- **"Email not confirmed" on login:** the user hasn't clicked the link yet.
- **Redirect loops / not protected:** make sure `middleware.ts` is at the project root
  (same level as `package.json`), not inside `src/`.

## Next: Phase 3
Onboarding wizard — connect Telegram (via the Python engine's internal API), add the
Gemini key, and build the persona — then the dashboard proper.
