import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

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

  return NextResponse.json({ ok: true })
}
