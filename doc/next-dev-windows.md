# Next.js dev on Windows — “layout looks broken”

## What is actually happening

Backend or API edits do not change Tailwind/CSS by themselves. What you usually see is:

1. **Missing CSS/JS** because the browser loaded HTML that references chunk URLs that no longer exist under `.next` (stale or partial build).
2. **Webpack chunk errors** in the overlay, e.g. `Cannot find module './8948.js'`.

That produces an **unstyled** or half-broken page, which looks like “layout distortion.”

Common triggers:

- **More than one** `next dev` running (different ports, old process still alive).
- **Interrupted** dev server or IDE stopping mid-compile.
- **Rapid saves** while HMR is rebuilding (occasionally leaves `.next` inconsistent on Windows).

## What we configured in this repo

- **`next dev --turbo`** (default `npm run dev`): uses Turbopack in dev, avoiding webpack’s dev chunk pipeline.
- **Webpack `cache: false`** in `next.config.mjs`: applies to **`next build`** (production compiler); reduces persistent cache desync on Windows.
- **`npm run dev:clean`**: deletes `.next` and `node_modules/.cache`, then starts dev — use when chunk errors return.
- **`npm run dev:webpack`**: fallback if you ever need the webpack dev server.

## Operational rules

1. Run **only one** dev server at a time.
2. After weird chunk errors: stop Node, run **`npm run dev:clean`**, hard refresh the browser (`Ctrl+F5`).
