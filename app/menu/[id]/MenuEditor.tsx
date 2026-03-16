'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Save, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import MenuTabs from '@/components/MenuTabs'
import ShareButton from '@/components/ShareButton'
import type { Food, Menu, MenuItemWithFood } from '@/lib/supabase'

type Props = {
  initialMenu: Menu
  initialItems: MenuItemWithFood[]
}

const AGE_LABEL: Record<string, string> = {
  '1-3': '1–3 yrs',
  '4-6': '4–6 yrs',
  '7-12': '7–12 yrs',
  mom: 'Mom',
}

export default function MenuEditor({ initialMenu, initialItems }: Props) {
  const [menu, setMenu] = useState(initialMenu)
  const [items, setItems] = useState<MenuItemWithFood[]>(initialItems as MenuItemWithFood[])
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const handleAdd = useCallback((food: Food, servings: number, day: number, mealType: string) => {
    const newItem: MenuItemWithFood = {
      id: `temp-${Date.now()}-${Math.random()}`,
      menu_id: menu.id,
      food_id: food.id,
      day,
      meal_type: mealType as MenuItemWithFood['meal_type'],
      servings,
      food,
    }
    setItems(prev => [...prev, newItem])
    setDirty(true)
  }, [menu.id])

  const handleRemove = useCallback((itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId))
    setDirty(true)
  }, [])

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/menus/${menu.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(i => ({
          food_id: i.food_id,
          day: i.day,
          meal_type: i.meal_type,
          servings: i.servings,
        })),
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMenu(updated)
      setDirty(false)
      toast.success('Menu saved!')
    } else {
      toast.error('Failed to save menu')
    }
    setSaving(false)
  }

  async function handleTogglePublic(isPublic: boolean) {
    const res = await fetch(`/api/menus/${menu.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: isPublic }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMenu(updated)
    }
  }

  async function handleClear() {
    if (!confirm('Clear all meals from this menu?')) return
    setItems([])
    setDirty(true)
  }

  return (
    <div className="min-h-screen" style={{ background: '#faf7f4' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-stone-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: '#3d7a57' }}>
              🍽
            </div>
            <div>
              <div className="font-bold text-[#1a1a1a] text-base leading-tight">{menu.title}</div>
              <div className="text-xs text-stone-400">Weekly meal planner · {AGE_LABEL[menu.age_group]}</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Sheet open={shareOpen} onOpenChange={setShareOpen}>
              <SheetTrigger asChild>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Share Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ShareButton menu={menu} onTogglePublic={handleTogglePublic} />
                </div>
              </SheetContent>
            </Sheet>

            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              🗑 Clear
            </button>

            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white transition-colors"
                style={{ background: '#3d7a57' }}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <MenuTabs
          menu={menu}
          items={items}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      </main>
    </div>
  )
}
