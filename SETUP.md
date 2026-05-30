# KAVACH AI — SETUP & DEPLOYMENT GUIDE

## 1. Apply the Fixed Files

Copy the fixed files from this package into your project, replacing the originals:

```
package.json                           → project root
src/middleware.ts                      → replace original
src/lib/auth-context.tsx               → replace original
src/app/login/page.tsx                 → replace original
src/app/signup/page.tsx                → replace original
src/app/dashboard/page.tsx             → replace original
src/app/history/page.tsx               → replace original
src/app/api/analyze/route.ts           → replace original
supabase-schema.sql                    → replace original (run in Supabase)
```

## 2. Install Dependencies

```bash
npm install
```

This installs `@supabase/ssr` (new) and removes `@supabase/auth-helpers-nextjs` (removed from package.json).

## 3. Environment Variables

Create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Never commit `.env.local` to git.**

## 4. Run the Database Schema

1. Go to Supabase Dashboard → SQL Editor → New Query
2. Paste the contents of `supabase-schema.sql`
3. Click Run
4. Verify: both tables and all policies should be created

## 5. Configure Supabase Auth

In Supabase Dashboard → Authentication → Settings:

- **Site URL**: `http://localhost:3000` (dev) or your production domain
- **Redirect URLs**: Add `http://localhost:3000/**` and `https://yourdomain.com/**`
- **Email confirmations**: Toggle based on your preference
  - OFF = instant login after signup (easier for dev)
  - ON = secure production flow

## 6. Start Development

```bash
npm run dev
```

Navigate to `http://localhost:3000`

## 7. Production Build Test

```bash
npm run build
npm start
```

Should complete with zero errors.

## 8. Deploy to Vercel

```bash
# Set environment variables in Vercel Dashboard → Settings → Environment Variables:
# GEMINI_API_KEY
# NEXT_PUBLIC_SUPABASE_URL  
# NEXT_PUBLIC_SUPABASE_ANON_KEY

vercel --prod
```

---

## Key Changes Summary

| File | Change | Bug Fixed |
|------|--------|-----------|
| `package.json` | Added `@supabase/ssr`, removed `@supabase/auth-helpers-nextjs` | BUG-001 |
| `middleware.ts` | Complete rewrite using `@supabase/ssr` + added `/analyze` to protected routes | BUG-001, BUG-005 |
| `auth-context.tsx` | Use `INITIAL_SESSION` event for reliable loading state | BUG-003 |
| `login/page.tsx` | Handle `?redirect=` query param | BUG-011 |
| `signup/page.tsx` | Remove duplicate profile upsert (DB trigger handles it) | BUG-007 |
| `dashboard/page.tsx` | Add auth redirect guard + loading state | BUG-004 |
| `history/page.tsx` | Add auth redirect guard + loading state | BUG-004 |
| `api/analyze/route.ts` | Add 20,000 char content length cap | BUG-016 |
| `supabase-schema.sql` | Add `updated_at` to profiles, cleanup | Database improvement |
