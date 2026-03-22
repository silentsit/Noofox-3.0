/**
 * Seed catalog_products, catalog_variants, catalog_faqs from src/data/catalog.json.
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and migrations 004 + 006 applied.
 *
 * Usage: node scripts/seed-catalog-from-json.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalogPath = resolve(__dirname, '../src/data/catalog.json');

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const products = catalog.products ?? [];

const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  console.log(`Seeding ${products.length} products...`);

  for (const p of products) {
    const { data: row, error: insertError } = await supabase
      .from('catalog_products')
      .insert({
        slug: p.slug,
        url_path: p.urlPath,
        source_url: p.sourceUrl ?? null,
        name: p.name,
        title: p.title,
        price_text: p.priceText,
        price_min: p.priceRange?.min ?? 0,
        price_max: p.priceRange?.max ?? 0,
        category: p.category ?? null,
        breadcrumbs: p.breadcrumbs ?? [],
        short_description_html: p.shortDescriptionHtml ?? '',
        short_description_text: p.shortDescriptionText ?? '',
        description_html: p.descriptionHtml ?? '',
        description_text: p.descriptionText ?? '',
        review_average_rating: p.reviewSummary?.averageRating ?? null,
        review_count: p.reviewSummary?.reviewCount ?? 0,
        related_slugs: p.relatedSlugs ?? [],
        seo: p.seo ?? {},
        structured_data: p.structuredData ?? [],
        images: p.images ?? [],
      })
      .select('id')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        const { data: existing } = await supabase.from('catalog_products').select('id').eq('slug', p.slug).single();
        if (existing) {
          await supabase.from('catalog_products').update({
            name: p.name,
            title: p.title,
            price_text: p.priceText,
            price_min: p.priceRange?.min ?? 0,
            price_max: p.priceRange?.max ?? 0,
            category: p.category ?? null,
            breadcrumbs: p.breadcrumbs ?? [],
            short_description_html: p.shortDescriptionHtml ?? '',
            short_description_text: p.shortDescriptionText ?? '',
            description_html: p.descriptionHtml ?? '',
            description_text: p.descriptionText ?? '',
            review_average_rating: p.reviewSummary?.averageRating ?? null,
            review_count: p.reviewSummary?.reviewCount ?? 0,
            related_slugs: p.relatedSlugs ?? [],
            seo: p.seo ?? {},
            structured_data: p.structuredData ?? [],
            images: p.images ?? [],
          }).eq('id', existing.id);
          await supabase.from('catalog_faqs').delete().eq('product_id', existing.id);
          await insertVariantsAndFaqs(existing.id, p);
          console.log(`  Updated: ${p.slug}`);
        }
        continue;
      }
      console.error(`  Error inserting ${p.slug}:`, insertError.message);
      continue;
    }

    const productId = row.id;
    await insertVariantsAndFaqs(productId, p);
    console.log(`  OK: ${p.slug}`);
  }

  if (catalog.generatedAt) {
    await supabase.from('catalog_import_meta').insert({
      generated_at: catalog.generatedAt,
      source: catalog.source ?? 'https://grabmoda.com',
      sitemap_url: catalog.sitemapUrl ?? 'https://grabmoda.com/product-sitemap.xml',
      product_count: products.length,
    });
  }
  console.log('Done.');
}

async function insertVariantsAndFaqs(productId, p) {
  const variants = p.variants ?? [];
  for (const v of variants) {
    await supabase.from('catalog_variants').upsert(
      {
        product_id: productId,
        variant_id: String(v.id),
        sku: v.sku ?? null,
        label: v.label,
        quantity_text: v.quantityText,
        per_unit_text: v.perUnitText ?? null,
        price: v.price,
        regular_price: v.regularPrice ?? null,
        in_stock: v.inStock ?? true,
        price_html: v.priceHtml ?? '',
        attributes: v.attributes ?? {},
      },
      { onConflict: 'product_id,variant_id' }
    );
  }

  const faqs = p.faqs ?? [];
  for (let i = 0; i < faqs.length; i++) {
    await supabase.from('catalog_faqs').insert({
      product_id: productId,
      question: faqs[i].question,
      answer: faqs[i].answer,
      sort_order: i,
    });
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
