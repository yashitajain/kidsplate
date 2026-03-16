import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

function parseCsvField(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profiles, error: profileError } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const profileIds = (profiles ?? []).map((profile) => profile.id)
  if (profileIds.length === 0) {
    return NextResponse.json({ profiles: [] })
  }

  const { data: measurements, error: measurementError } = await supabase
    .from('growth_measurements')
    .select('*')
    .in('child_profile_id', profileIds)
    .order('recorded_at', { ascending: false })

  if (measurementError) {
    return NextResponse.json({ error: measurementError.message }, { status: 500 })
  }

  const byProfile = new Map<string, Array<Record<string, unknown>>>()
  for (const measurement of measurements ?? []) {
    const current = byProfile.get(measurement.child_profile_id) ?? []
    current.push(measurement)
    byProfile.set(measurement.child_profile_id, current)
  }

  const enriched = (profiles ?? []).map((profile) => ({
    ...profile,
    measurements: byProfile.get(profile.id) ?? [],
  }))

  return NextResponse.json({ profiles: enriched })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const name = String(body.name ?? '').trim()
  const birthDate = String(body.birth_date ?? '').trim()

  if (!name || !birthDate) {
    return NextResponse.json({ error: 'name and birth_date are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('child_profiles')
    .insert({
      user_id: user.id,
      name,
      birth_date: birthDate,
      sex: ['female', 'male', 'unspecified'].includes(body.sex) ? body.sex : 'unspecified',
      dietary_preferences: parseCsvField(body.dietary_preferences),
      allergies: parseCsvField(body.allergies),
      likes: parseCsvField(body.likes),
      dislikes: parseCsvField(body.dislikes),
      health_goals: parseCsvField(body.health_goals),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
