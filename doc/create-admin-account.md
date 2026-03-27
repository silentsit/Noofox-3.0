# Create an admin login (GrabModa)

Supabase Auth uses a **valid email** for sign-in. The local-part can match your chosen name (e.g. `grabmoda@grabmoda.com`).

## Option A — Script (needs real service role key)

1. In Supabase Dashboard → **Project Settings** → **API**, copy the **`service_role`** secret (long JWT).  
   It must **not** be the anon key or any `sb_publishable_…` key.
2. Put it in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY=…`
3. Run (PowerShell):

```powershell
$env:ADMIN_EMAIL="grabmoda@grabmoda.com"
$env:ADMIN_PASSWORD='(your secure password)'
npm run admin:create
```

## Option B — Dashboard + SQL

1. **Authentication** → **Users** → **Add user** → set email and password, confirm email if prompted.
2. **SQL Editor** → run:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'grabmoda@grabmoda.com';

INSERT INTO public.user_admin_roles (user_id, role_key)
SELECT id, 'super_admin'
FROM public.users
WHERE email = 'grabmoda@grabmoda.com'
ON CONFLICT (user_id, role_key) DO NOTHING;
```

If `public.users` has no row yet, sign out/in once or run reconciliation; the trigger normally inserts on signup.

3. Sign in at `/login`, then open `/admin`.
