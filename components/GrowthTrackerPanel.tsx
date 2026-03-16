'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { summarizeGrowth } from '@/lib/growth'
import type { ChildProfile, GrowthMeasurement } from '@/lib/supabase'

export type ChildProfileWithMeasurements = ChildProfile & {
  measurements: GrowthMeasurement[]
}

type Props = {
  profiles: ChildProfileWithMeasurements[]
  onProfilesChange: (profiles: ChildProfileWithMeasurements[]) => void
}

const emptyProfileForm = {
  name: '',
  birth_date: '',
  sex: 'unspecified',
  dietary_preferences: '',
  allergies: '',
  likes: '',
  dislikes: '',
  health_goals: '',
}

export default function GrowthTrackerPanel({ profiles, onProfilesChange }: Props) {
  const [profileForm, setProfileForm] = useState(emptyProfileForm)
  const [measurementForm, setMeasurementForm] = useState({
    profileId: '',
    recorded_at: new Date().toISOString().slice(0, 10),
    height_cm: '',
    weight_kg: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/child-profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to save child profile')
      setLoading(false)
      return
    }

    onProfilesChange([{ ...data, measurements: [] }, ...profiles])
    setProfileForm(emptyProfileForm)
    setMeasurementForm((current) => ({ ...current, profileId: data.id }))
    setLoading(false)
  }

  async function handleAddMeasurement(e: React.FormEvent) {
    e.preventDefault()
    if (!measurementForm.profileId) return

    setLoading(true)
    setError('')

    const res = await fetch(`/api/child-profiles/${measurementForm.profileId}/measurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(measurementForm),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to log growth measurement')
      setLoading(false)
      return
    }

    onProfilesChange(
      profiles.map((profile) =>
        profile.id === measurementForm.profileId
          ? { ...profile, measurements: [data, ...profile.measurements] }
          : profile
      )
    )

    setMeasurementForm((current) => ({
      ...current,
      height_cm: '',
      weight_kg: '',
      notes: '',
    }))
    setLoading(false)
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-orange-100 bg-white">
        <CardHeader>
          <CardTitle>Growth Tracking</CardTitle>
          <CardDescription>
            Track age, height, and weight alongside meal intake so the AI can flag patterns like low calcium coverage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profiles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-gray-600">
              Add a child profile to unlock age-aware meal generation, growth logs, and nutrition insights.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {profiles.map((profile) => {
                const summary = summarizeGrowth(profile, profile.measurements)
                const latestMeasurement = profile.measurements[0]

                return (
                  <div key={profile.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-stone-900">{profile.name}</div>
                        <div className="text-xs text-stone-500">{summary.ageLabel}</div>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-xs text-stone-600">
                        {profile.sex}
                      </div>
                    </div>
                    <div className="text-sm text-stone-700">
                      {latestMeasurement
                        ? `Latest: ${latestMeasurement.height_cm ?? '—'} cm · ${latestMeasurement.weight_kg ?? '—'} kg`
                        : 'No measurements yet'}
                    </div>
                    <div className="text-xs text-stone-500">
                      Trend: {summary.heightChangeCm == null ? 'height trend pending' : `${summary.heightChangeCm.toFixed(1)} cm`} ·{' '}
                      {summary.weightChangeKg == null ? 'weight trend pending' : `${summary.weightChangeKg.toFixed(1)} kg`}
                    </div>
                    {(profile.allergies.length > 0 || profile.dietary_preferences.length > 0) && (
                      <div className="text-xs text-stone-500">
                        {[...profile.dietary_preferences, ...profile.allergies].join(' · ')}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Child Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProfile} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="child-name">Name</Label>
                  <Input
                    id="child-name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((current) => ({ ...current, name: e.target.value }))}
                    placeholder="Aarav"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="child-birth-date">Birth date</Label>
                  <Input
                    id="child-birth-date"
                    type="date"
                    value={profileForm.birth_date}
                    onChange={(e) => setProfileForm((current) => ({ ...current, birth_date: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="child-diet">Dietary preferences</Label>
                <Input
                  id="child-diet"
                  value={profileForm.dietary_preferences}
                  onChange={(e) => setProfileForm((current) => ({ ...current, dietary_preferences: e.target.value }))}
                  placeholder="vegetarian, halal"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="child-allergies">Allergies</Label>
                <Input
                  id="child-allergies"
                  value={profileForm.allergies}
                  onChange={(e) => setProfileForm((current) => ({ ...current, allergies: e.target.value }))}
                  placeholder="gluten, peanuts"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="child-likes">Likes</Label>
                  <Input
                    id="child-likes"
                    value={profileForm.likes}
                    onChange={(e) => setProfileForm((current) => ({ ...current, likes: e.target.value }))}
                    placeholder="pasta, paneer"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="child-dislikes">Dislikes</Label>
                  <Input
                    id="child-dislikes"
                    value={profileForm.dislikes}
                    onChange={(e) => setProfileForm((current) => ({ ...current, dislikes: e.target.value }))}
                    placeholder="broccoli, spicy food"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="child-goals">Health goals</Label>
                <Textarea
                  id="child-goals"
                  value={profileForm.health_goals}
                  onChange={(e) => setProfileForm((current) => ({ ...current, health_goals: e.target.value }))}
                  placeholder="iron intake, school lunch variety, weight gain after illness"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                {loading ? 'Saving...' : 'Save Child Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Log Measurement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMeasurement} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="measurement-profile">Child</Label>
                <select
                  id="measurement-profile"
                  value={measurementForm.profileId}
                  onChange={(e) => setMeasurementForm((current) => ({ ...current, profileId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select child</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="measurement-date">Date</Label>
                  <Input
                    id="measurement-date"
                    type="date"
                    value={measurementForm.recorded_at}
                    onChange={(e) => setMeasurementForm((current) => ({ ...current, recorded_at: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="measurement-height">Height (cm)</Label>
                  <Input
                    id="measurement-height"
                    type="number"
                    value={measurementForm.height_cm}
                    onChange={(e) => setMeasurementForm((current) => ({ ...current, height_cm: e.target.value }))}
                    placeholder="101"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="measurement-weight">Weight (kg)</Label>
                  <Input
                    id="measurement-weight"
                    type="number"
                    value={measurementForm.weight_kg}
                    onChange={(e) => setMeasurementForm((current) => ({ ...current, weight_kg: e.target.value }))}
                    placeholder="15.8"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="measurement-notes">Notes</Label>
                <Textarea
                  id="measurement-notes"
                  value={measurementForm.notes}
                  onChange={(e) => setMeasurementForm((current) => ({ ...current, notes: e.target.value }))}
                  placeholder="Recovered from fever, appetite improving"
                  rows={2}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" variant="outline" className="w-full" disabled={loading || profiles.length === 0}>
                {loading ? 'Saving...' : 'Add Measurement'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
