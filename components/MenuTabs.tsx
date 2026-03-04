'use client'

import { useState } from 'react'
import MenuGrid from './MenuGrid'
import GroceryList from './GroceryList'
import NutritionSummary from './NutritionSummary'
import type { Food, Menu, MenuItemWithFood } from '@/lib/supabase'
import type { AgeGroup } from '@/lib/nutrition'

type Tab = 'planner' | 'grocery' | 'nutrition'

type Props = {
  menu: Menu
  items: MenuItemWithFood[]
  onAdd?: (food: Food, servings: number, day: number, mealType: string) => void
  onRemove?: (itemId: string) => void
  readOnly?: boolean
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'planner',   label: 'Meal Plan',    icon: '📅' },
  { id: 'grocery',   label: 'Grocery List', icon: '🛒' },
  { id: 'nutrition', label: 'Nutrition',    icon: '📊' },
]

export default function MenuTabs({ menu, items, onAdd, onRemove, readOnly }: Props) {
  const [active, setActive] = useState<Tab>('planner')

  return (
    <div className="w-full space-y-6">
      {/* Pill tabs */}
      <div className="inline-flex items-center gap-1 bg-stone-100 rounded-2xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              active === tab.id
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {active === 'planner' && (
        <MenuGrid
          items={items}
          onAdd={onAdd ?? (() => {})}
          onRemove={onRemove ?? (() => {})}
          readOnly={readOnly}
        />
      )}
      {active === 'grocery' && <GroceryList items={items} />}
      {active === 'nutrition' && (
        <NutritionSummary items={items} ageGroup={menu.age_group as AgeGroup} />
      )}
    </div>
  )
}
