'use client'

import MenuTabs from '@/components/MenuTabs'
import { Badge } from '@/components/ui/badge'
import type { Menu, MenuItemWithFood } from '@/lib/supabase'

type Props = {
  menu: Menu
  items: MenuItemWithFood[]
}

const AGE_LABELS: Record<string, string> = {
  '1-3': '1-3 years',
  '4-6': '4-6 years',
  '7-12': '7-12 years',
  mom: 'Mom',
}

export default function MenuImageCard({ menu, items }: Props) {
  return (
    <div id={`menu-share-card-${menu.id}`} className="w-[1200px] bg-[#faf7f4] p-8">
      <div className="rounded-[28px] border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.22em] text-stone-400">KidsPlate</div>
            <h1 className="mt-2 text-4xl font-bold text-stone-900">{menu.title}</h1>
            {menu.description ? <p className="mt-2 max-w-3xl text-lg text-stone-500">{menu.description}</p> : null}
          </div>
          <Badge variant="secondary" className="px-4 py-2 text-sm">
            {AGE_LABELS[menu.age_group] ?? menu.age_group}
          </Badge>
        </div>
        <MenuTabs menu={menu} items={items} readOnly initialTab="planner" />
      </div>
    </div>
  )
}
