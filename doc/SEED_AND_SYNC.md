# Seeding NeuroVita Products & Syncing Content from noofoxxx.local

## 1. Seed products (NeuroVita names + pricing)

Products are copied from [whalefriend-shop.lovable.app](https://whalefriend-shop.lovable.app) with the same names and pricing structure. No images are set (placeholders or noofoxxx paths can be added later).

**Run in Supabase SQL Editor:**

1. Open your project → **SQL Editor**.
2. Paste and run the contents of `supabase/seed_neurovita_products.sql`.

Or from CLI (with `psql` and `DATABASE_URL`):

```bash
psql "$DATABASE_URL" -f supabase/seed_neurovita_products.sql
```

This inserts 10 products: Modalert 200mg, Modvigil 200mg, Waklert 150mg, Artvigil 150mg, ModaWell 200mg, Sample Pack, Vidalista 20mg, Cenforce 100mg, Kamagra 100mg, Zopiclone 7.5mg.

## 2. Sync product page content from noofoxxx.local (optional)

To copy full product page content (e.g. long descriptions) from **noofoxxx.local** into Supabase:

1. Ensure **noofoxxx.local** is running and reachable on your machine.
2. Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or anon key if RLS allows updates).
3. Run:

```bash
npm run sync:noofoxxx
```

The script:

- Fetches `http://noofoxxx.local/sitemap_index.xml` to discover product URLs.
- Fetches each product page and extracts main content.
- Matches pages to existing products by URL slug / name and updates the `description` field in Supabase.

Each product already has its own page on Noofox at **/product/[id]** (e.g. after opening a product from the shop, the URL is `/product/<uuid>`).
