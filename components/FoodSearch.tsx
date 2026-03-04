'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search } from 'lucide-react'
import type { Food } from '@/lib/supabase'

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (food: Food, servings: number) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  grain: 'bg-amber-100 text-amber-800',
  legume: 'bg-orange-100 text-orange-800',
  vegetable: 'bg-green-100 text-green-800',
  dairy: 'bg-blue-100 text-blue-800',
  fruit: 'bg-purple-100 text-purple-800',
  protein: 'bg-red-100 text-red-800',
  snack: 'bg-pink-100 text-pink-800',
}

export default function FoodSearch({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(false)
  const [servings, setServings] = useState<Record<string, number>>({})
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setFoods([])
      return
    }
    // Load all foods initially
    fetchFoods('')
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchFoods(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function fetchFoods(q: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/foods?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setFoods(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  function getServings(foodId: string) {
    return servings[foodId] ?? 1
  }

  function changeServings(foodId: string, delta: number) {
    setServings(prev => ({
      ...prev,
      [foodId]: Math.max(0.5, (prev[foodId] ?? 1) + delta),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Add Food
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search roti, dal, sabzi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 mt-2">
          {loading && <p className="text-sm text-gray-500 text-center py-4">Searching...</p>}
          {!loading && foods.length === 0 && query && (
            <p className="text-sm text-gray-500 text-center py-4">No foods found for "{query}"</p>
          )}
          {foods.map(food => (
            <div key={food.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-stone-800">{food.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[food.category] ?? 'bg-gray-100'}`}>
                    {food.category}
                  </span>
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  {food.serving_label} · {food.calories} kcal · P: {food.protein_g}g · Ca: {food.calcium_mg}mg
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => changeServings(food.id, -0.5)}
                  className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 text-xs"
                >−</button>
                <span className="w-8 text-center text-sm font-medium text-stone-700">{getServings(food.id)}</span>
                <button
                  onClick={() => changeServings(food.id, 0.5)}
                  className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 text-xs"
                >+</button>
                <button
                  className="ml-1 h-7 px-3 rounded-lg text-xs font-medium text-white transition-colors"
                  style={{ background: '#3d7a57' }}
                  onClick={() => { onSelect(food, getServings(food.id)); onClose() }}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
