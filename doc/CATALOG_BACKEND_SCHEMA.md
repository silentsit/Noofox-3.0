# Catalog Backend Schema (Production-Ready)

This document maps the imported Noofox catalog (currently `src/data/catalog.json`) to a durable, production-ready Supabase schema so the catalog can live in the database instead of local JSON.

## Goals

- **Same semantics** as current catalog: products keyed by `slug`, variants with pricing, SEO, FAQs, structured data.
- **URL parity**: `url_path` and `slug` remain the canonical public identifiers (no breaking change to sitemap or product routes).
- **Checkout compatibility**: Cart/orders use `product_id` like `slug::variantId`; the backend can resolve these via `catalog_products.slug` + `catalog_variants.variant_id`.
- **Durable**: Normalized where it helps (variants, FAQs), JSONB where structure is variable or rarely queried (SEO, structured data, breadcrumbs).

## Entity Relationship (High Level)

```
catalog_products (1) ──< catalog_variants (many)
       │
       └──< catalog_faqs (many)

catalog_import_meta (optional, audit log of imports)
```

- **catalog_products**: One row per product. Holds slug, names, descriptions, price range, review summary, breadcrumbs, SEO, related_slugs, structured_data.
- **catalog_variants**: One row per package/option. FK to catalog_products. Holds variant_id (from live site), label, quantity_text, price, regular_price, in_stock, etc.
- **catalog_faqs**: One row per product FAQ. FK to catalog_products. question, answer, sort_order.
- **catalog_import_meta**: Optional. One row per import run (generated_at, source, sitemap_url, product_count) for auditing.

## Table Definitions

### 1. `catalog_products`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key (for FKs only). Default `uuid_generate_v4()`. |
| `slug` | TEXT | NOT NULL | Unique URL slug (e.g. `buy-modaxl-300-mg`). **Unique.** |
| `url_path` | TEXT | NOT NULL | Path with slashes (e.g. `/buy-modaxl-300-mg/`). |
| `source_url` | TEXT | NULL | Original URL on live site (e.g. `https://noofox.com/buy-modaxl-300-mg/`). |
| `name` | TEXT | NOT NULL | Display name (e.g. `Modaxl 300 Mg`). |
| `title` | TEXT | NOT NULL | Full page title (e.g. `Buy ModaXL 300 mg \| Noofox`). |
| `price_text` | TEXT | NOT NULL | Display price range string (e.g. `$ 45.00 - $ 125.00`). |
| `price_min` | DECIMAL(12,2) | NOT NULL | Min variant price. |
| `price_max` | DECIMAL(12,2) | NOT NULL | Max variant price. |
| `category` | TEXT | NULL | Category label (e.g. `Nootropic`). |
| `breadcrumbs` | JSONB | NOT NULL | Array of `{ name, href }`. Default `[]`. |
| `short_description_html` | TEXT | NOT NULL | Short description (HTML). |
| `short_description_text` | TEXT | NOT NULL | Plain-text short description. |
| `description_html` | TEXT | NOT NULL | Long-form content (HTML). |
| `description_text` | TEXT | NOT NULL | Plain-text long description. |
| `review_average_rating` | DECIMAL(3,2) | NULL | Average rating (e.g. 5.00). |
| `review_count` | INTEGER | NOT NULL DEFAULT 0 | Number of reviews. |
| `related_slugs` | TEXT[] | NOT NULL | Array of product slugs. Default `[]`. |
| `seo` | JSONB | NOT NULL | Full SEO blob: title, description, canonical, robots, openGraph, twitter. |
| `structured_data` | JSONB | NOT NULL | Array of schema.org JSON-LD objects. Default `[]`. |
| `created_at` | TIMESTAMPTZ | NOT NULL | Default `NOW()`. |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Default `NOW()`, trigger-updated. |

**Indexes**

- `UNIQUE(slug)`
- `idx_catalog_products_slug` (for lookups by slug)
- `idx_catalog_products_updated_at` (for cache invalidation / sync)

**Mapping from `CatalogProduct`**

- `id` → new UUID (not from JSON).
- `slug`, `url_path`, `source_url`, `name`, `title`, `price_text` → same.
- `priceRange.min` → `price_min`, `priceRange.max` → `price_max`.
- `breadcrumbs` → `breadcrumbs` (JSONB).
- `shortDescriptionHtml`/`shortDescriptionText`, `descriptionHtml`/`descriptionText` → snake_case columns.
- `reviewSummary.averageRating` → `review_average_rating`, `reviewSummary.reviewCount` → `review_count`.
- `relatedSlugs` → `related_slugs` (TEXT[]).
- `seo` → `seo` (JSONB).
- `structuredData` → `structured_data` (JSONB).

---

### 2. `catalog_variants`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key. Default `uuid_generate_v4()`. |
| `product_id` | UUID | NOT NULL | FK → `catalog_products(id)` ON DELETE CASCADE. |
| `variant_id` | TEXT | NOT NULL | Original id from import (e.g. `16184`). Used in cart as `slug::variant_id`. |
| `sku` | TEXT | NULL | SKU from live site. |
| `label` | TEXT | NOT NULL | Full label (e.g. `30 pills — $45 — ($1.50 each)`). |
| `quantity_text` | TEXT | NOT NULL | E.g. `30 pills`. |
| `per_unit_text` | TEXT | NULL | E.g. `$1.50 each`. |
| `price` | DECIMAL(12,2) | NOT NULL | Current price. |
| `regular_price` | DECIMAL(12,2) | NULL | Original price if on sale. |
| `in_stock` | BOOLEAN | NOT NULL DEFAULT true | Availability. |
| `price_html` | TEXT | NOT NULL | Raw HTML from live site (optional for display). |
| `attributes` | JSONB | NOT NULL | Key-value (e.g. `{"select-quantity": "30 pills — ..."}`). Default `{}`. |
| `created_at` | TIMESTAMPTZ | NOT NULL | Default `NOW()`. |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Default `NOW()`, trigger-updated. |

