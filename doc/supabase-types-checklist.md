# Supabase TypeScript types — post-regeneration checklist

This project does **not** use Prisma. The database is defined in `supabase/migrations/*.sql` and applied to Supabase. TypeScript types live in `src/types/supabase.ts`, usually generated with:

```bash
npm run gen:types
```

(`supabase gen types typescript --linked > src/types/supabase.ts`)

## After every `gen:types` run

1. **Table coverage**  
   Compare `Database['public']['Tables']` keys to every table you expect from migrations. If you added a migration with a new `CREATE TABLE`, the new table name must appear under `Tables`.

2. **Critical columns**  
   Spot-check high-churn tables (especially `orders`) against the latest migration (e.g. `012_order_operations.sql`, coupon columns): subtotals, discounts, `coupon_code`, payment/attribution/crypto fields, timestamps.

3. **RPC / `Functions` block**  
   Confirm every `supabase.rpc('...')` call has a matching entry under `Database['public']['Functions']` with correct `Args` names and types.

4. **Re-merge manual refinements**  
   Plain generator output often uses `string` where we want stricter unions. Restore these in `src/types/supabase.ts` after each regen:

   - `OrderStatus` type and `orders` `status` fields using `OrderStatus` (not plain `string`).
   - `users` `role` as `'admin' | 'customer'`.
   - `coupons` `discount_type` as `'percentage' | 'fixed'` (if you keep strict typing).

5. **Downstream types**  
   Run `npx tsc --noEmit`. Fix `src/types/database.ts` and any imports if `Row` shapes changed.

6. **Reference files**  
   Root `supabase_schema.sql` (if present) is a snapshot only — migrations + linked Supabase are authoritative.

## Optional verification

- Grep for `.rpc(` in `src/` and cross-check function names against `Functions`.
- Compare generator output to `information_schema.columns` in Supabase SQL editor if something looks wrong.
