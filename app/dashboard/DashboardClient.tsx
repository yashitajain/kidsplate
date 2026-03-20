'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Eye, Edit, LogOut, Globe, Lock, Camera, LayoutDashboard, Sparkles, Users, BookMarked } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Friendship, MealPost, MealPostComment, Menu, MenuItemWithFood } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import AICopilotPanel from '@/components/AICopilotPanel'
import GrowthTrackerPanel, { type ChildProfileWithMeasurements } from '@/components/GrowthTrackerPanel'
import CommunityFeed from '@/components/CommunityFeed'
import MenuImageCard from '@/components/MenuImageCard'
import MealPostComposer from '@/components/MealPostComposer'

type Props = {
  initialMenus: Menu[]
  user: User
}

type CommunityMenu = {
  menu: Menu
  items: MenuItemWithFood[]
  profile?: FriendProfile | null
}

type CommunityPost = {
  post: MealPost
  profile?: FriendProfile | null
  comments: {
    comment: MealPostComment
    profile?: FriendProfile | null
  }[]
}

type FriendProfile = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
}

type FriendshipWithProfile = Friendship & {
  profile?: FriendProfile | null
}

type DashboardTab = 'planner' | 'saved' | 'community'

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

const TAB_META: Record<DashboardTab, { label: string; icon: typeof LayoutDashboard; description: string }> = {
  planner: {
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Daily planning, AI tools, and family snapshot',
  },
  saved: {
    label: 'Saved Menus',
    icon: BookMarked,
    description: 'Your reusable meal plans and share cards',
  },
  community: {
    label: 'Community',
    icon: Users,
    description: 'Friends, meal posts, and shared menus',
  },
}

