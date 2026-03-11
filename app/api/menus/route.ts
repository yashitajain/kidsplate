import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const ALLOWED_AGE_GROUPS = ['1-3', '4-6', '7-12', 'mom'] as const
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const
const DIETARY_FILTERS = ['veg', 'non-veg', 'jain'] as const

type AgeGroup = (typeof ALLOWED_AGE_GROUPS)[number]
type MealType = (typeof MEAL_TYPES)[number]
type DietaryFilter = (typeof DIETARY_FILTERS)[number]
type FoodCategory = 'grain' | 'legume' | 'vegetable' | 'dairy' | 'fruit' | 'protein' | 'snack'

type FoodRow = {
  id: string
  category: FoodCategory
  name: string
  aliases: string[]
}

type SuggestedItem = {
  menu_id: string
  food_id: string
  day: number
  meal_type: MealType
  servings: number
}

const SERVINGS_BY_AGE: Record<AgeGroup, number> = {
  '1-3': 1,
  '4-6': 1.25,
  '7-12': 1.5,
  mom: 2,
}

const MEAL_CATEGORY_PRIORITY: Record<MealType, FoodCategory[]> = {
  breakfast: ['grain', 'dairy', 'fruit'],
  lunch: ['legume', 'vegetable', 'grain'],
  dinner: ['protein', 'vegetable', 'grain'],
  snack: ['fruit', 'snack', 'dairy'],
}

const NON_VEG_KEYWORDS = [
  'chicken', 'mutton', 'lamb', 'fish', 'egg', 'prawn', 'shrimp', 'meat', 'keema',
]

const JAIN_EXCLUDE_KEYWORDS = [
  ...NON_VEG_KEYWORDS,
  'onion', 'garlic', 'potato', 'aloo', 'carrot', 'beetroot', 'radish', 'mooli', 'yam', 'suran', 'turnip',
]

function getFoodText(food: FoodRow): string {
  return [food.name, ...(food.aliases ?? [])].join(' ').toLowerCase()
}

function hasAnyKeyword(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k))
}

function filterFoodsByDiet(foods: FoodRow[], dietaryFilter?: DietaryFilter): FoodRow[] {
  if (!dietaryFilter) return foods

  if (dietaryFilter === 'non-veg') {
    return foods
  }

  if (dietaryFilter === 'veg') {
    return foods.filter(food => !hasAnyKeyword(getFoodText(food), NON_VEG_KEYWORDS))
  }

  return foods.filter(food => !hasAnyKeyword(getFoodText(food), JAIN_EXCLUDE_KEYWORDS))
}

function pickFromCategory(
  foods: FoodRow[],
  indices: Record<string, number>,
  category: FoodCategory
): FoodRow | null {
  const pool = foods.filter(f => f.category === category)
  if (pool.length === 0) return null
  const key = `cat:${category}`
  const idx = (indices[key] ?? 0) % pool.length
  indices[key] = (indices[key] ?? 0) + 1
  return pool[idx]
}

function pickAnyFood(foods: FoodRow[], indices: Record<string, number>): FoodRow | null {
  if (foods.length === 0) return null
  const key = 'cat:any'
  const idx = (indices[key] ?? 0) % foods.length
  indices[key] = (indices[key] ?? 0) + 1
  return foods[idx]
}

function buildSuggestedItems(menuId: string, ageGroup: AgeGroup, foods: FoodRow[]): SuggestedItem[] {
  const items: SuggestedItem[] = []
  const indices: Record<string, number> = {}
  const servings = SERVINGS_BY_AGE[ageGroup]

  for (let day = 1; day <= 7; day++) {
    for (const mealType of MEAL_TYPES) {
      const priority = MEAL_CATEGORY_PRIORITY[mealType]
      let picked: FoodRow | null = null

      for (const category of priority) {
        picked = pickFromCategory(foods, indices, category)
        if (picked) break
      }

      if (!picked) {
        picked = pickAnyFood(foods, indices)
      }

      if (!picked) continue

      items.push({
        menu_id: menuId,
        food_id: picked.id,
        day,
        meal_type: mealType,
        servings,
      })
    }
  }

  return items
}

// GET /api/menus — list user's menus
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/menus — create new menu
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, age_group, auto_fill, dietary_filter } = body

  if (!title || !age_group) {
    return NextResponse.json({ error: 'title and age_group are required' }, { status: 400 })
  }
  if (!ALLOWED_AGE_GROUPS.includes(age_group)) {
    return NextResponse.json({ error: 'invalid age_group' }, { status: 400 })
  }
  if (dietary_filter !== undefined && !DIETARY_FILTERS.includes(dietary_filter)) {
    return NextResponse.json({ error: 'invalid dietary_filter' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('menus')
    .insert({
      user_id: user.id,
      title,
      description: description ?? '',
      age_group,
      is_public: false,
      share_slug: null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (auto_fill) {
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select('id, category, name, aliases')
      .order('name', { ascending: true })

    if (foodsError) {
      return NextResponse.json(
        { ...data, warning: `Suggestions failed: ${foodsError.message}` },
        { status: 201 }
      )
    }

    const filteredFoods = filterFoodsByDiet((foods ?? []) as FoodRow[], dietary_filter as DietaryFilter | undefined)

    const suggestedItems = buildSuggestedItems(
      data.id,
      age_group as AgeGroup,
      filteredFoods
    )

    if (suggestedItems.length > 0) {
      const { error: insertError } = await supabase.from('menu_items').insert(suggestedItems)
      if (insertError) {
        return NextResponse.json(
          { ...data, warning: `Suggestions failed: ${insertError.message}` },
          { status: 201 }
        )
      }
    } else {
      return NextResponse.json(
        { ...data, warning: 'No foods matched the selected dietary filter, so menu was created empty.' },
        { status: 201 }
      )
    }
  }

  return NextResponse.json(data, { status: 201 })
}
