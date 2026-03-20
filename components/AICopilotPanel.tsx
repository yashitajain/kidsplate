'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ChildProfile, GrowthMeasurement, Menu } from '@/lib/supabase'

type ChildProfileWithMeasurements = ChildProfile & {
  measurements: GrowthMeasurement[]
}

type AskResult = {
  answer: string
  sources?: Array<{ title: string; source: string; url: string }>
  follow_up_questions?: string[]
}

type FeedbackResult = {
  summary: string
  alerts?: Array<{ nutrient: string; severity: string; message: string; foods_to_try: string[] }>
  wins?: string[]
  sources?: Array<{ title: string; source: string; url: string }>
  follow_up_questions?: string[]
}

type LeftoversResult = {
  meals?: Array<{ name: string; why_it_works: string; quick_steps: string[]; nutrition_note: string }>
  follow_up_questions?: string[]
}

type RecognitionResult = {
  meal_name?: string
  confidence_note?: string
  identified_foods?: string[]
  estimated_nutrition?: Record<string, string | number>
  follow_up_questions?: string[]
}

type Props = {
  menus: Menu[]
  profiles: ChildProfileWithMeasurements[]
}

type Panel = 'ask' | 'feedback' | 'leftovers' | 'recognition'

const PANELS: Array<{ id: Panel; label: string }> = [
  { id: 'ask', label: 'Ask AI' },
  { id: 'feedback', label: 'Nutrition Feedback' },
  { id: 'leftovers', label: 'Leftover Meals' },
  { id: 'recognition', label: 'Food Recognition' },
]

