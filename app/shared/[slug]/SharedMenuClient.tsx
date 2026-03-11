'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import MenuTabs from '@/components/MenuTabs'
import type { Menu, MenuItemWithFood } from '@/lib/supabase'

type Props = {
  menu: Menu
  items: MenuItemWithFood[]
  currentUserId: string | null
  isOwner: boolean
}

const AGE_LABEL: Record<string, string> = {
  '1-3': '1–3 years',
  '4-6': '4–6 years',
  '7-12': '7–12 years',
  mom: 'Mom',
}

export default function SharedMenuClient({ menu, items, currentUserId, isOwner }: Props) {
  const [copying, setCopying] = useState(false)
  const router = useRouter()

  async function handleCopyMenu() {
    if (!currentUserId) {
      router.push('/login')
      return
    }
    setCopying(true)
    const res = await fetch(`/api/menus/${menu.id}/copy`, { method: 'POST' })
    if (res.ok) {
      const newMenu = await res.json()
      toast.success('Menu copied to your account!')
      router.push(`/menu/${newMenu.id}`)
    } else {
      toast.error('Failed to copy menu')
      setCopying(false)
    }
  }

  function handleWhatsApp() {
    const url = window.location.href
    const text = encodeURIComponent(`Check out this kids meal plan: ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-600">🍱 KidsBite</Link>
          <div className="flex items-center gap-2">
            {currentUserId ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">My Menus</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{menu.title}</h1>
              {menu.description && (
                <p className="text-gray-500 mt-1">{menu.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{AGE_LABEL[menu.age_group] ?? menu.age_group}</Badge>
                <span className="text-xs text-gray-400">
                  Shared meal plan
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isOwner && (
                <Button
                  onClick={handleCopyMenu}
                  disabled={copying}
                  className="gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  <Copy className="w-4 h-4" />
                  {copying ? 'Copying...' : currentUserId ? 'Copy to My Menus' : 'Sign in to Copy'}
                </Button>
              )}
              <Button onClick={handleWhatsApp} variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <MenuTabs
          menu={menu}
          items={items as MenuItemWithFood[]}
          readOnly
        />
      </main>

      <footer className="text-center py-6 text-sm text-gray-400">
        <p>Made with 🍱 <Link href="/" className="text-orange-600 hover:underline">KidsBite</Link> — Kids Meal Planner for Indian Moms</p>
      </footer>
    </div>
  )
}
