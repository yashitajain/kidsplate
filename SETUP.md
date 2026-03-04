# KidsBite — Setup Guide

## 1. Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Go to Settings → API and copy your **Project URL** and **anon public key**

## 2. Set Environment Variables
Create `.env.local` in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Run Database Schema
In Supabase Dashboard → SQL Editor, run `supabase/schema.sql`

## 4. Seed Food Database
In Supabase Dashboard → SQL Editor, run `data/foods-seed.sql`

## 5. Configure Auth Providers
In Supabase Dashboard → Authentication → Providers:
- **Email**: Enable "Magic Link" (disable password for simplicity)
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
