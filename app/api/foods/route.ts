import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const category = searchParams.get('category')

  const supabase = await createServerSupabaseClient()

  let query = supabase.from('foods').select('*')

  if (q) {
    // Search by name (case-insensitive) or alias match
    query = query.or(`name.ilike.%${q}%,aliases.cs.{"${q}"}`)
  }

  if (category) {
    query = query.eq('category', category as 'grain' | 'legume' | 'vegetable' | 'dairy' | 'fruit' | 'protein' | 'snack')
  }

  query = query.order('name').limit(50)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
