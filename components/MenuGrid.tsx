'use client'

import MealCell from './MealCell'
import type { Food, MenuItemWithFood } from '@/lib/supabase'
import { DAY_NAMES, MEAL_TYPES, calcCellCalories } from '@/lib/nutrition'

type Props = {
  items: MenuItemWithFood[]
  onAdd: (food: Food, servings: number, day: number, mealType: string) => void
  onRemove: (itemId: string) => void
  readOnly?: boolean
}

const MEAL_META: Record<string, { emoji: string; label: string }> = {
  breakfast: { emoji: '🌅', label: 'Breakfast' },
  lunch:     { emoji: '☀️', label: 'Lunch' },
  dinner:    { emoji: '🌙', label: 'Dinner' },
  snack:     { emoji: '🍎', label: 'Snack' },
}

export default function MenuGrid({ items, onAdd, onRemove, readOnly }: Props) {
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 820 }}>
        {/* Day headers */}
        <div className="grid mb-2" style={{ gridTemplateColumns: '110px repeat(7, 1fr)' }}>
          <div /> {/* empty corner */}
          {DAY_NAMES.map(day => (
            <div key={day} className="text-center text-[11px] font-semibold tracking-widest text-stone-400 uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {MEAL_TYPES.map(mealType => {
            const { emoji, label } = MEAL_META[mealType]
            return (
              <div key={mealType} className="grid items-start" style={{ gridTemplateColumns: '110px repeat(7, 1fr)', gap: '8px' }}>
                {/* Meal label */}
                <div className="flex items-center gap-1.5 pt-3 pr-2">
                  <span className="text-base">{emoji}</span>
                  <span className="text-[13px] font-medium text-stone-600">{label}</span>
                </div>
                {/* Cells */}
                {DAY_NAMES.map((_, dayIdx) => {
                  const day = dayIdx + 1
                  return (
                    <MealCell
                      key={day}
                      items={items}
                      day={day}
                      mealType={mealType}
                      cellCalories={calcCellCalories(items, day, mealType)}
                      onAdd={(food, servings) => onAdd(food, servings, day, mealType)}
                      onRemove={onRemove}
                      readOnly={readOnly}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
