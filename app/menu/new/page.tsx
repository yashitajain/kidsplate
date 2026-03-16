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

type DietaryFilter = 'veg' | 'non-veg' | 'jain'
type PlanningMode = 'ai' | 'guided' | 'empty'

export default function NewMenuPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [planningMode, setPlanningMode] = useState<PlanningMode>(() => {
    if (typeof window === 'undefined') return 'guided'
    const params = new URLSearchParams(window.location.search)
    return params.get('mode') === 'ai' ? 'ai' : 'guided'
  })
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>('veg')
  const [aiPrompt, setAiPrompt] = useState('Create a week of meals for a picky 4-year-old who likes pasta and hates broccoli.')
  const [dietaryConstraints, setDietaryConstraints] = useState('gluten free, vegetarian, halal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const router = useRouter()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !ageGroup) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        age_group: ageGroup,
        auto_fill: planningMode === 'guided',
        dietary_filter: planningMode === 'guided' ? dietaryFilter : undefined,
        ai_prompt: planningMode === 'ai' ? aiPrompt : undefined,
        dietary_constraints:
          planningMode === 'ai'
            ? dietaryConstraints.split(',').map((item) => item.trim()).filter(Boolean)
            : [],
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Failed to create menu')
      setLoading(false)
      return
    }

    setFollowUpQuestions(data.follow_up_questions ?? [])
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
              <div className="grid gap-2 md:grid-cols-3">
                {([
                  ['ai', 'AI Planner'],
                  ['guided', 'Guided'],
                  ['empty', 'Empty'],
                ] as Array<[PlanningMode, string]>).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPlanningMode(mode)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      planningMode === mode
                        ? 'border-orange-300 bg-orange-50 text-orange-800'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <div className="font-medium">{label}</div>
                    <div className="mt-1 text-xs">
                      {mode === 'ai'
                        ? 'Prompt-based smart weekly plan'
                        : mode === 'guided'
                          ? 'Auto-fill from current food library'
                          : 'Start from a blank planner'}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <Label htmlFor="title">Menu Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Week 1 - June, Summer Menu"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="age-group">Age Group *</Label>
                <Select onValueChange={setAgeGroup} required>
                  <SelectTrigger id="age-group">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">1–3 years (Toddler)</SelectItem>
                    <SelectItem value="4-6">4–6 years (Pre-school)</SelectItem>
                    <SelectItem value="7-12">7–12 years (School age)</SelectItem>
                    <SelectItem value="mom">Mom (Adult)</SelectItem>
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

              {planningMode === 'ai' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="ai-prompt">AI prompt *</Label>
                    <Textarea
                      id="ai-prompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Create a week of meals for a picky 4-year-old who likes pasta and hates broccoli."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dietary-constraints">Allergies and dietary constraints</Label>
                    <Input
                      id="dietary-constraints"
                      value={dietaryConstraints}
                      onChange={(e) => setDietaryConstraints(e.target.value)}
                      placeholder="gluten free, vegetarian, halal"
                    />
                    <p className="text-xs text-gray-500">
                      The AI will use RAG-backed nutrition sources and your food library to create the first weekly draft.
                    </p>
                  </div>
                </>
              )}

              {planningMode === 'guided' && (
                <div className="space-y-1">
                  <Label htmlFor="diet-filter">Suggested Menu Type *</Label>
                  <Select value={dietaryFilter} onValueChange={(v) => setDietaryFilter(v as DietaryFilter)}>
                    <SelectTrigger id="diet-filter">
                      <SelectValue placeholder="Select diet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">Veg</SelectItem>
                      <SelectItem value="non-veg">Non-Veg</SelectItem>
                      <SelectItem value="jain">Jain</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Jain filter uses ingredient-name matching heuristics from food names/aliases.
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}
              {followUpQuestions.length > 0 && (
                <div className="rounded-lg border border-orange-100 bg-orange-50 p-3">
                  <p className="text-sm font-medium text-gray-800">Suggested follow-up questions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {followUpQuestions.map((question) => (
                      <span key={question} className="rounded-full bg-white px-3 py-1 text-xs text-orange-700">
                        {question}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={loading || !title || !ageGroup}
              >
                {loading
                  ? 'Creating...'
                  : planningMode === 'ai'
                    ? 'Create AI Meal Plan'
                    : planningMode === 'guided'
                      ? 'Create Suggested Menu'
                      : 'Create Empty Menu'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