export default function DashboardClient({ initialMenus, user }: Props) {
  const [menus, setMenus] = useState(initialMenus)
  const [profiles, setProfiles] = useState<ChildProfileWithMeasurements[]>([])
  const [friends, setFriends] = useState<FriendshipWithProfile[]>([])
  const [pendingIncoming, setPendingIncoming] = useState<FriendshipWithProfile[]>([])
  const [pendingOutgoing, setPendingOutgoing] = useState<FriendshipWithProfile[]>([])
  const [communityFeed, setCommunityFeed] = useState<CommunityMenu[]>([])
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([])
  const [activeTab, setActiveTab] = useState<DashboardTab>('planner')
  const [menuItemsById, setMenuItemsById] = useState<Record<string, MenuItemWithFood[]>>({})
  const [sharingImageId, setSharingImageId] = useState<string | null>(null)
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

  useEffect(() => {
    let active = true

    async function loadMenuItems() {
      const entries = await Promise.all(
        menus.map(async (menu) => {
          const res = await fetch(`/api/menus/${menu.id}`)
          if (!res.ok) return [menu.id, []] as const
          const data = await res.json()
          return [menu.id, data.items ?? []] as const
        })
      )

      if (!active) return
      setMenuItemsById(Object.fromEntries(entries))
    }

    if (menus.length > 0) {
      loadMenuItems()
    } else {
      setMenuItemsById({})
    }

    return () => {
      active = false
    }
  }, [menus])

  async function refreshCommunity() {
    const [friendsRes, feedRes] = await Promise.all([fetch('/api/friends'), fetch('/api/community/feed')])
    const friendsData = await friendsRes.json()
    const feedData = await feedRes.json()
    setFriends(friendsData.friends ?? [])
    setPendingIncoming(friendsData.pending_incoming ?? [])
    setPendingOutgoing(friendsData.pending_outgoing ?? [])
    setCommunityFeed(feedData.menus ?? [])
    setCommunityPosts(feedData.posts ?? [])
  }

  useEffect(() => {
    refreshCommunity()
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

  async function handleShareImage(menu: Menu) {
    setSharingImageId(menu.id)
    try {
      const target = document.getElementById(`menu-share-card-${menu.id}`)
      if (!target) throw new Error('Menu preview not ready yet')

      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(target, {
        backgroundColor: '#faf7f4',
        scale: 2,
        useCORS: true,
      })

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Failed to create image')

      const filename = `${menu.title.replace(/\s+/g, '-').toLowerCase() || 'menu'}.png`
      const file = new File([blob], filename, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: menu.title, text: 'Weekly meal plan' })
      } else {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 2000)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to share image')
    } finally {
      setSharingImageId(null)
    }
  }

  const latestMenu = menus[0] ?? null
  const latestPost = communityPosts[0] ?? null
  const acceptedFriends = friends.length
  const totalProfiles = profiles.length
  const currentTabMeta = TAB_META[activeTab]

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8f5f1_0%,_#fbfaf8_30%,_#ffffff_100%)]">
      <header className="border-b border-stone-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-orange-600">🍱 KidsBite</Link>
            <div className="hidden text-sm text-stone-400 lg:block">Family meal planning studio</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-full bg-stone-100 p-1">
            {(Object.keys(TAB_META) as DashboardTab[]).map((tab) => {
              const meta = TAB_META[tab]
              const Icon = meta.icon
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                    activeTab === tab ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {meta.label}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/foods">
              <Button variant="ghost" size="sm">Browse Foods</Button>
            </Link>
            <span className="hidden text-sm text-stone-500 sm:block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1">
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="overflow-hidden border-stone-200 bg-[linear-gradient(135deg,_#fff7ed_0%,_#fff_45%,_#f5f5f4_100%)]">
            <CardContent className="p-6 lg:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-orange-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    {currentTabMeta.label}
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
                      {activeTab === 'planner' ? 'Plan faster and keep the family feed organized.' : currentTabMeta.label}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                      {activeTab === 'planner'
                        ? 'Use AI for planning, log what you actually made, and keep child growth plus nutrition context in one clean workspace.'
                        : currentTabMeta.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/menu/new?mode=ai">
                    <Button className="bg-orange-600 hover:bg-orange-700">Create AI Menu</Button>
                  </Link>
                  <Link href="/menu/new">
                    <Button variant="outline">New Menu</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="border-stone-200 bg-white">
              <CardContent className="p-5">
                <div className="text-sm text-stone-500">Saved menus</div>
                <div className="mt-2 text-3xl font-semibold text-stone-900">{menus.length}</div>
                <div className="mt-2 text-xs text-stone-500">{latestMenu ? `Latest: ${latestMenu.title}` : 'No menus yet'}</div>
              </CardContent>
            </Card>
            <Card className="border-stone-200 bg-white">
              <CardContent className="p-5">
                <div className="text-sm text-stone-500">Child profiles</div>
                <div className="mt-2 text-3xl font-semibold text-stone-900">{totalProfiles}</div>
                <div className="mt-2 text-xs text-stone-500">{totalProfiles > 0 ? 'Growth tracking active' : 'Add your first child profile'}</div>
              </CardContent>
            </Card>
            <Card className="border-stone-200 bg-white">
              <CardContent className="p-5">
                <div className="text-sm text-stone-500">Community</div>
                <div className="mt-2 text-3xl font-semibold text-stone-900">{acceptedFriends}</div>
                <div className="mt-2 text-xs text-stone-500">{latestPost ? 'Recent meal posts available' : 'No meal posts yet'}</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {activeTab === 'planner' && (
          <section className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="min-w-0">
                <AICopilotPanel menus={menus} profiles={profiles} />
              </div>
              <div className="space-y-6">
                <MealPostComposer
                  menus={menus}
                  title="Share What You Made Today"
                  description="Post a quick meal photo, add notes, and drop it into a saved menu when you want to keep the idea."
                  onPosted={refreshCommunity}
                />
                <Card className="border-stone-200 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Family Snapshot</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profiles.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                        Add a child profile to make meal prompts, growth logs, and nutrition guidance more relevant.
                      </div>
                    ) : (
                      profiles.slice(0, 3).map((profile) => (
                        <div key={profile.id} className="rounded-2xl border border-stone-200 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-medium text-stone-900">{profile.name}</div>
                              <div className="text-xs text-stone-500">{new Date(profile.birth_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                            </div>
                            <Badge variant="secondary" className="bg-stone-100 text-stone-700">
                              {profile.measurements.length > 0 ? `${profile.measurements.length} logs` : 'No logs'}
                            </Badge>
                          </div>
                          {(profile.dietary_preferences.length > 0 || profile.allergies.length > 0) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {[...profile.dietary_preferences, ...profile.allergies].slice(0, 4).map((item) => (
                                <span key={item} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs text-orange-700">
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                          {(profile.likes.length > 0 || profile.dislikes.length > 0) && (
                            <div className="mt-3 text-xs leading-5 text-stone-500">
                              Likes: {profile.likes.slice(0, 3).join(', ') || 'not set'} · Dislikes: {profile.dislikes.slice(0, 3).join(', ') || 'not set'}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('community')}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-left text-sm text-stone-600 transition hover:bg-stone-50"
                    >
                      Community status: {acceptedFriends} friends · {pendingIncoming.length} pending requests · {communityPosts.length} visible meal posts
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
            <GrowthTrackerPanel profiles={profiles} onProfilesChange={setProfiles} />
          </section>
        )}

        {activeTab === 'saved' && (
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Saved Menus</h2>
                <p className="text-stone-500">View, edit, delete, or share the menus you created.</p>
              </div>
              <Link href="/menu/new">
                <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4" />
                  New Menu
                </Button>
              </Link>
            </div>

            {menus.length === 0 ? (
              <div className="space-y-4 py-20 text-center">
                <div className="text-6xl">🍽️</div>
                <h2 className="text-xl font-semibold text-stone-700">No menus yet</h2>
                <p className="text-stone-500">Create your first weekly meal plan</p>
                <Link href="/menu/new">
                  <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4" />
                    Create First Menu
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {menus.map(menu => (
                    <Card key={menu.id} className="border-stone-200 bg-white transition-shadow hover:shadow-md">
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
                          <p className="mb-3 text-sm text-stone-500 line-clamp-2">{menu.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/menu/${menu.id}`} className="flex-1 min-w-24">
                            <Button variant="outline" size="sm" className="w-full gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/menu/${menu.id}`} className="flex-1 min-w-24">
                            <Button variant="outline" size="sm" className="w-full gap-1">
                              <Edit className="w-3.5 h-3.5" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleShareImage(menu)}
                            disabled={sharingImageId === menu.id}
                          >
                            <Camera className="w-3.5 h-3.5" />
                            {sharingImageId === menu.id ? 'Saving...' : 'Image'}
                          </Button>
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

                <div className="fixed -left-[99999px] top-0 opacity-0 pointer-events-none" aria-hidden="true">
                  {menus.map((menu) => (
                    <MenuImageCard key={menu.id} menu={menu} items={menuItemsById[menu.id] ?? []} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === 'community' && (
          <section className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Community</h2>
              <p className="text-stone-500">Add friends and see what foods they are sharing in the app.</p>
            </div>
            <CommunityFeed
              friends={friends}
              pendingIncoming={pendingIncoming}
              pendingOutgoing={pendingOutgoing}
              feed={communityFeed}
              posts={communityPosts}
              menus={menus}
              onRefresh={refreshCommunity}
            />
          </section>
        )}
      </main>
    </div>
  )
}
