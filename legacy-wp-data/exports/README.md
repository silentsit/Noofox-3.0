# URL list exports (WP-CLI)

Generate these from your **WordPress root** (Local site: `C:\Users\daryl\Local Sites\noofoxxx\app\public`) when the site is running. Use Local’s **Open site shell** or a terminal with `wp` in PATH.

## Commands (run from WP root)

```bash
# Pages (post_name = slug)
wp post list --post_type=page --field=post_name --format=csv > "C:\Users\daryl\Downloads\Noofox 3.0\legacy-wp-data\exports\url-list-pages.csv"

# Products (post_name = slug)
wp post list --post_type=product --field=post_name --format=csv > "C:\Users\daryl\Downloads\Noofox 3.0\legacy-wp-data\exports\url-list-products.csv"

# Optional: GUID reference (not always the real permalink)
wp post list --post_type=page --field=guid --format=csv > "C:\Users\daryl\Downloads\Noofox 3.0\legacy-wp-data\exports\url-list-pages-guid.csv"
wp post list --post_type=product --field=guid --format=csv > "C:\Users\daryl\Downloads\Noofox 3.0\legacy-wp-data\exports\url-list-products-guid.csv"
```

If `product` isn’t a registered post type, use the correct type (e.g. `wp post list --post_type=post` for posts).