export default function AICopilotPanel({ menus, profiles }: Props) {
  const [active, setActive] = useState<Panel>('ask')
  const [question, setQuestion] = useState('What dinner should I make for a 3 year old?')
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [askResult, setAskResult] = useState<AskResult | null>(null)
  const [feedbackMenuId, setFeedbackMenuId] = useState(menus[0]?.id ?? '')
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>(null)
  const [ingredients, setIngredients] = useState('spinach, paneer')
  const [leftoversResult, setLeftoversResult] = useState<LeftoversResult | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? null
  const profileContext = selectedProfile
    ? `${selectedProfile.name}, born ${selectedProfile.birth_date}, likes ${selectedProfile.likes.join(', ') || 'not specified'}, dislikes ${selectedProfile.dislikes.join(', ') || 'not specified'}, allergies ${selectedProfile.allergies.join(', ') || 'none'}`
    : ''

  async function postJson(path: string, body: Record<string, unknown>) {
    setLoading(true)
    setError('')
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error ?? 'Request failed')
    }
    setLoading(false)
    return data
  }

  async function handleAsk() {
    try {
      const data = await postJson('/api/ai/ask', {
        question,
        age_context: profileContext,
        constraints: selectedProfile ? [...selectedProfile.dietary_preferences, ...selectedProfile.allergies] : [],
      })
      setAskResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ask AI')
      setLoading(false)
    }
  }

  async function handleFeedback() {
    try {
      const data = await postJson('/api/ai/nutrition-feedback', { menuId: feedbackMenuId })
      setFeedbackResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load nutrition feedback')
      setLoading(false)
    }
  }

  async function handleLeftovers() {
    try {
      const data = await postJson('/api/ai/leftovers', {
        ingredients,
        constraints: selectedProfile ? [...selectedProfile.dietary_preferences, ...selectedProfile.allergies].join(', ') : '',
      })
      setLeftoversResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate leftover ideas')
      setLoading(false)
    }
  }

  async function handleRecognition() {
    try {
      const data = await postJson('/api/ai/food-recognition', { image: imageDataUrl })
      setRecognitionResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image')
      setLoading(false)
    }
  }

  async function handleImageChange(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageDataUrl(typeof reader.result === 'string' ? reader.result : '')
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="space-y-4">
      <Card className="border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-2xl">AI Nutrition Copilot</CardTitle>
              <CardDescription>
                Meal planning and nutrition answers grounded in trusted guidance and your saved menus.
              </CardDescription>
            </div>
            <Link href="/menu/new?mode=ai">
              <Button className="bg-orange-600 hover:bg-orange-700">Create AI Meal Plan</Button>
            </Link>
          </div>
          <div className="rounded-2xl border border-orange-200 bg-white/80 p-4 text-sm text-stone-600">
            Ask meal, leftovers, and nutrition questions in plain language, then turn the answers into a saved weekly plan.
          </div>
          <div className="flex flex-wrap gap-2">
            {PANELS.map((panel) => (
              <button
                key={panel.id}
                onClick={() => setActive(panel.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active === panel.id ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                {panel.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-stone-800">Child profile context</label>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                >
                  <option value="">None selected</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>

              {active === 'ask' && (
                <>
                  <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} />
                  <Button onClick={handleAsk} disabled={loading || !question.trim()} className="w-full bg-orange-600 hover:bg-orange-700">
                    {loading ? 'Thinking...' : 'Ask Nutrition AI'}
                  </Button>
                </>
              )}

              {active === 'feedback' && (
                <>
                  <select
                    value={feedbackMenuId}
                    onChange={(e) => setFeedbackMenuId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select menu</option>
                    {menus.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.title}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleFeedback} disabled={loading || !feedbackMenuId} className="w-full bg-orange-600 hover:bg-orange-700">
                    {loading ? 'Analyzing...' : 'Analyze Weekly Nutrition'}
                  </Button>
                </>
              )}

              {active === 'leftovers' && (
                <>
                  <Input value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="spinach, paneer" />
                  <Button onClick={handleLeftovers} disabled={loading || !ingredients.trim()} className="w-full bg-orange-600 hover:bg-orange-700">
                    {loading ? 'Generating...' : 'Suggest Leftover Meals'}
                  </Button>
                </>
              )}

              {active === 'recognition' && (
                <>
                  <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)} />
                  <Button onClick={handleRecognition} disabled={loading || !imageDataUrl} className="w-full bg-orange-600 hover:bg-orange-700">
                    {loading ? 'Scanning...' : 'Recognize Meal from Photo'}
                  </Button>
                </>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-5">
              {active === 'ask' && askResult && (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-stone-900">Answer</div>
                    <p className="mt-1 text-sm text-stone-700">{askResult.answer}</p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">Sources</div>
                    <div className="mt-2 space-y-2 text-sm text-stone-600">
                      {askResult.sources?.map((source) => (
                        <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-stone-200 p-3 hover:bg-stone-50">
                          <div className="font-medium text-stone-800">{source.title}</div>
                          <div>{source.source}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">Follow-up questions</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {askResult.follow_up_questions?.map((item) => (
                        <span key={item} className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {active === 'feedback' && feedbackResult && (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-stone-900">Summary</div>
                    <p className="mt-1 text-sm text-stone-700">{feedbackResult.summary}</p>
                  </div>
                  <div className="space-y-2">
                    {feedbackResult.alerts?.map((alert) => (
                      <div key={`${alert.nutrient}-${alert.message}`} className="rounded-2xl border border-stone-200 p-3">
                        <div className="text-sm font-medium text-stone-900">
                          {alert.nutrient} · {alert.severity}
                        </div>
                        <p className="mt-1 text-sm text-stone-600">{alert.message}</p>
                        {alert.foods_to_try?.length ? (
                          <p className="mt-2 text-xs text-stone-500">Try: {alert.foods_to_try.join(', ')}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {feedbackResult.wins?.length ? (
                    <div className="text-sm text-green-700">Strong areas: {feedbackResult.wins.join(' · ')}</div>
                  ) : null}
                </div>
              )}

              {active === 'leftovers' && leftoversResult && (
                <div className="space-y-3">
                  {leftoversResult.meals?.map((meal) => (
                    <div key={meal.name} className="rounded-2xl border border-stone-200 p-4">
                      <div className="font-medium text-stone-900">{meal.name}</div>
                      <p className="mt-1 text-sm text-stone-600">{meal.why_it_works}</p>
                      <p className="mt-2 text-xs text-stone-500">{meal.quick_steps.join(' ')}</p>
                      <p className="mt-2 text-xs text-orange-700">{meal.nutrition_note}</p>
                    </div>
                  ))}
                </div>
              )}

              {active === 'recognition' && recognitionResult && (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-stone-900">{recognitionResult.meal_name}</div>
                    <p className="mt-1 text-sm text-stone-600">{recognitionResult.confidence_note}</p>
                  </div>
                  <div className="text-sm text-stone-700">
                    Foods: {recognitionResult.identified_foods?.join(', ') || 'No foods identified'}
                  </div>
                  <pre className="overflow-x-auto rounded-2xl bg-stone-50 p-3 text-xs text-stone-600">
                    {JSON.stringify(recognitionResult.estimated_nutrition ?? {}, null, 2)}
                  </pre>
                </div>
              )}

              {!askResult && active === 'ask' && (
                <div className="text-sm text-stone-500">Ask for dinner ideas, picky eater plans, iron-rich swaps, or age-specific portion help.</div>
              )}
              {!feedbackResult && active === 'feedback' && (
                <div className="text-sm text-stone-500">Pick a saved weekly menu to see nutrient gaps, strengths, and practical food suggestions.</div>
              )}
              {!leftoversResult && active === 'leftovers' && (
                <div className="text-sm text-stone-500">Enter leftovers like spinach and paneer to get three practical kid-friendly meal ideas.</div>
              )}
              {!recognitionResult && active === 'recognition' && (
                <div className="text-sm text-stone-500">Upload a meal photo and the AI will estimate what is on the plate and rough nutrition.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
