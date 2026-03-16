import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const SITE_URL = 'https://noofox.com';
const SITEMAP_URL = `${SITE_URL}/product-sitemap.xml`;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36';
const OUTPUT_PATH = resolve(process.cwd(), 'src/data/catalog.json');

function fetchText(url) {
  return execFileSync(
    'curl.exe',
    ['-L', '--max-time', '35', '-A', USER_AGENT, url],
    {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    }
  );
}

function decodeHtmlEntities(input) {
  if (!input) return '';

  const named = {
    amp: '&',
    quot: '"',
    apos: "'",
    lt: '<',
    gt: '>',
    nbsp: ' ',
    ndash: '-',
    mdash: '-',
    hellip: '...',
    rsquo: "'",
    lsquo: "'",
    rdquo: '"',
    ldquo: '"',
  };

  return input
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function stripTags(input) {
  return decodeHtmlEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function getFirstMatch(input, regex, group = 1) {
  const match = input.match(regex);
  return match?.[group] ?? null;
}

function getMetaTag(html, attribute, value) {
  const regex = new RegExp(
    `<meta[^>]+${attribute}=["']${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]+content=["']([^"']*)["'][^>]*>`,
    'i'
  );
  return decodeHtmlEntities(getFirstMatch(html, regex) ?? '');
}

function getCanonical(html) {
  return decodeHtmlEntities(
    getFirstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i) ?? ''
  );
}

function getTitle(html) {
  return decodeHtmlEntities(getFirstMatch(html, /<title>([\s\S]*?)<\/title>/i) ?? '');
}

function toRelativeUrl(url) {
  if (!url) return url;

  try {
    const parsed = new URL(url, SITE_URL);
    if (
      parsed.origin === SITE_URL ||
      parsed.origin === 'https://www.noofox.com' ||
      parsed.origin === 'https://noofoxxx.local' ||
      parsed.origin === 'http://noofoxxx.local'
    ) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return url;
  }

  return url;
}

function cleanImportedHtml(input) {
  return input
    .replace(/<img[\s\S]*?>/gi, '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<p>\s*(?:&nbsp;|\u00a0|\s)*<\/p>/gi, '')
    .replace(/<h2>\s*<\/h2>/gi, '')
    .replace(/<h3>\s*<\/h3>/gi, '')
    .replace(
      /href=["'](https?:\/\/(?:www\.)?noofox\.com|https?:\/\/noofoxxx\.local)([^"']*)["']/gi,
      (_match, _origin, path) => `href="${path || '/'}"`
    )
    .replace(/href=["']http:\/\/noofoxxx\.local([^"']*)["']/gi, (_match, path) => `href="${path || '/'}"`)
    .replace(/\s+rel=["'][^"']*noopener[^"']*["']/gi, '')
    .replace(/\s+target=["'][^"']*["']/gi, '')
    .trim();
}

function extractLocUrls(xml) {
  const urls = [];
  const regex = /<loc>([^<]+)<\/loc>/gi;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

function extractBreadcrumbs(html, currentUrl) {
  const block = getFirstMatch(html, /<nav class="woocommerce-breadcrumb"[\s\S]*?<\/nav>/i);
  if (!block) return [];

  const crumbs = [];
  const anchorRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let anchorMatch;

  while ((anchorMatch = anchorRegex.exec(block)) !== null) {
    crumbs.push({
      name: stripTags(anchorMatch[2]),
      href: toRelativeUrl(anchorMatch[1]),
    });
  }

  const finalMatch = block.match(/<\/a>&nbsp;&#47;&nbsp;([^<]+)<\/nav>/i);
  if (finalMatch) {
    crumbs.push({
      name: stripTags(finalMatch[1]),
      href: new URL(currentUrl).pathname,
    });
  }

  return crumbs;
}

function extractVariants(html) {
  const encoded = getFirstMatch(html, /data-product_variations="([^"]+)"/i);
  if (!encoded) return [];

  const decoded = decodeHtmlEntities(encoded);
  const parsed = JSON.parse(decoded);

  return parsed.map((variant, index) => {
    const attributeEntries = Object.entries(variant.attributes ?? {});
    const label = decodeHtmlEntities(String(attributeEntries[0]?.[1] ?? `Option ${index + 1}`));
    const variationId = String(variant.variation_id ?? `${index + 1}`);
    const sku = variant.sku ? String(variant.sku) : null;
    const price = Number(variant.display_price ?? 0);
    const regularPrice = Number(variant.display_regular_price ?? 0);
    const perUnitText = getFirstMatch(label, /\(([^)]+)\)/);
    const quantityText = label.split(' - ')[0].split(' — ')[0].trim();

    return {
      id: variationId,
      sku,
      label,
      quantityText,
      perUnitText: perUnitText ? stripTags(perUnitText) : null,
      price,
      regularPrice: regularPrice > price ? regularPrice : null,
      inStock: Boolean(variant.is_in_stock),
      priceHtml: cleanImportedHtml(decodeHtmlEntities(String(variant.price_html ?? ''))),
      attributes: Object.fromEntries(
        attributeEntries.map(([key, value]) => [
          key.replace(/^attribute_/, ''),
          decodeHtmlEntities(String(value)),
        ])
      ),
    };
  });
}

function extractStructuredData(html) {
  const scripts = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const text = match[1].trim();
    if (!text) continue;
    try {
      scripts.push(JSON.parse(text));
    } catch {
      // Keep import resilient if a schema block is malformed.
    }
  }

  return scripts;
}

function walkStructuredData(input, visit) {
  if (!input) return;
  if (Array.isArray(input)) {
    input.forEach((item) => walkStructuredData(item, visit));
    return;
  }
  if (typeof input !== 'object') return;

  visit(input);

  for (const value of Object.values(input)) {
    if (value && typeof value === 'object') {
      walkStructuredData(value, visit);
    }
  }
}

function extractFaqs(structuredData) {
  const faqs = [];

  walkStructuredData(structuredData, (node) => {
    const type = node['@type'];
    const types = Array.isArray(type) ? type : [type];
    if (!types.includes('FAQPage')) return;

    for (const entity of node.mainEntity ?? []) {
      if (!entity?.name || !entity?.acceptedAnswer?.text) continue;
      faqs.push({
        question: stripTags(String(entity.name)),
        answer: stripTags(String(entity.acceptedAnswer.text)),
      });
    }
  });

  return faqs;
}

function extractAggregateRating(structuredData) {
  let aggregate = null;

  walkStructuredData(structuredData, (node) => {
    const type = node['@type'];
    const types = Array.isArray(type) ? type : [type];
    if (!types.includes('Product') || !node.aggregateRating) return;

    aggregate = {
      ratingValue: Number(node.aggregateRating.ratingValue ?? 0) || null,
      reviewCount: Number(node.aggregateRating.reviewCount ?? 0) || 0,
    };
  });

  return aggregate;
}

function extractRelatedSlugs(html) {
  const block = getFirstMatch(
    html,
    /<section class="related products">([\s\S]*?)<\/section>/i
  );
  if (!block) return [];

  const slugs = [];
  const regex = /href="https?:\/\/(?:www\.)?noofox\.com\/([^/"?#]+)\/"/gi;
  let match;
  while ((match = regex.exec(block)) !== null) {
    slugs.push(match[1]);
  }

  return [...new Set(slugs)];
}

function extractDescriptionHtml(html) {
  const block = getFirstMatch(
    html,
    /<div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--description panel entry-content wc-tab" id="tab-description"[\s\S]*?>([\s\S]*?)<\/div>\s*<div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--reviews/i
  );
  return cleanImportedHtml(block ?? '');
}

function extractShortDescriptionHtml(html) {
  const block = getFirstMatch(
    html,
    /<div class="woocommerce-product-details__short-description">([\s\S]*?)<\/div>\s*<form class="variations_form cart"/i
  );
  return cleanImportedHtml(block ?? '');
}

function extractReviewSummary(html, structuredData) {
  const aggregate = extractAggregateRating(structuredData);
  const countText = getFirstMatch(html, /<h2 class="woocommerce-Reviews-title">\s*([\d]+) reviews for/i);
  const reviewCount = aggregate?.reviewCount ?? Number(countText ?? 0) ?? 0;

  return {
    averageRating: aggregate?.ratingValue ?? null,
    reviewCount,
  };
}

function extractCategory(breadcrumbs) {
  return breadcrumbs.length >= 2 ? breadcrumbs[1].name : null;
}

function getPriceRange(variants) {
  if (!variants.length) return { min: 0, max: 0 };
  const prices = variants.map((variant) => variant.price).filter((value) => Number.isFinite(value));
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

function extractProduct(url) {
  const html = fetchText(url);
  const path = new URL(url).pathname;
  const slug = path.replace(/^\/|\/$/g, '');
  const structuredData = extractStructuredData(html);
  const variants = extractVariants(html);
  const breadcrumbs = extractBreadcrumbs(html, url);
  const priceRange = getPriceRange(variants);
  const descriptionHtml = extractDescriptionHtml(html);
  const shortDescriptionHtml = extractShortDescriptionHtml(html);
  const reviewSummary = extractReviewSummary(html, structuredData);
  const faqs = extractFaqs(structuredData);

  return {
    id: slug,
    slug,
    urlPath: path,
    sourceUrl: url,
    name: stripTags(getFirstMatch(html, /<h1 class="product_title entry-title">([\s\S]*?)<\/h1>/i) ?? ''),
    title: getTitle(html),
    priceText: stripTags(getFirstMatch(html, /<p class="price">([\s\S]*?)<\/p>/i) ?? ''),
    priceRange,
    category: extractCategory(breadcrumbs),
    breadcrumbs,
    shortDescriptionHtml,
    shortDescriptionText: stripTags(shortDescriptionHtml),
    descriptionHtml,
    descriptionText: stripTags(descriptionHtml),
    variants,
    reviewSummary,
    relatedSlugs: extractRelatedSlugs(html),
    faqs,
    seo: {
      title: getTitle(html),
      description: getMetaTag(html, 'name', 'description'),
      canonical: getCanonical(html),
      robots: getMetaTag(html, 'name', 'robots'),
      openGraph: {
        type: getMetaTag(html, 'property', 'og:type'),
        title: getMetaTag(html, 'property', 'og:title'),
        description: getMetaTag(html, 'property', 'og:description'),
        url: getMetaTag(html, 'property', 'og:url'),
        siteName: getMetaTag(html, 'property', 'og:site_name'),
        updatedTime: getMetaTag(html, 'property', 'og:updated_time'),
        imageAlt: getMetaTag(html, 'property', 'og:image:alt'),
      },
      twitter: {
        card: getMetaTag(html, 'name', 'twitter:card'),
        title: getMetaTag(html, 'name', 'twitter:title'),
        description: getMetaTag(html, 'name', 'twitter:description'),
        creator: getMetaTag(html, 'name', 'twitter:creator'),
        label1: getMetaTag(html, 'name', 'twitter:label1'),
        data1: decodeHtmlEntities(getMetaTag(html, 'name', 'twitter:data1')),
        label2: getMetaTag(html, 'name', 'twitter:label2'),
        data2: decodeHtmlEntities(getMetaTag(html, 'name', 'twitter:data2')),
      },
    },
    structuredData,
  };
}

function main() {
  console.log(`Fetching sitemap: ${SITEMAP_URL}`);
  const sitemapXml = fetchText(SITEMAP_URL);
  const urls = extractLocUrls(sitemapXml).filter((url) => {
    const path = new URL(url).pathname;
    return path !== '/shop/';
  });

  console.log(`Found ${urls.length} product URLs.`);

  const products = urls.map((url, index) => {
    console.log(`[${index + 1}/${urls.length}] Importing ${url}`);
    return extractProduct(url);
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    source: SITE_URL,
    sitemapUrl: SITEMAP_URL,
    productCount: products.length,
    products,
  };

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main();
