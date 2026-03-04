import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) ?? []

  if (ids.length === 0) return NextResponse.json([])

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('food_ingredients')
    .select('*')
    .in('food_id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
