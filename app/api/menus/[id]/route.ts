import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { nanoid } from 'nanoid'

type Params = { params: Promise<{ id: string }> }
const ALLOWED_AGE_GROUPS = ['1-3', '4-6', '7-12', 'mom'] as const

// GET /api/menus/[id] — get menu with items
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: menu, error } = await supabase
    .from('menus')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !menu) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!menu.is_public && menu.user_id !== user?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: items } = await supabase
    .from('menu_items')
    .select('*, food:foods(*)')
    .eq('menu_id', id)

  return NextResponse.json({ menu, items: items ?? [] })
}

// PATCH /api/menus/[id] — update menu (title, description, age_group, is_public, items)
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: menu } = await supabase.from('menus').select('user_id, is_public, share_slug').eq('id', id).single()
  if (!menu || menu.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { title, description, age_group, is_public, items } = body

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title
  if (description !== undefined) updates.description = description
  if (age_group !== undefined) {
    if (!ALLOWED_AGE_GROUPS.includes(age_group)) {
      return NextResponse.json({ error: 'invalid age_group' }, { status: 400 })
    }
    updates.age_group = age_group
  }
  if (is_public !== undefined) {
    updates.is_public = is_public
    // Auto-generate slug when making public
    if (is_public && !menu.share_slug) {
      updates.share_slug = nanoid(10)
    }
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from('menus').update(updates).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update menu items if provided
  if (items !== undefined) {
    // Delete existing items
    await supabase.from('menu_items').delete().eq('menu_id', id)
    // Insert new items
    if (items.length > 0) {
      const { error } = await supabase.from('menu_items').insert(
        items.map((item: { food_id: string; day: number; meal_type: string; servings: number }) => ({
          menu_id: id,
          food_id: item.food_id,
          day: item.day,
          meal_type: item.meal_type,
          servings: item.servings,
        }))
      )
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  const { data: updatedMenu } = await supabase.from('menus').select('*').eq('id', id).single()
  return NextResponse.json(updatedMenu)
}

// DELETE /api/menus/[id] — delete menu
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: menu } = await supabase.from('menus').select('user_id').eq('id', id).single()
  if (!menu || menu.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('menus').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
