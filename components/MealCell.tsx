'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import FoodSearch from './FoodSearch'
import type { Food, MenuItemWithFood } from '@/lib/supabase'

type Props = {
  items: MenuItemWithFood[]
  day: number
  mealType: string
  cellCalories: number
  onAdd: (food: Food, servings: number) => void
  onRemove: (itemId: string) => void
  readOnly?: boolean
}

export default function MealCell({ items, day, mealType, cellCalories, onAdd, onRemove, readOnly }: Props) {
  const [searchOpen, setSearchOpen] = useState(false)
  const cellItems = items.filter(i => i.day === day && i.meal_type === mealType)
  const isEmpty = cellItems.length === 0

  return (
    <>
      <div
        onClick={() => { if (!readOnly && isEmpty) setSearchOpen(true) }}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all group
          ${isEmpty
            ? 'border-stone-200 bg-white/60 hover:border-stone-300 hover:bg-white cursor-pointer'
            : 'border-stone-200 bg-white'
          }
        `}
        style={{ minHeight: 82 }}
      >
        {isEmpty ? (
          /* Empty state — centered + */
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-stone-300 text-2xl font-light select-none group-hover:text-stone-400 transition-colors">+</span>
          </div>
        ) : (
          /* Filled state */
          <div className="p-2 space-y-1">
            {cellItems.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-1 bg-[#f0f7f3] rounded-lg px-2 py-1 group/chip"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-stone-700 truncate">{item.food.name}</div>
                  {item.servings !== 1 && (
                    <div className="text-[10px] text-stone-400">×{item.servings}</div>
                  )}
                </div>
                {!readOnly && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(item.id) }}
                    className="text-stone-300 hover:text-red-400 opacity-0 group-hover/chip:opacity-100 transition-all shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {/* kcal + add more */}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] text-stone-400">{Math.round(cellCalories)} kcal</span>
              {!readOnly && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-[10px] text-stone-400 hover:text-[#3d7a57] font-medium transition-colors"
                >
                  + add
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <FoodSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={onAdd}
      />
    </>
  )
}
