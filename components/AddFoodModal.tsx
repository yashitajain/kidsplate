'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'
import type { Food } from '@/lib/supabase'

type AISuggestion = Omit<Food, 'id'>

type Props = {
  open: boolean
  foodName: string
  onClose: () => void
  onAdded: (food: Food) => void
}

const CATEGORIES = ['grain', 'legume', 'vegetable', 'dairy', 'fruit', 'protein', 'snack'] as const

export default function AddFoodModal({ open, foodName, onClose, onAdded }: Props) {
  const [aiLoading, setAiLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<AISuggestion | null>(null)
  const [aliasesInput, setAliasesInput] = useState('')

  useEffect(() => {
    if (open && foodName) {
      fetchAISuggestion()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, foodName])

  async function fetchAISuggestion() {
    setAiLoading(true)
    setError(null)
    setForm(null)
    try {
      const res = await fetch('/api/foods/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: foodName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AI suggestion failed')
      setForm(data)
      setAliasesInput(Array.isArray(data.aliases) ? data.aliases.join(', ') : '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get AI suggestion')
    } finally {
      setAiLoading(false)
    }
  }

  function setField<K extends keyof AISuggestion>(key: K, value: AISuggestion[K]) {
    setForm(prev => prev ? { ...prev, [key]: value } : prev)
  }

  async function handleSave() {
    if (!form) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        aliases: aliasesInput.split(',').map(a => a.trim()).filter(Boolean),
      }
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save food')
      onAdded(data)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save food')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            Add New Food
          </DialogTitle>
        </DialogHeader>

        {aiLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm text-gray-500">Getting nutrition data from AI...</p>
          </div>
        )}

        {error && !aiLoading && (
          <div className="space-y-3">
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
            <Button variant="outline" className="w-full" onClick={fetchAISuggestion}>
              Try Again
            </Button>
          </div>
        )}

        {form && !aiLoading && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-stone-600 mb-1 block">Name</label>
                <Input value={form.name} onChange={e => setField('name', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-stone-600 mb-1 block">Aliases (comma-separated)</label>
                <Input
                  value={aliasesInput}
                  onChange={e => setAliasesInput(e.target.value)}
                  placeholder="e.g. pesarettu, green moong dosa"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Category</label>
                <select
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={form.category}
                  onChange={e => setField('category', e.target.value as AISuggestion['category'])}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Serving Size (g)</label>
                <Input
                  type="number"
                  value={form.serving_size_g}
                  onChange={e => setField('serving_size_g', Number(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-stone-600 mb-1 block">Serving Label</label>
                <Input value={form.serving_label} onChange={e => setField('serving_label', e.target.value)} />
              </div>
            </div>

            <div className="border-t border-stone-100 pt-3">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Nutrition per serving</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['calories', 'Calories (kcal)'],
                  ['protein_g', 'Protein (g)'],
                  ['carbs_g', 'Carbs (g)'],
                  ['fat_g', 'Fat (g)'],
                  ['fiber_g', 'Fiber (g)'],
                  ['iron_mg', 'Iron (mg)'],
                  ['calcium_mg', 'Calcium (mg)'],
                  ['vitamin_c_mg', 'Vitamin C (mg)'],
                ] as [keyof AISuggestion, string][]).map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-stone-600 mb-1 block">{label}</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form[key] as number}
                      onChange={e => setField(key, Number(e.target.value) as AISuggestion[typeof key])}
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
            )}

            <div className="flex gap-2 pt-2 pb-1">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button
                className="flex-1 text-white"
                style={{ background: '#3d7a57' }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add to Database
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
