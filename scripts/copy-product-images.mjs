/**
 * Copy ALL product images from Noofox-Images into public/product-images/
 * (multiple images per product, excluding .psd). Updates catalog.json with images arrays.
 *
 * Noofox-Images is expected at ./Noofox-Images (project root) or ../Noofox-Images (sibling).
 *
 * Usage: node scripts/copy-product-images.mjs
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const noofoxImagesRoot = existsSync(resolve(projectRoot, 'Noofox-Images'))
  ? resolve(projectRoot, 'Noofox-Images')
  : resolve(projectRoot, '..', 'Noofox-Images');
const publicImagesDir = resolve(projectRoot, 'public', 'product-images');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/** slug -> folder name inside Noofox-Images (all images in that folder will be used) */
const SLUG_TO_FOLDER = {
  'buy-artvigil-150-mg': 'Artvigil 150mg',
  'buy-artvigil-250-mg': 'Artvigil 150mg',
  'buy-armodaxl-250-mg': 'ArmodaXL',
  'buy-armodaxl-150-mg': 'ArmodaXL',
  'buy-modalert-200-mg': 'Modalert 200mg',
  'buy-modawake-200-mg': 'Modawake 200mg',
  'buy-modaheal-200-mg': 'Modaheal 200mg',
  'buy-modvigil-200-mg': 'Modvigil 200mg',
  'buy-vilafinil-200-mg': 'Vilafinil 200mg',
  'buy-waklert-150-mg': 'Waklert 150mg',
};

/** Sort filenames: "buy-*" and main product names first, then alphabetically */
function sortImageFiles(files) {
  return [...files].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const aBuy = aLower.startsWith('buy') ? 0 : 1;
    const bBuy = bLower.startsWith('buy') ? 0 : 1;
    if (aBuy !== bBuy) return aBuy - bBuy;
    return aLower.localeCompare(bLower);
  });
}

function main() {
  const slugToImages = {}; // slug -> [path, path, ...]

  if (!existsSync(noofoxImagesRoot)) {
    console.warn(`Noofox-Images not found at ${noofoxImagesRoot}. Skipping copy.`);
  } else {
    mkdirSync(publicImagesDir, { recursive: true });

    for (const [slug, folderName] of Object.entries(SLUG_TO_FOLDER)) {
      const folderPath = resolve(noofoxImagesRoot, folderName);
      if (!existsSync(folderPath)) {
        console.warn(`Missing folder: ${folderPath}`);
        continue;
      }
      const files = readdirSync(folderPath).filter((f) => {
        const ext = extname(f).toLowerCase();
        return IMAGE_EXT.has(ext);
      });
      const sorted = sortImageFiles(files);
      const paths = [];
      for (let i = 0; i < sorted.length; i++) {
        const file = sorted[i];
        const ext = extname(file).toLowerCase();
        const src = resolve(folderPath, file);
        const destName = `${slug}-${i}${ext}`;
        const dest = resolve(publicImagesDir, destName);
        copyFileSync(src, dest);
        paths.push(`/product-images/${destName}`);
      }
      if (paths.length) {
        slugToImages[slug] = paths;
        console.log(`${slug}: ${paths.length} image(s)`);
      }
    }
  }

  const catalogPath = resolve(projectRoot, 'src', 'data', 'catalog.json');
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const products = catalog.products ?? [];

  for (const p of products) {
    const slug = p.slug;
    if (slug && slugToImages[slug]) {
      p.images = slugToImages[slug];
    } else if (!Array.isArray(p.images)) {
      p.images = [];
    }
  }

  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  console.log('Updated catalog.json with images arrays.');
}

main();
