# Melon Business Dashboard

Melon sales & debt management with **Supabase Auth**, **Prisma** database, reports, exports, and team roles.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)

3. Open **Authentication → Providers → Email** and for easier testing:
   - Turn **off** “Confirm email” (optional; otherwise users must confirm email before login)

4. **Authentication → URL Configuration** add:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 2. Configure `.env`

Copy `.env.example` to `.env` and fill in your Supabase keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL="file:./dev.db"
```

## 3. Run the app

```bash
npm install
npx prisma db push
npm run dev
```

Open **http://localhost:3000**

> **Schema change?** If `prisma db push` fails after upgrading auth, reset local DB:
> `Remove-Item prisma/dev.db -Force` then `npx prisma db push`

### First account

- **Register** without invite code → **OWNER**
- **Workers** register with the invite code from **Reports → Team**

## Production database (optional)

Use Supabase Postgres for everything:

1. **Project Settings → Database** → copy connection string (Transaction pooler)
2. Set `DATABASE_URL` in `.env`
3. In `prisma/schema.prisma` change `provider` to `"postgresql"`
4. Run `npx prisma db push`

## Stack

- Next.js 15 · Tailwind · Prisma
- **Supabase Auth** (sessions & passwords)
- Prisma (customers, debt, history, roles)

**Powered by Aziz**
"# Melon"  "# Melon" 
"# Melon" 
