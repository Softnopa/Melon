# Vercel Deployment Checklist

## Pre-Deployment Checklist

- [ ] **GitHub Repository**
  - [ ] Code is pushed to GitHub
  - [ ] `.env.local` and `.env` are in `.gitignore` (never commit secrets)
  - [ ] Latest code is in main/master branch

- [ ] **Supabase Setup**
  - [ ] Supabase project created at https://supabase.com
  - [ ] PostgreSQL database is active
  - [ ] Connection Pooler enabled
  - [ ] API keys copied (anon + service role)

- [ ] **Vercel Setup**
  - [ ] Vercel account created at https://vercel.com
  - [ ] GitHub repository is connected
  - [ ] All environment variables added in Settings → Environment Variables

## Environment Variables to Add in Vercel

Go to **Project Settings → Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL = https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGci...
DATABASE_URL = postgresql://...
```

Select all environments (Production, Preview, Development).

## Deployment Steps

1. **Connect Repository**
   - In Vercel: New Project → Import GitHub Repo
   - Select your repository
   - Framework: Next.js (auto-detected)

2. **Configure Environment**
   - Vercel auto-detects Next.js settings
   - Ensure build command is: `npm run build`
   - Ensure output directory is: `.next`
   - Add environment variables (see above)

3. **Deploy**
   - Click "Deploy"
   - Monitor build logs for errors
   - Check Vercel Analytics after deployment

4. **Post-Deployment**
   - Visit your deployment URL
   - Test all features
   - Check database connectivity
   - Monitor logs for errors

## Troubleshooting

### Build Failed: "DATABASE_URL is not set"
**Solution:** Add DATABASE_URL to Vercel Environment Variables → Production

### Build Failed: Prisma Generate Error
**Solution:** 
- Ensure DATABASE_URL is correct in Vercel
- Check Supabase PostgreSQL is running
- Try redeploying

### Database Connection Timeouts
**Solution:**
- Use Connection Pooler URL (not direct connection)
- Add `?pgbouncer=true` to DATABASE_URL
- Check Supabase firewall settings

### App Loads But API Calls Fail
**Solution:**
- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Check Supabase RLS policies

## Monitoring & Maintenance

- [ ] Set up Vercel Analytics
- [ ] Configure error tracking
- [ ] Set up database backups in Supabase
- [ ] Monitor build times
- [ ] Review function execution logs

## Useful Links

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
