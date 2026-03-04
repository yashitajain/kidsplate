'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function NewMenuPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !ageGroup) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, age_group: ageGroup }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Failed to create menu')
      setLoading(false)
      return
    }

    router.push(`/menu/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <span className="text-xl font-bold text-orange-600">🍱 KidsBite</span>
      </header>

      <main className="max-w-lg mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title">Menu Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Week 1 — June, Summer Menu"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="age-group">Child's Age Group *</Label>
                <Select onValueChange={setAgeGroup} required>
                  <SelectTrigger id="age-group">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">1–3 years (Toddler)</SelectItem>
                    <SelectItem value="4-6">4–6 years (Pre-school)</SelectItem>
                    <SelectItem value="7-12">7–12 years (School age)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="e.g. High protein week, post-fever recovery plan..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={loading || !title || !ageGroup}
              >
                {loading ? 'Creating...' : 'Create Menu & Start Planning'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
