# KidsPlate

KidsPlate is a meal planning app for parents. It combines weekly menu planning, AI meal assistance, child growth tracking, grocery help, and a community feed where parents can share what they actually made.

Live app:
- [https://kidsplate.vercel.app](https://kidsplate.vercel.app)

## What the app does

KidsPlate is built around a few core workflows:

- Create weekly meal plans for kids and families
- Generate meal ideas with AI from plain-language prompts
- Track child profiles with age, allergies, likes, dislikes, height, and weight
- Get nutrition feedback on saved menus
- Build grocery planning from meal schedules
- Share meal photos with captions and notes
- Add shared meal posts into a saved schedule
- Follow friends and see their shared meal posts and menus

## Main product areas

### Dashboard

The dashboard is the main working area after login. It includes:

- AI meal planning
- a quick `Share What You Made Today` composer
- family snapshot cards
- growth tracking
- navigation to saved menus and community

### Saved Menus

Parents can:

- create menus manually or with AI
- review and edit saved menus
- share menus as images

### Community

Community includes two types of sharing:

- `Meal Posts`: photo, caption, notes, and comments
- `Shared Menus`: reusable meal plans from connected friends

Parents can:

- search by name or email
- send friend requests
- accept incoming requests
- comment on meal posts

## Tech stack

- Next.js App Router
- React + TypeScript
- Supabase Auth + PostgreSQL
- FastAPI Python backend for app API logic
- Vercel for frontend deployment
- Capacitor for iOS packaging

## Project structure

- [app](/Users/yashitajain/Documents/AI%20projects/kidsplate/app): Next.js routes, pages, and API proxies
- [backend](/Users/yashitajain/Documents/AI%20projects/kidsplate/backend): FastAPI backend
- [components](/Users/yashitajain/Documents/AI%20projects/kidsplate/components): UI components
- [lib](/Users/yashitajain/Documents/AI%20projects/kidsplate/lib): shared helpers, Supabase types, backend proxy helpers
- [supabase](/Users/yashitajain/Documents/AI%20projects/kidsplate/supabase): schema and seed SQL
- [ios](/Users/yashitajain/Documents/AI%20projects/kidsplate/ios): Capacitor iOS project

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
PYTHON_BACKEND_URL=http://127.0.0.1:8000
```

### 3. Start the Python backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
npm run backend:dev
```

### 4. Start the Next.js app

In another terminal:

```bash
npm run dev
```

Open:
- [http://localhost:3000](http://localhost:3000)

## Database setup

Run the SQL in Supabase:

1. [supabase/schema.sql](/Users/yashitajain/Documents/AI%20projects/kidsplate/supabase/schema.sql)
2. [data/foods-seed.sql](/Users/yashitajain/Documents/AI%20projects/kidsplate/data/foods-seed.sql)
3. [supabase/nutrition-knowledge-seed.sql](/Users/yashitajain/Documents/AI%20projects/kidsplate/supabase/nutrition-knowledge-seed.sql)

Important tables include:

- `user_profiles`
- `child_profiles`
- `growth_measurements`
- `menus`
- `menu_items`
- `friendships`
- `meal_posts`
- `meal_post_comments`

## Production deployment

Frontend production is currently deployed on Vercel:
- [https://kidsplate.vercel.app](https://kidsplate.vercel.app)

To deploy the current local workspace to Vercel:

```bash
npx vercel --prod --yes
```

If you prefer git-based deploys:

```bash
git add .
git commit -m "Update KidsPlate"
git push origin <branch>
```

## Authentication

KidsPlate uses Supabase Auth.

Supported flows:

- email OTP / magic link
- Google sign-in

For production, make sure Supabase URL configuration points to the live app:

- Site URL: `https://kidsplate.vercel.app`
- Redirect URL: `https://kidsplate.vercel.app/auth/callback`

Google OAuth also needs the Supabase callback registered in Google Cloud:

- `https://gnxmdbgikkbjyaevnlqc.supabase.co/auth/v1/callback`

## Notes

- The frontend is deployed on Vercel.
- The Python backend is separate application logic and should be hosted where `PYTHON_BACKEND_URL` can reach it in production.
- Local workspace deploys to Vercel can include uncommitted changes if you use the Vercel CLI directly.
