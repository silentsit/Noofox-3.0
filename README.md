# Noofox E-Commerce 3.0

Modern e-commerce platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase** (PostgreSQL + Auth). Ready for deployment on Vercel or Netlify.

## Quick start

1. **Install:** `npm install`
2. **Env:** Copy `.env.example` to `.env.local` and set your Supabase URL and anon key.
3. **Database:** Run `supabase/migrations/001_schema.sql` in the Supabase SQL Editor.
4. **Run:** `npm run dev` → [http://localhost:3000](http://localhost:3000)

## Features

- **Customer:** Homepage with hero + featured bestsellers (2×4 grid), Shop/About/Shipping pages, instant "Buy Now" → checkout, cart summary, dual payment UI (card via ChangeHero + crypto placeholder), guest email for reconciliation, email + Google auth, protected dashboard (orders, tracking, profile/shipping). Checkout captures IP + User-Agent; payment failure routes back to `/checkout` with error toast, cart preserved.
- **Reconciliation:** On signup/OAuth callback, guest orders matching the user's email are linked to their new `user_id` (requires `customer_email` on orders).
- **Admin:** Mission Control dashboard (charts), order management (full status lifecycle including Refunded/Failed, tracking ID, customer email). Changing status to Cancelled/Refunded/Failed restores inventory. Product CRUD. Access at `/admin` (user role must be `admin`).
- **Emails:** `POST /api/emails` for event-driven transactional emails (order_received, order_shipped, order_refunded); wire to Supabase Webhooks or your app.

## Deployment

See **doc/DEPLOYMENT.md** for env vars, database setup, and Vercel/Netlify steps.

## Tech stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Supabase: Auth (email + Google), PostgreSQL (users, products, orders)
- Recharts (admin dashboard), persistent cart (localStorage)
