import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

type Params = { params: Promise<{ id: string }> }

// POST /api/menus/[id]/copy — copy a public menu to user's account
export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch original menu
  const { data: original, error: menuError } = await supabase
    .from('menus')
    .select('*')
    .eq('id', id)
    .single()

  if (menuError || !original) return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
  if (!original.is_public && original.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Create new menu copy
  const { data: newMenu, error: createError } = await supabase
    .from('menus')
    .insert({
      user_id: user.id,
      title: `${original.title} (Copy)`,
      description: original.description,
      age_group: original.age_group,
      child_profile_id: null,
      dietary_constraints: original.dietary_constraints ?? [],
      planning_prompt: original.planning_prompt ?? null,
      is_public: false,
      share_slug: null,
    })
    .select()
    .single()

  if (createError || !newMenu) return NextResponse.json({ error: createError?.message }, { status: 500 })

  // Fetch original items
  const { data: originalItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('menu_id', id)

  if (originalItems && originalItems.length > 0) {
    await supabase.from('menu_items').insert(
      originalItems.map(item => ({
        menu_id: newMenu.id,
        food_id: item.food_id,
        day: item.day,
        meal_type: item.meal_type,
        servings: item.servings,
      }))
    )
  }

  return NextResponse.json(newMenu, { status: 201 })
}
