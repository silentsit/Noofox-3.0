# Noofox E-Commerce – Deployment & Setup

## Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon/public key
- `NEXT_PUBLIC_SITE_URL` – Site URL (e.g. `https://yourdomain.com`) for OAuth redirects
- Optional: `SUPABASE_SERVICE_ROLE_KEY` for server-side admin operations

## Database

1. In Supabase: SQL Editor → run `supabase_schema.sql` (root) for a fresh install. If you already ran an earlier schema, run `supabase/migrations/002_orders_hpos_columns.sql` then `supabase/migrations/003_handle_new_user_reconciliation.sql` (adds guest order reconciliation to the new-user trigger).
2. In Authentication → Providers: enable Email and Google; set redirect URLs (e.g. `https://yourdomain.com/**`, `http://localhost:3000/**`).
3. Create an admin user: sign up normally, then in Supabase Table Editor set `users.role` to `admin` for that user.

## TypeScript types from Supabase

After changing the schema, regenerate types: run `supabase link` (once), then `npm run gen:types`. This overwrites `src/types/supabase.ts` with the output of `supabase gen types typescript --linked`. The app also ships with hand-written types in `src/types/supabase.ts` so it works without running the CLI.

## Event-driven emails

`POST /api/emails` accepts `{ event, payload }`. Events: `order_received` (Pending→Processing), `order_shipped` (tracking ID added), `order_refunded`. Trigger from Supabase Webhooks or app logic; wire your email provider (Resend, SendGrid, etc.) in the route.

## Vercel

1. Import the repo and set framework to Next.js.
2. Add the env vars above.
3. Deploy. No extra config needed (`vercel.json` is optional).

## Netlify

1. New site from Git; build command: `npm run build`.
2. Use the Netlify Next.js plugin (see `netlify.toml`).
3. Add the same env vars in Site settings → Environment variables.

## ChangeHero & Crypto

- **Card (ChangeHero):** The “External On-Ramp” button links to ChangeHero. Replace the URL in `src/app/checkout/page.tsx` if needed. A future ChangeHero API integration can replace the link with an embedded flow.
- **Crypto:** The checkout page includes a placeholder for a 3rd-party Web3 gateway; wire your chosen provider when ready.
