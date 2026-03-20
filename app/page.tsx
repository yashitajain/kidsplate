import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_38%),linear-gradient(180deg,_#fff7ed_0%,_#ffffff_40%,_#fffaf4_100%)]">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-orange-600">KidsBite AI</div>
        <div className="flex items-center gap-3">
          <Link href="/foods">
            <Button variant="ghost" size="sm">Foods DB</Button>
          </Link>
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-orange-600 hover:bg-orange-700" size="sm">My Menus</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="bg-orange-600 hover:bg-orange-700" size="sm">Get Started</Button>
            </Link>
          )}
        </div>
      </nav>

      <section className="px-6 py-16 max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1 text-sm font-medium text-orange-800">
            AI meal planner for modern families
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            KidsPlate is now an AI-powered meal planner for parents.
          </h1>
          <p className="max-w-2xl text-lg text-gray-600 md:text-xl">
            Generate a week of meals from a prompt, track growth by age, height, and weight, get nutrition feedback, automate grocery lists, and share real meals from your kitchen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={user ? '/menu/new?mode=ai' : '/login'}>
              <Button size="lg" className="bg-orange-600 px-8 text-lg hover:bg-orange-700">
                Create AI Meal Plan
              </Button>
            </Link>
            <Link href={user ? '/dashboard' : '/login'}>
              <Button size="lg" variant="outline" className="px-8 text-lg">
                Open Dashboard
              </Button>
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              'Create a week of meals for a picky 4-year-old who likes pasta and hates broccoli.',
              'Your child is low on iron this week. Try these foods.',
              'You have spinach and paneer. Here are 3 kid-friendly meals.',
            ].map((prompt) => (
              <div key={prompt} className="rounded-2xl border border-orange-100 bg-white/90 p-4 text-sm text-gray-600 shadow-sm">
                {prompt}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-xl shadow-orange-100">
          <div className="space-y-4">
            <div className="rounded-2xl bg-stone-900 p-5 text-white">
              <div className="text-sm uppercase tracking-[0.2em] text-orange-200">Built for Daily Use</div>
              <div className="mt-2 text-2xl font-semibold">Meal plans, saved menus, community inspiration, and growth tracking in one place</div>
              <div className="mt-3 text-sm text-stone-300">
                Start with a prompt, refine the weekly calendar, save menus, and share them with other families.
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="text-sm font-semibold text-stone-900">Growth tracking</div>
                <p className="mt-2 text-sm text-stone-600">Profiles store age, height, weight, likes, dislikes, allergies, and dietary needs.</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="text-sm font-semibold text-stone-900">Built to scale</div>
                <p className="mt-2 text-sm text-stone-600">Supabase authentication, PostgreSQL data model, RLS policies, and shareable weekly plans.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm text-orange-900">
              Parents get practical alerts like: child may be low on calcium this week, try yogurt, paneer, calcium-set tofu, and fortified dairy alternatives.
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center rounded-[2rem] border border-orange-200 bg-white/90 p-8 shadow-lg shadow-orange-100">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
              New on the landing page
            </div>
            <h2 className="text-3xl font-bold text-stone-900">Share What You Made Today</h2>
            <p className="text-base leading-7 text-stone-600">
              Moms can snap a meal photo, write a quick caption, add notes like what the child liked, and save it into a meal schedule without opening a separate tool first.
            </p>
            <div className="space-y-3 text-sm text-stone-600">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">1. Upload a photo from breakfast, lunch, dinner, or snack.</div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">2. Add a caption and notes like “ate half” or “used less spice today”.</div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">3. Post it to friends and optionally drop it straight into a saved weekly menu.</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={user ? '/dashboard' : '/login'}>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  {user ? 'Open Share Flow' : 'Try It Free'}
                </Button>
              </Link>
              <Link href={user ? '/dashboard' : '/login'}>
                <Button variant="outline">
                  {user ? 'Go to Dashboard' : 'Create Account'}
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-stone-900 p-6 text-white">
            <div className="rounded-[1.5rem] bg-white p-5 text-stone-900">
              <div className="text-sm font-semibold text-stone-900">Share What You Made Today</div>
              <div className="mt-4 h-48 rounded-[1.25rem] bg-[linear-gradient(135deg,_#fed7aa,_#fdba74_45%,_#fb923c)] p-4">
                <div className="h-full rounded-[1rem] border border-white/50 bg-white/25 backdrop-blur">
                  <div className="flex h-full items-end p-4">
                    <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-stone-700">Paneer rice bowl</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-stone-200 p-4">
                <div className="text-sm font-medium text-stone-900">Caption</div>
                <div className="mt-2 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">Easy paneer lunch today</div>
                <div className="mt-4 text-sm font-medium text-stone-900">Notes</div>
                <div className="mt-2 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">Ate well, added cucumber on the side, saving this to Wednesday lunch.</div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white">Friends</div>
                <div className="rounded-full bg-orange-100 px-4 py-2 text-sm text-orange-800">Add to schedule</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Smart Meal Generation',
              desc: 'Generate full weekly menus from natural-language prompts, age context, likes, dislikes, and allergy rules.',
            },
            {
              title: 'Nutrition Feedback',
              desc: 'Review weekly nutrient coverage and surface likely gaps like calcium or iron with practical suggestions.',
            },
            {
              title: 'Auto Grocery List',
              desc: 'Turn planned meals into a grocery list automatically without extra parent effort.',
            },
            {
              title: 'Meal Sharing',
              desc: 'Upload a meal photo, add notes, and share what you actually made with friends or the wider community.',
            },
            {
              title: 'Allergy Constraints',
              desc: 'Support gluten free, vegetarian, halal, and custom avoid lists at planning time.',
            },
            {
              title: 'Leftover Suggestions',
              desc: 'Turn whatever is already in the fridge into a short list of fast, kid-friendly meals.',
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-[2rem] bg-stone-900 px-6 py-10 text-white">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold">Pricing for real customers</h2>
            <p className="mt-3 text-stone-300">
              Start with the planner for free, then unlock AI meal generation and nutrition intelligence as families adopt the product.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                name: 'Free',
                price: '$0',
                detail: 'Basic planner',
                points: 'Weekly menu grid, foods database, grocery list, Supabase login',
              },
              {
                name: 'AI Planner',
                price: '$6 / month',
                detail: 'Prompt-based meal generation',
                points: 'AI weekly plans, leftovers assistant, allergy-aware meal ideas',
              },
              {
                name: 'Nutrition Insights',
                price: '$10 / month',
                detail: 'Advanced monitoring',
                points: 'Nutrition insights, grocery automation, growth tracking, source-backed guidance',
              },
            ].map((plan) => (
              <div key={plan.name} className="rounded-3xl bg-white p-6 text-stone-900">
                <div className="text-sm font-medium text-orange-700">{plan.name}</div>
                <div className="mt-2 text-3xl font-bold">{plan.price}</div>
                <div className="mt-2 text-sm text-stone-500">{plan.detail}</div>
                <p className="mt-4 text-sm leading-6 text-stone-600">{plan.points}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-orange-50 py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900">Why the stack supports scale</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="font-semibold text-stone-900">Supabase Auth</div>
              <p className="mt-2 text-sm text-stone-600">Email OTP and Google sign-in already support parent accounts without building custom auth.</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="font-semibold text-stone-900">PostgreSQL + RLS</div>
              <p className="mt-2 text-sm text-stone-600">Profiles, menus, growth logs, and knowledge docs live in Postgres with row-level security.</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="font-semibold text-stone-900">Community Sharing</div>
              <p className="mt-2 text-sm text-stone-600">Families can save menus, share them publicly, and learn from what others are cooking.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center py-16 px-6 space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Ask any follow-up question inside the dashboard</h2>
        <p className="text-gray-500">Dinner ideas, picky eating, leftovers, growth trends, or what to buy this week.</p>
        <Link href={user ? '/dashboard' : '/login'}>
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-10">
            {user ? 'Open AI Dashboard' : 'Create Free Account'}
          </Button>
        </Link>
      </section>

      <footer className="border-t py-6 text-center text-sm text-gray-400 px-6">
        <p>KidsBite AI - meal planning, nutrition insights, growth tracking, and grocery automation for families.</p>
      </footer>
    </div>
  )
}
