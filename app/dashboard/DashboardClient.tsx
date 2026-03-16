'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Eye, Edit, LogOut, Globe, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Menu } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import AICopilotPanel from '@/components/AICopilotPanel'
import GrowthTrackerPanel, { type ChildProfileWithMeasurements } from '@/components/GrowthTrackerPanel'

type Props = {
  initialMenus: Menu[]
  user: User
}

const AGE_COLORS: Record<string, string> = {
  '1-3': 'bg-pink-100 text-pink-700',
  '4-6': 'bg-blue-100 text-blue-700',
  '7-12': 'bg-green-100 text-green-700',
  mom: 'bg-violet-100 text-violet-700',
}

const AGE_LABELS: Record<string, string> = {
  '1-3': '1-3 years',
  '4-6': '4-6 years',
  '7-12': '7-12 years',
  mom: 'Mom',
}

export default function DashboardClient({ initialMenus, user }: Props) {
  const [menus, setMenus] = useState(initialMenus)
  const [profiles, setProfiles] = useState<ChildProfileWithMeasurements[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let active = true

    async function loadProfiles() {
      const res = await fetch('/api/child-profiles')
      const data = await res.json()
      if (!res.ok || !active) return
      setProfiles(data.profiles ?? [])
    }

    loadProfiles()

    return () => {
      active = false
    }
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this menu?')) return
    setDeleting(id)
    await fetch(`/api/menus/${id}`, { method: 'DELETE' })
    setMenus(prev => prev.filter(m => m.id !== id))
    setDeleting(null)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-orange-600">🍱 KidsBite</Link>
        <div className="flex items-center gap-3">
          <Link href="/foods">
            <Button variant="ghost" size="sm">Browse Foods</Button>
          </Link>
          <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1">
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Meal Planner</h1>
            <p className="text-gray-500">Smart meal generation, nutrition insights, grocery automation, and growth-aware planning.</p>
          </div>
          <AICopilotPanel menus={menus} profiles={profiles} />
          <GrowthTrackerPanel profiles={profiles} onProfilesChange={setProfiles} />
        </section>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Saved Menus</h2>
            <p className="text-gray-500">Plan weekly meals for kids and moms</p>
          </div>
          <Link href="/menu/new">
            <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4" />
              New Menu
            </Button>
          </Link>
        </div>

        {menus.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl">🍽️</div>
            <h2 className="text-xl font-semibold text-gray-700">No menus yet</h2>
            <p className="text-gray-500">Create your first weekly meal plan</p>
            <Link href="/menu/new">
              <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4" />
                Create First Menu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menus.map(menu => (
              <Card key={menu.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{menu.title}</CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                      {menu.is_public
                        ? <Globe className="w-4 h-4 text-green-600" />
                        : <Lock className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${AGE_COLORS[menu.age_group] ?? ''}`} variant="secondary">
                      {AGE_LABELS[menu.age_group] ?? menu.age_group}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(menu.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {menu.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{menu.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/menu/${menu.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1">
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                    </Link>
                    {menu.is_public && menu.share_slug && (
                      <Link href={`/shared/${menu.share_slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(menu.id)}
                      disabled={deleting === menu.id}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
