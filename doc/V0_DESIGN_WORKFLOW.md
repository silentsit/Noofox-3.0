# v0 Design Workflow

Use **v0.dev** to generate UI, then integrate into this codebase:

1. **Generate** — Use v0.dev to design components or full page layouts (prompt with your requirements).
2. **Copy** — Paste the generated code into `src/components/` or the relevant `src/app/...` page/layout.
3. **Align** — Keep **Tailwind** classes and **`@/`** path aliases as-is so imports resolve (e.g. `@/components/...`, `@/lib/...`).
4. **Dependencies** — If v0 output uses packages not yet in the project, add them with `npm install <package>`.

No other workflow changes required; the app already uses Tailwind and the `@/` alias.
