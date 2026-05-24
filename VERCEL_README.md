# 🚀 Melon Business - Vercel + Supabase Deployment Guide

## Quick Start (5 minutes)

### 1. Prepare Your Environment

```bash
# Copy environment template
cp .env.example .env.local

# Fill in your Supabase credentials
# Get from: https://supabase.com/dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.[ref]:password@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 3. Deploy to Vercel

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Choose your GitHub repo
4. Vercel auto-detects Next.js ✓
5. Add Environment Variables (see Step 4)
6. Click "Deploy"

### 4. Add Environment Variables in Vercel

**Dashboard → Settings → Environment Variables**

| Variable | Value |
|----------|-------|
| NEXT_PUBLIC_SUPABASE_URL | `https://YOUR_PROJECT.supabase.co` |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | From Supabase Settings → API |
| SUPABASE_SERVICE_ROLE_KEY | From Supabase Settings → API |
| DATABASE_URL | From Supabase Settings → Database → Connection Pooler |

**Select:** Production, Preview, Development (all three)

---

## Detailed Setup Guide

### Getting Supabase Credentials

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Go to Supabase Dashboard → Settings → API
   - Copy "Project URL"

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Same page → Copy "anon public" key

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Same page → Copy "service_role secret" key
   - ⚠️ Keep this SECRET - never share!

4. **DATABASE_URL** (Production)
   - Go to Supabase → Settings → Database
   - Click "Connection Pooler"
   - Copy the PostgreSQL connection string
   - Replace `[YOUR-PASSWORD]` with your database password
   - Format: `postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`

### Project Structure

```
melon-business/
├── src/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Auth pages
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/
│   │   └── supabase/       # Supabase client setup
│   └── middleware.ts       # Auth middleware
├── prisma/
│   └── schema.prisma       # Database schema (PostgreSQL)
├── next.config.ts          # Next.js config (optimized)
├── vercel.json             # Vercel deployment config
├── .env.example            # Environment template
└── VERCEL_DEPLOYMENT.md    # This guide
```

### Build Scripts

- `npm run dev` - Development server (uses local SQLite)
- `npm run dev:setup` - Push DB schema + start dev
- `npm run build` - Production build (Prisma generate + Next.js build)
- `npm start` - Production server
- `npm run db:push` - Sync database schema with Supabase

---

## Production Setup Checklist

- [ ] **Database Configured**
  - [ ] Supabase PostgreSQL created
  - [ ] Connection Pooler enabled
  - [ ] Database credentials secured

- [ ] **Environment Variables**
  - [ ] All 4 vars added to Vercel
  - [ ] Applied to all environments
  - [ ] Secrets stored securely (never in code)

- [ ] **Code Ready**
  - [ ] Latest code pushed to GitHub
  - [ ] `.env.local` in `.gitignore`
  - [ ] No console errors in dev build

- [ ] **Deployment**
  - [ ] GitHub repo connected to Vercel
  - [ ] Automatic builds enabled
  - [ ] First deployment successful

- [ ] **Testing**
  - [ ] Visit deployment URL
  - [ ] Test API endpoints
  - [ ] Check database connectivity
  - [ ] Verify auth flows

---

## Common Issues & Solutions

### ❌ Build Error: "DATABASE_URL is not set"
**✅ Solution:** Add `DATABASE_URL` in Vercel Environment Variables → Production

### ❌ Build Error: "Prisma generate failed"
**✅ Solution:** 
- Ensure `DATABASE_URL` is correct
- Check Supabase PostgreSQL is running
- Verify connection string format

### ❌ App works but API fails
**✅ Solution:**
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check Supabase RLS policies allow your calls

### ❌ Slow database queries
**✅ Solution:**
- Use Connection Pooler (not direct connection)
- Ensure `?pgbouncer=true` is in DATABASE_URL
- Index frequently queried columns

---

## Monitoring & Optimization

### Monitor Your Deployment
- **Vercel Dashboard:** View logs, analytics, deployment history
- **Supabase Dashboard:** Check database activity, logs, usage
- **Next.js Analytics:** Monitor Core Web Vitals

### Performance Tips
- Enable Vercel Analytics for real user metrics
- Use Supabase Vector for semantic search
- Set up CDN caching headers
- Monitor function duration (Vercel limits: 60s)

---

## Next Steps After Deployment

1. ✅ **Test thoroughly**
   - All features working?
   - Database queries fast?
   - Auth flows secure?

2. ✅ **Set up backups**
   - Enable Supabase automated backups
   - Test backup restore process

3. ✅ **Monitor performance**
   - Watch Vercel Analytics
   - Monitor database metrics
   - Track error rates

4. ✅ **Keep secure**
   - Rotate API keys periodically
   - Update dependencies regularly
   - Review Supabase security settings

---

## Useful Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)

---

## Need Help?

1. Check the **DEPLOYMENT_CHECKLIST.md** for a quick reference
2. Review **Vercel Deployment** tab in your project
3. Check **Supabase Logs** for database issues
4. Visit [Vercel Community](https://vercel.com/support)

---

**🎉 You're ready to deploy! Good luck!**
