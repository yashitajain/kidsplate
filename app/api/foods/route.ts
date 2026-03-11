import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, aliases, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg } = body

  if (!name?.trim() || !category) {
    return NextResponse.json({ error: 'name and category are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('foods')
    .insert({
      name: name.trim(),
      aliases: aliases ?? [],
      category,
      serving_size_g: Number(serving_size_g) || 100,
      serving_label: serving_label || `1 serving (${serving_size_g}g)`,
      calories: Number(calories) || 0,
      protein_g: Number(protein_g) || 0,
      carbs_g: Number(carbs_g) || 0,
      fat_g: Number(fat_g) || 0,
      fiber_g: Number(fiber_g) || 0,
      iron_mg: Number(iron_mg) || 0,
      calcium_mg: Number(calcium_mg) || 0,
      vitamin_c_mg: Number(vitamin_c_mg) || 0,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '42501' || /row-level security/i.test(error.message)) {
      return NextResponse.json(
        {
          error:
            'Food insert is blocked by Supabase RLS. Run supabase/rls-foods-insert.sql in your Supabase SQL Editor, then retry.',
        },
        { status: 403 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

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
