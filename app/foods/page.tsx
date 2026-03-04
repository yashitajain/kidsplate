'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, ArrowLeft } from 'lucide-react'
import type { Food } from '@/lib/supabase'

const CATEGORIES = ['all', 'grain', 'legume', 'vegetable', 'dairy', 'fruit', 'protein', 'snack']

const CATEGORY_COLORS: Record<string, string> = {
  grain: 'bg-amber-100 text-amber-800',
  legume: 'bg-orange-100 text-orange-800',
  vegetable: 'bg-green-100 text-green-800',
  dairy: 'bg-blue-100 text-blue-800',
  fruit: 'bg-purple-100 text-purple-800',
  protein: 'bg-red-100 text-red-800',
  snack: 'bg-pink-100 text-pink-800',
}

export default function FoodsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Food | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchFoods(query, category)
    }, 300)
  }, [query, category])

  async function fetchFoods(q: string, cat: string) {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (cat !== 'all') params.set('category', cat)
    const res = await fetch(`/api/foods?${params}`)
    const data = await res.json()
    setFoods(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <span className="text-xl font-bold text-orange-600">🍱 KidsBite</span>
        <span className="text-gray-400">/ Foods Database</span>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Indian Foods Database</h1>
          <p className="text-gray-500">Browse nutrition info for 70+ Indian foods</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search roti, dal, banana..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-orange-600 text-white'
                    : 'bg-white border text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selected.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={CATEGORY_COLORS[selected.category]} variant="secondary">
                      {selected.category}
                    </Badge>
                    <span className="text-sm text-gray-500">{selected.serving_label}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {[
                  { label: 'Calories', value: `${selected.calories} kcal`, highlight: true },
                  { label: 'Protein', value: `${selected.protein_g}g` },
                  { label: 'Carbs', value: `${selected.carbs_g}g` },
                  { label: 'Fat', value: `${selected.fat_g}g` },
                  { label: 'Fiber', value: `${selected.fiber_g}g` },
                  { label: 'Iron', value: `${selected.iron_mg}mg` },
                  { label: 'Calcium', value: `${selected.calcium_mg}mg` },
                  { label: 'Vitamin C', value: `${selected.vitamin_c_mg}mg` },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className={`rounded-lg p-3 text-center ${highlight ? 'bg-orange-100' : 'bg-white border'}`}>
                    <div className="text-lg font-bold text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
              {selected.aliases.length > 0 && (
                <div className="mt-3 text-sm text-gray-500">
                  Also known as: {selected.aliases.join(', ')}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading foods...</div>
        ) : foods.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No foods found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {foods.map(food => (
              <button
                key={food.id}
                onClick={() => setSelected(selected?.id === food.id ? null : food)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selected?.id === food.id
                    ? 'border-orange-400 bg-orange-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{food.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{food.serving_label}</div>
                  </div>
                  <Badge className={`text-xs ${CATEGORY_COLORS[food.category]}`} variant="secondary">
                    {food.category}
                  </Badge>
                </div>
                <div className="mt-2 flex gap-3 text-xs">
                  <span className="font-semibold text-orange-700">{food.calories} kcal</span>
                  <span className="text-gray-500">P: {food.protein_g}g</span>
                  <span className="text-gray-500">Ca: {food.calcium_mg}mg</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
