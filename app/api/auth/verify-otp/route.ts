import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { syncCurrentUserProfile } from '@/lib/user-profile'

export async function POST(request: NextRequest) {
  const { email, token } = await request.json()

  if (!email || !token) {
    return NextResponse.json({ error: 'email and token are required' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await syncCurrentUserProfile(user)
  }

  return NextResponse.json({ ok: true })
}
