# Restore notes (LocalWP noofoxxx → legacy data)

Use this when restoring or recreating the WordPress site from legacy-wp-data.

## LocalWP site

- **Site name:** noofoxxx
- **Local URL:** https://noofoxxx.local
- **Ports (from netstat):** 10003 (HTTP), 10004 (HTTPS), 10005 (DB)

## Admin

- **Admin username:** _(fill in; do not store password here)_

## Live URL (tunnel)

- **Public URL:** https://noofox.com
- **Tunnel:** Cloudflare Tunnel **localwp-noofox** → Service URL `http://127.0.0.1:10003` (or HTTPS `https://127.0.0.1:10004` with No TLS Verify).

## Gotchas

- **Redirect flips:** WordPress can flip between noofox.com and .local if `WP_HOME` / `WP_SITEURL` in `wp-config.php` are wrong. For live traffic, keep both set to `https://noofox.com`. For local-only work you can point to `https://noofoxxx.local`.
- **wp-config.php:** Use quoted values: `define( 'WP_HOME', 'https://noofox.com' );` (no quotes = PHP parse error).

## Exports

- URL lists (pages/products) go in `legacy-wp-data/exports/`. Generate them from the WP root using WP-CLI: see **legacy-wp-data/exports/README.md** for the exact commands. Run those from Local’s **Open site shell** (or any terminal where `wp` works).
