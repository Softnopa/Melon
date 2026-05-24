# Vercel Deployment Setup Guide

This guide will help you deploy the Melon Business app to Vercel with Supabase PostgreSQL.

## Prerequisites
- Vercel Account: https://vercel.com
- Supabase Project: https://supabase.com/dashboard
- GitHub account (to connect repo)

## Step 1: Set Up Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables (get values from Supabase):

| Variable | Value | From Where |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Supabase Dashboard → Settings → API |
| `DATABASE_URL` | PostgreSQL connection string | Supabase Dashboard → Project → Database → Connection Pooler |

### Getting Supabase Connection String:
- Go to **Supabase Dashboard** → **Your Project** → **Settings** → **Database**
- Click **Connection Pooler** (for production)
- Copy the connection string
- Replace `[YOUR-PASSWORD]` with your actual database password
- URL format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`

## Step 2: Deploy

### Option A: Connect GitHub (Recommended)
1. Push your code to GitHub
2. Go to **Vercel Dashboard** → **Add New** → **Project**
3. Select your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click **Deploy**

### Option B: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

## Step 3: Verify Deployment

After deployment:
1. Check Vercel logs for any build errors
2. Visit your deployment URL
3. Verify database connection works (test API calls)

## Project Structure
```
├── src/
│   ├── app/              # Next.js 15 app router
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   └── middleware.ts    # Auth middleware
├── prisma/
│   └── schema.prisma    # Database schema
├── next.config.ts       # Next.js config (optimized for Vercel)
├── vercel.json          # Vercel deployment config
└── .env.production      # Production env template
```

## Build & Start Commands

- **Build**: `npm run build` (runs Prisma generate + Next.js build)
- **Start**: `npm start` (production server)
- **Dev**: `npm run dev` (local development)

## Troubleshooting

### Build Fails with Prisma Errors
- Ensure `DATABASE_URL` is set correctly in Vercel
- Check that Supabase PostgreSQL is running
- Verify Prisma schema is valid: `prisma validate`

### Database Connection Issues
- Test connection: Use Supabase Query Editor
- Check pgbouncer is enabled in connection string
- Verify all environment variables are set

### Type Errors
- Run `prisma generate` locally before deploying
- Clear `.next` folder: `rm -rf .next`
- Redeploy

## Next Steps
1. Set up environment variables in Vercel
2. Connect your GitHub repository
3. Deploy and monitor logs
4. Test your application