**Constraints**

- `UNIQUE(product_id, variant_id)` so one variant_id per product.

**Indexes**

- `idx_catalog_variants_product_id` on `product_id`.

**Mapping from `CatalogVariant`**

- `id` (string from JSON) → stored as `variant_id`; row `id` is new UUID.
- All other fields map 1:1 to snake_case columns; `attributes` → JSONB.

---

### 3. `catalog_faqs`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key. Default `uuid_generate_v4()`. |
| `product_id` | UUID | NOT NULL | FK → `catalog_products(id)` ON DELETE CASCADE. |
| `question` | TEXT | NOT NULL | FAQ question. |
| `answer` | TEXT | NOT NULL | FAQ answer. |
| `sort_order` | INTEGER | NOT NULL DEFAULT 0 | Order on page. |
| `created_at` | TIMESTAMPTZ | NOT NULL | Default `NOW()`. |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Default `NOW()`, trigger-updated. |

**Indexes**

- `idx_catalog_faqs_product_id` on `product_id`.

**Mapping from `CatalogFaq`**

- `product.faqs[i]` → one row with `product_id`, `question`, `answer`, `sort_order = i`.

---

### 4. `catalog_import_meta` (optional)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key. Default `uuid_generate_v4()`. |
| `generated_at` | TIMESTAMPTZ | NOT NULL | When the import ran. |
| `source` | TEXT | NOT NULL | e.g. `https://noofox.com`. |
| `sitemap_url` | TEXT | NOT NULL | e.g. `https://noofox.com/product-sitemap.xml`. |
| `product_count` | INTEGER | NOT NULL | Number of products in that run. |
| `created_at` | TIMESTAMPTZ | NOT NULL | Default `NOW()`. |

Use this to track each run of the importer (e.g. from `scripts/import-live-noofox-catalog.mjs` or a future server-side job).

---

## Relationship to Existing Schema

- **`public.products`**: Left unchanged. Legacy simple product table; admin or other flows may still use it. No FK from catalog to `products`.
- **`public.orders`**: `items` remain JSONB. Each item has `product_id` (e.g. `slug::variantId`). Resolving for display: split on `::`, look up `catalog_products` by slug and `catalog_variants` by `variant_id` for that product.
- **No change** to `users` or order statuses.

---

## Row Level Security (RLS)

- **catalog_products**: `SELECT` for everyone (public catalog). `INSERT`/`UPDATE`/`DELETE` only for admins (same pattern as `products`).
- **catalog_variants**: Same as catalog_products.
- **catalog_faqs**: Same as catalog_products.
- **catalog_import_meta**: Admins only for all operations; or allow public `SELECT` for transparency.

---

## Application Usage (After Migration)

1. **getCatalogProducts()**  
   Query `catalog_products` (order by `updated_at` or `slug`), then for each product load `catalog_variants` and `catalog_faqs`, and assemble into `CatalogProduct` shape (or add a view/function that returns JSON in that shape).

2. **getCatalogProductBySlug(slug)**  
   `SELECT * FROM catalog_products WHERE slug = $1`; then load variants and FAQs for that `product_id`; build `CatalogProduct` (with `seo`, `structured_data`, `breadcrumbs`, `related_slugs` from columns/JSONB).

3. **getFeaturedCatalogProducts(limit)**  
   Same as getCatalogProducts with `ORDER BY created_at DESC` (or a dedicated `featured` flag later) and `LIMIT`.

4. **getRelatedCatalogProducts(product, limit)**  
   Use `product.related_slugs` (from DB); look up by slug and return up to `limit` products (with variants/FAQs if needed).

5. **Checkout / cart**  
   For each item with `product_id = "slug::variantId"`, resolve slug + variant_id from `catalog_products` + `catalog_variants` to get name, price, and any other needed fields.

---

## Migration Path

1. Apply `004_catalog_schema.sql` (creates tables, indexes, RLS, triggers).
2. Add a **seed script** or **one-off import** that reads `src/data/catalog.json` (or the output of the existing import script) and:
   - Inserts into `catalog_products` (generating UUIDs, mapping price_range → price_min/max, etc.).
   - Inserts into `catalog_variants` (with product_id = catalog_products.id, variant_id = original id string).
   - Inserts into `catalog_faqs` (with product_id, sort_order = index).
   - Optionally inserts one row into `catalog_import_meta`.
3. Switch `src/lib/catalog.ts` from reading JSON to calling Supabase (or a small API layer that returns the same `CatalogProduct`[] shape).
4. Optionally remove or archive `src/data/catalog.json` once the DB is the source of truth.

---

## TypeScript Types (Generated / Hand-Written)

After migration, you can:

- Keep `src/types/catalog.ts` as the **app contract** (CatalogProduct, CatalogVariant, etc.).
- Add **DB row types** (e.g. `CatalogProductRow`, `CatalogVariantRow`) that match the tables, and a small mapper: `rowToCatalogProduct(row, variants, faqs)` that returns `CatalogProduct`.

Supabase codegen can generate types from the new tables; align those with the existing catalog types in the data layer so the rest of the app (pages, components) stays unchanged.
