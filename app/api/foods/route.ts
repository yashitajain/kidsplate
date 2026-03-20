import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { proxyToPython } from '@/lib/python-backend'

export async function GET(request: NextRequest) {
  return proxyToPython(request, '/foods')
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return proxyToPython(request, '/foods', { userId: user.id })
}
