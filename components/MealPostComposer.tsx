'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Menu } from '@/lib/supabase'

type Props = {
  menus: Menu[]
  onPosted: () => Promise<void>
  title?: string
  description?: string
}

export default function MealPostComposer({
  menus,
  onPosted,
  title = 'Share What You Made',
  description = 'Share a meal photo with a quick caption, and optionally add that meal into your saved schedule.',
}: Props) {
  const [creatingPost, setCreatingPost] = useState(false)
  const [caption, setCaption] = useState('')
  const [notes, setNotes] = useState('')
  const [visibility, setVisibility] = useState<'friends' | 'public'>('friends')
  const [scheduleMenuId, setScheduleMenuId] = useState('')
  const [scheduleDay, setScheduleDay] = useState('1')
  const [scheduleMealType, setScheduleMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('dinner')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function createPost(file: File | null) {
    if (!file) return
    setCreatingPost(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const imageUrl = typeof reader.result === 'string' ? reader.result : ''
      const res = await fetch('/api/meal-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          notes,
          visibility,
          schedule_menu_id: scheduleMenuId || undefined,
          schedule_day: scheduleMenuId ? Number(scheduleDay) : undefined,
          schedule_meal_type: scheduleMenuId ? scheduleMealType : undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'Could not create post')
        setCreatingPost(false)
        return
      }
      setCaption('')
      setNotes('')
      setScheduleMenuId('')
      setScheduleDay('1')
      setScheduleMealType('dinner')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      await onPosted()
      setCreatingPost(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          {description}
        </div>
        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption, for example: easy paneer lunch today"
        />
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes, for example: ate well, used less spice, added cucumber on the side"
          rows={3}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVisibility('friends')}
            className={`rounded-full px-4 py-2 text-sm ${visibility === 'friends' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}
          >
            Friends
          </button>
          <button
            type="button"
            onClick={() => setVisibility('public')}
            className={`rounded-full px-4 py-2 text-sm ${visibility === 'public' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}
          >
            Public
          </button>
        </div>
        <div className="space-y-3 rounded-xl border border-stone-200 p-4">
          <div className="text-sm font-medium text-stone-900">Optional: add this to my meal schedule</div>
          <select
            value={scheduleMenuId}
            onChange={(e) => setScheduleMenuId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
          >
            <option value="">Do not add to schedule</option>
            {menus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.title}
              </option>
            ))}
          </select>
          {scheduleMenuId ? (
            <div className="grid gap-2 md:grid-cols-2">
              <select
                value={scheduleDay}
                onChange={(e) => setScheduleDay(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
              >
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="7">Sunday</option>
              </select>
              <select
                value={scheduleMealType}
                onChange={(e) => setScheduleMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack')}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          ) : null}
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => createPost(e.target.files?.[0] ?? null)}
          disabled={creatingPost}
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={creatingPost || !caption.trim()}
          className="gap-2"
        >
          {creatingPost ? 'Uploading...' : 'Upload Meal Photo'}
        </Button>
        <div className="text-xs text-stone-500">{creatingPost ? 'Creating post...' : 'Add a caption, then upload a meal photo.'}</div>
      </CardContent>
    </Card>
  )
}
