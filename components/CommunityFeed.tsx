'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Copy, Mail, MessageSquare, UserPlus } from 'lucide-react'
import type { Friendship, MealPost, MealPostComment, Menu, MenuItemWithFood } from '@/lib/supabase'
import MealPostComposer from '@/components/MealPostComposer'

type FriendProfile = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
}

type FriendshipWithProfile = Friendship & {
  profile?: FriendProfile | null
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

type SearchResult = FriendProfile & {
  friendship?: Friendship | null
}

type Props = {
  friends: FriendshipWithProfile[]
  pendingIncoming: FriendshipWithProfile[]
  pendingOutgoing: FriendshipWithProfile[]
  feed: CommunityMenu[]
  posts: CommunityPost[]
  menus: Menu[]
  onRefresh: () => Promise<void>
}

function topFoods(items: MenuItemWithFood[]) {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item.food.name, (counts.get(item.food.name) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name)
}

export default function CommunityFeed({ friends, pendingIncoming, pendingOutgoing, feed, posts, menus, onRefresh }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [copiedInvite, setCopiedInvite] = useState(false)
  const [activeFeed, setActiveFeed] = useState<'posts' | 'menus'>('posts')
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [commentingId, setCommentingId] = useState<string | null>(null)

  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login'
  const inviteText = `Join me on KidsPlate to save menus, share meals, and see what friends are planning: ${inviteUrl}`

  async function search() {
    setSearching(true)
    const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(query)}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error ?? 'Could not search profiles')
      setSearching(false)
      return
    }
    setResults(data.results ?? [])
    setSearching(false)
  }

  async function sendRequest(addresseeId: string) {
    setBusyId(addresseeId)
    const res = await fetch('/api/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressee_id: addresseeId }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error ?? 'Could not add friend')
      setBusyId(null)
      return
    }
    await search()
    await onRefresh()
    setBusyId(null)
  }

  async function respond(friendshipId: string, action: 'accept' | 'reject') {
    setBusyId(friendshipId)
    const res = await fetch('/api/friends/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendship_id: friendshipId, action }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error ?? `Could not ${action} request`)
      setBusyId(null)
      return
    }
    await onRefresh()
    setBusyId(null)
  }

  async function copyInviteLink() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopiedInvite(true)
    setTimeout(() => setCopiedInvite(false), 2000)
  }

  function inviteByEmail() {
    window.location.href = `mailto:?subject=${encodeURIComponent('Join me on KidsPlate')}&body=${encodeURIComponent(inviteText)}`
  }

  function inviteByText() {
    window.location.href = `sms:&body=${encodeURIComponent(inviteText)}`
  }

  async function addComment(postId: string) {
    const body = (commentDrafts[postId] ?? '').trim()
    if (!body) return
    setCommentingId(postId)
    const res = await fetch('/api/meal-post-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, body }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'Could not add comment')
      setCommentingId(null)
      return
    }
    setCommentDrafts((current) => ({ ...current, [postId]: '' }))
    await onRefresh()
    setCommentingId(null)
  }

  return (
    <div className="space-y-6">
      <MealPostComposer
        menus={menus}
        onPosted={async () => {
          setActiveFeed('posts')
          await onRefresh()
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Invite Friends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
            Invite someone to sign up with a shared link. They can open it from email or phone text and create an account from the login page.
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <Input value={inviteUrl} readOnly className="bg-white" />
            <Button variant="outline" onClick={copyInviteLink} className="gap-2">
              <Copy className="h-4 w-4" />
              {copiedInvite ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={inviteByEmail} className="gap-2">
              <Mail className="h-4 w-4" />
              Invite by Email
            </Button>
            <Button variant="outline" onClick={inviteByText} className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Invite by Text
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Find Friends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" />
            <Button onClick={search} disabled={searching || !query.trim()}>{searching ? 'Searching...' : 'Search'}</Button>
          </div>
          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result.id} className="flex items-center justify-between rounded-xl border border-stone-200 p-3">
                  <div>
                    <div className="font-medium text-stone-900">{result.full_name || result.email || 'Unnamed user'}</div>
                    <div className="text-sm text-stone-500">{result.email}</div>
                  </div>
                  {result.friendship?.status === 'accepted' ? (
                    <Badge>Friends</Badge>
                  ) : result.friendship?.status === 'pending' ? (
                    <Badge variant="secondary">Pending</Badge>
                  ) : (
                    <Button size="sm" onClick={() => sendRequest(result.id)} disabled={busyId === result.id} className="gap-1.5">
                      <UserPlus className="h-4 w-4" />
                      Add Friend
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(pendingIncoming.length > 0 || pendingOutgoing.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Friend Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingIncoming.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-stone-200 p-3">
                <div>
                  <div className="font-medium text-stone-900">{item.profile?.full_name || item.profile?.email || 'Unknown user'}</div>
                  <div className="text-sm text-stone-500">Wants to connect</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => respond(item.id, 'accept')} disabled={busyId === item.id}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => respond(item.id, 'reject')} disabled={busyId === item.id}>Decline</Button>
                </div>
              </div>
            ))}
            {pendingOutgoing.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-stone-200 p-3">
                <div>
                  <div className="font-medium text-stone-900">{item.profile?.full_name || item.profile?.email || 'Unknown user'}</div>
                  <div className="text-sm text-stone-500">Request sent</div>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-sm text-stone-500">No friends yet. Search by email or name to build your community.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {friends.map((friend) => (
                <span key={friend.id} className="rounded-full bg-stone-100 px-3 py-2 text-sm text-stone-700">
                  {friend.profile?.full_name || friend.profile?.email || 'Unknown user'}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveFeed('posts')}
            className={`rounded-full px-4 py-2 text-sm ${activeFeed === 'posts' ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600'}`}
          >
            Meal Posts
          </button>
          <button
            type="button"
            onClick={() => setActiveFeed('menus')}
            className={`rounded-full px-4 py-2 text-sm ${activeFeed === 'menus' ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600'}`}
          >
            Shared Menus
          </button>
        </div>

        {activeFeed === 'posts' && posts.map((entry) => (
          <Card key={entry.post.id}>
            <CardContent className="space-y-4 pt-6">
              <img src={entry.post.image_url} alt={entry.post.ai_meal_name || 'Meal post'} className="h-56 w-full rounded-2xl object-cover" />
              <div>
                <div className="text-sm text-stone-500">by {entry.profile?.full_name || entry.profile?.email || 'A friend'}</div>
                <div className="mt-1 text-lg font-semibold text-stone-900">{entry.post.caption || 'Shared meal'}</div>
                {entry.post.notes ? <p className="mt-1 text-sm text-stone-600">{entry.post.notes}</p> : null}
              </div>
              {entry.post.meal_type ? <div className="text-xs uppercase tracking-[0.18em] text-stone-400">{entry.post.meal_type}</div> : null}
              <div className="space-y-3 rounded-2xl bg-stone-50 p-4">
                <div className="text-sm font-medium text-stone-900">Comments</div>
                {entry.comments.length > 0 ? (
                  <div className="space-y-3">
                    {entry.comments.map(({ comment, profile }) => (
                      <div key={comment.id} className="rounded-xl bg-white p-3">
                        <div className="text-xs text-stone-500">{profile?.full_name || profile?.email || 'Parent'}</div>
                        <div className="mt-1 text-sm text-stone-700">{comment.body}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-stone-500">No comments yet.</div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={commentDrafts[entry.post.id] ?? ''}
                    onChange={(e) => setCommentDrafts((current) => ({ ...current, [entry.post.id]: e.target.value }))}
                    placeholder="Add a comment"
                  />
                  <Button
                    type="button"
                    onClick={() => addComment(entry.post.id)}
                    disabled={commentingId === entry.post.id || !(commentDrafts[entry.post.id] ?? '').trim()}
                  >
                    {commentingId === entry.post.id ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {activeFeed === 'menus' && feed.map((entry) => (
          <Card key={entry.menu.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{entry.menu.title}</CardTitle>
                  <div className="mt-1 text-sm text-stone-500">by {entry.profile?.full_name || entry.profile?.email || 'A friend'}</div>
                </div>
                <Badge variant="secondary">{entry.menu.age_group}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {entry.menu.description ? <p className="text-sm text-stone-500">{entry.menu.description}</p> : null}
              <div className="flex flex-wrap gap-2">
                {topFoods(entry.items).map((food) => (
                  <span key={food} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">{food}</span>
                ))}
              </div>
              {entry.menu.share_slug ? <Link href={`/shared/${entry.menu.share_slug}`} className="text-sm font-medium text-orange-700 hover:text-orange-800">Open shared menu</Link> : null}
            </CardContent>
          </Card>
        ))}
      </div>
      {activeFeed === 'posts' && posts.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-stone-500">
            No meal posts yet. Share a photo of what you made today to get the community started.
          </CardContent>
        </Card>
      )}
      {activeFeed === 'menus' && feed.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-stone-500">
            No friend activity yet. Add friends and ask them to make menus public to see what foods they add in the app.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
