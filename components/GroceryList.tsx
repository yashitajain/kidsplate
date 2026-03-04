'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import type { MenuItemWithFood, FoodIngredient } from '@/lib/supabase'
import { aggregateGroceries, formatGroceryList } from '@/lib/grocery'

type Props = {
  items: MenuItemWithFood[]
}

export default function GroceryList({ items }: Props) {
  const [ingredientsByFood, setIngredientsByFood] = useState<Record<string, FoodIngredient[]>>({})
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadIngredients() {
      const foodIds = [...new Set(items.map(i => i.food_id))]
      if (foodIds.length === 0) { setLoading(false); return }

      // Fetch ingredients for all food IDs
      const res = await fetch(`/api/foods/ingredients?ids=${foodIds.join(',')}`)
      if (res.ok) {
        const data: FoodIngredient[] = await res.json()
        const grouped: Record<string, FoodIngredient[]> = {}
        for (const ing of data) {
          if (!grouped[ing.food_id]) grouped[ing.food_id] = []
          grouped[ing.food_id].push(ing)
        }
        setIngredientsByFood(grouped)
      }
      setLoading(false)
    }
    loadIngredients()
  }, [items])

  const groups = aggregateGroceries(items, ingredientsByFood)

  async function handleCopy() {
    const text = formatGroceryList(groups)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading grocery list...</div>

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-3">🛒</p>
        <p>Add foods to your planner to generate a grocery list.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">Weekly Grocery List</h3>
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy List'}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(group => (
          <div key={group.category} className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
              {group.category}
            </h4>
            <ul className="space-y-1.5">
              {group.items.map(item => (
                <li key={item.ingredient_name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.ingredient_name}</span>
                  <span className="text-gray-500 font-medium ml-4 shrink-0">
                    {item.quantity} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
