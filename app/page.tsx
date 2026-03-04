import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-orange-600">🍱 KidsBite</div>
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

      {/* Hero */}
      <section className="text-center px-6 py-16 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 rounded-full px-4 py-1 text-sm font-medium">
          🇮🇳 Built for Indian Moms
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Plan balanced weekly meals<br />
          <span className="text-orange-600">for your little ones</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Indian food nutrition database · Auto grocery lists · WhatsApp sharing ·
          Age-specific nutrition tracking
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href={user ? '/menu/new' : '/login'}>
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8">
              Start Planning Free
            </Button>
          </Link>
          <Link href="/foods">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Browse Foods
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Everything you need to feed your kids well</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              emoji: '📅',
              title: '7-Day Meal Planner',
              desc: 'Plan breakfast, lunch, dinner, and snacks for every day of the week with a simple click grid.',
            },
            {
              emoji: '🥘',
              title: '70+ Indian Foods',
              desc: 'Roti, dal, idli, dosa, rajma, palak, paneer, makhana — real Indian food with accurate nutrition data.',
            },
            {
              emoji: '📊',
              title: 'Age-specific Nutrition',
              desc: 'Daily tracking vs RDA for toddlers (1-3), pre-schoolers (4-6), and school-age (7-12) children.',
            },
            {
              emoji: '🛒',
              title: 'Auto Grocery List',
              desc: 'Automatically generates a weekly shopping list from your meal plan, grouped by category.',
            },
            {
              emoji: '📲',
              title: 'WhatsApp Sharing',
              desc: 'Make your menu public and share it directly to WhatsApp with one tap.',
            },
            {
              emoji: '🔄',
              title: 'Copy & Remix',
              desc: 'Found a menu you love from another mom? Copy it to your account and customize.',
            },
          ].map(feature => (
            <div key={feature.title} className="bg-white rounded-xl border p-6 space-y-3">
              <div className="text-3xl">{feature.emoji}</div>
              <h3 className="font-bold text-gray-900">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample foods */}
      <section className="bg-orange-50 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Covers all the foods your kids love</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Roti', 'Rice', 'Idli', 'Dosa', 'Upma', 'Poha', 'Paratha',
              'Moong Dal', 'Rajma', 'Chole', 'Sambar', 'Toor Dal',
              'Palak Sabzi', 'Aloo Gobi', 'Matar Paneer', 'Bhindi',
              'Milk', 'Dahi', 'Paneer', 'Ghee',
              'Banana', 'Apple', 'Mango', 'Papaya', 'Guava',
              'Egg', 'Chicken Curry', 'Fish Curry',
              'Makhana', 'Chikki', 'Dhokla', 'Sprouts',
            ].map(food => (
              <span key={food} className="bg-white border rounded-full px-3 py-1 text-sm text-gray-700">
                {food}
              </span>
            ))}
          </div>
          <Link href="/foods">
            <Button variant="outline" className="mt-4">View Full Food Database →</Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 px-6 space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Ready to plan healthier meals?</h2>
        <p className="text-gray-500">Join thousands of Indian moms planning nutritious meals for their children.</p>
        <Link href={user ? '/dashboard' : '/login'}>
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-10">
            {user ? 'Go to Dashboard' : 'Create Free Account'}
          </Button>
        </Link>
      </section>

      <footer className="border-t py-6 text-center text-sm text-gray-400 px-6">
        <p>🍱 KidsBite — Indian Kids Meal Planner · Made with love for Indian moms</p>
      </footer>
    </div>
  )
}
