# KidsBite — Setup Guide

## 1. Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Go to Settings → API and copy your **Project URL** and **anon public key**

## 2. Set Environment Variables
Create `.env.local` in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=your-openai-api-key
```

## 3. Run Database Schema
In Supabase Dashboard → SQL Editor, run `supabase/schema.sql`

For existing projects created before mom support, also run:
- `supabase/add-mom-age-group.sql`

## 4. Seed Food Database
In Supabase Dashboard → SQL Editor, run `data/foods-seed.sql`

If adding custom foods fails with an RLS error, run:
- `supabase/rls-foods-insert.sql`

## 5. Configure Auth Providers
In Supabase Dashboard → Authentication → Providers:
- **Email**: Enable passwordless email OTP/code login
- **Google** (optional): Add OAuth credentials from Google Cloud Console

Set Auth redirect URL: `https://your-app.vercel.app/auth/callback`
For local dev: `http://localhost:3000/auth/callback`

## 6. Run Locally
```bash
npm install
npm run dev
```

Open http://localhost:3000

## 7. Deploy to Vercel
```bash
npx vercel
```
Add env vars in Vercel project settings.

## Verification Checklist
- [ ] Sign in with email magic link or Google
- [ ] Create a menu (select age group)
- [ ] Add Roti + Dal to Monday breakfast
- [ ] Check Nutrition tab → see calorie bars vs RDA
- [ ] Check Grocery tab → see aggregated ingredients
- [ ] Toggle menu to Public → copy share URL
- [ ] Open share URL in incognito → menu visible
- [ ] Click "Share on WhatsApp" → WhatsApp opens with link
- [ ] Login in incognito → "Copy to My Menus" → appears in dashboard
- [ ] Browse /foods → search "roti" → nutrition card appears
