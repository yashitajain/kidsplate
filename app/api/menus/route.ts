import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { formatEvidenceForPrompt, generateJson, normalizeFoodName, retrieveNutritionEvidence } from '@/lib/ai'

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

type AIMealSuggestion = {
  day: number
  meal_type: MealType
  food_name: string
  servings: number
}

type AIMenuPayload = {
  title: string
  description: string
  nutrition_focus: string[]
  follow_up_questions: string[]
  meals: AIMealSuggestion[]
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

function tokenize(value: string) {
  return normalizeFoodName(value)
    .split(' ')
    .filter(Boolean)
}

function scoreFoodMatch(food: FoodRow, rawName: string) {
  const target = normalizeFoodName(rawName)
  const targetTokens = new Set(tokenize(rawName))
  const candidates = [food.name, ...(food.aliases ?? [])].map(normalizeFoodName)

  let score = 0

  for (const candidate of candidates) {
    if (candidate === target) return 1000
    if (candidate.includes(target) || target.includes(candidate)) {
      score = Math.max(score, 700)
    }

    const candidateTokens = tokenize(candidate)
    let overlap = 0
    for (const token of candidateTokens) {
      if (targetTokens.has(token)) overlap += 1
    }
    score = Math.max(score, overlap * 100)
  }

  return score
}

function matchFoodByName(foods: FoodRow[], rawName: string) {
  let best: FoodRow | null = null
  let bestScore = 0

  for (const food of foods) {
    const score = scoreFoodMatch(food, rawName)
    if (score > bestScore) {
      best = food
      bestScore = score
    }
  }

  return bestScore >= 100 ? best : null
}

function buildFallbackItem(
  menuId: string,
  ageGroup: AgeGroup,
  foods: FoodRow[],
  mealType: MealType,
  day: number,
  indices: Record<string, number>
): SuggestedItem | null {
  const priority = MEAL_CATEGORY_PRIORITY[mealType]

  for (const category of priority) {
    const picked = pickFromCategory(foods, indices, category)
    if (picked) {
      return {
        menu_id: menuId,
        food_id: picked.id,
        day,
        meal_type: mealType,
        servings: SERVINGS_BY_AGE[ageGroup],
      }
    }
  }

  const anyFood = pickAnyFood(foods, indices)
  if (!anyFood) return null

  return {
    menu_id: menuId,
    food_id: anyFood.id,
    day,
    meal_type: mealType,
    servings: SERVINGS_BY_AGE[ageGroup],
  }
}

function resolveAIMenuToItems(
  menuId: string,
  ageGroup: AgeGroup,
  foods: FoodRow[],
  aiMeals: AIMealSuggestion[]
) {
  const resolved: SuggestedItem[] = []
  const seenSlots = new Set<string>()
  const fallbackIndices: Record<string, number> = {}

  for (const meal of aiMeals) {
    if (!MEAL_TYPES.includes(meal.meal_type)) continue
    if (meal.day < 1 || meal.day > 7) continue

    const slotKey = `${meal.day}:${meal.meal_type}`
    if (seenSlots.has(slotKey)) continue

    const matchedFood = matchFoodByName(foods, meal.food_name)
    if (!matchedFood) continue

    resolved.push({
      menu_id: menuId,
      food_id: matchedFood.id,
      day: meal.day,
      meal_type: meal.meal_type,
      servings: Number(meal.servings) > 0 ? Number(meal.servings) : SERVINGS_BY_AGE[ageGroup],
    })
    seenSlots.add(slotKey)
  }

  for (let day = 1; day <= 7; day++) {
    for (const mealType of MEAL_TYPES) {
      const slotKey = `${day}:${mealType}`
      if (seenSlots.has(slotKey)) continue

      const fallback = buildFallbackItem(menuId, ageGroup, foods, mealType, day, fallbackIndices)
      if (!fallback) continue

      resolved.push(fallback)
      seenSlots.add(slotKey)
    }
  }

  return resolved
}

function hasEnoughFoodVariety(foods: FoodRow[]) {
  const distinctCategories = new Set(foods.map((food) => food.category))
  return foods.length >= 12 && distinctCategories.size >= 4
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
  const { title, description, age_group, auto_fill, dietary_filter, ai_prompt, dietary_constraints, child_profile_id } = body

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
      child_profile_id: child_profile_id ?? null,
      dietary_constraints: Array.isArray(dietary_constraints) ? dietary_constraints : [],
      planning_prompt: ai_prompt ? String(ai_prompt) : null,
      is_public: false,
      share_slug: null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: foods, error: foodsError } = await supabase
    .from('foods')
    .select('id, category, name, aliases')
    .order('name', { ascending: true })

  if (foodsError) {
    return NextResponse.json(
      { ...data, warning: `Food library load failed: ${foodsError.message}` },
      { status: 201 }
    )
  }

  const filteredFoods = filterFoodsByDiet((foods ?? []) as FoodRow[], dietary_filter as DietaryFilter | undefined)

  if ((ai_prompt || auto_fill) && !hasEnoughFoodVariety(filteredFoods)) {
    await supabase.from('menus').delete().eq('id', data.id)

    return NextResponse.json(
      {
        error:
          'Your foods library does not have enough variety yet for AI planning. Seed data/foods-seed.sql into Supabase or add more foods across grains, legumes, vegetables, dairy, fruit, protein, and snacks.',
      },
      { status: 400 }
    )
  }

  if (ai_prompt) {
    try {
      const evidence = await retrieveNutritionEvidence(
        supabase,
        `${ai_prompt} ${age_group} ${Array.isArray(dietary_constraints) ? dietary_constraints.join(' ') : ''}`
      )

      const foodCatalog = filteredFoods
        .map((food) => `${food.name} [${food.category}]${food.aliases.length ? ` aliases: ${food.aliases.join(', ')}` : ''}`)
        .join('\n')

      const aiMenu = await generateJson<AIMenuPayload>({
        system:
          'You create weekly meal plans for children. Use only foods from the available food list. Balance familiarity and variety. Avoid making medical claims.',
        prompt: `Create a weekly meal plan for this request.
Title: ${title}
Description: ${description ?? ''}
Age group: ${age_group}
Parent request: ${ai_prompt}
Dietary constraints: ${Array.isArray(dietary_constraints) ? dietary_constraints.join(', ') : 'none'}

Available foods. Use these names exactly for food_name:
${foodCatalog}

Grounding evidence:
${formatEvidenceForPrompt(evidence)}

Return JSON with:
- title
- description
- nutrition_focus: array of 3 short points
- follow_up_questions: array of 3 short questions
- meals: 28 entries covering days 1-7 and meal types breakfast, lunch, dinner, snack with fields day, meal_type, food_name, servings
Rules:
- food_name must exactly match one item from the available foods list
- do not invent dishes outside the list`,
      })

      const matchedItems = resolveAIMenuToItems(
        data.id,
        age_group as AgeGroup,
        filteredFoods,
        Array.isArray(aiMenu.meals) ? aiMenu.meals : []
      )

      if (matchedItems.length > 0) {
        const { error: insertError } = await supabase.from('menu_items').insert(matchedItems)
        if (insertError) {
          return NextResponse.json(
            { ...data, warning: `AI plan created but meals could not be saved: ${insertError.message}` },
            { status: 201 }
          )
        }
      }

      const { error: updateError } = await supabase
        .from('menus')
        .update({
          title: aiMenu.title || title,
          description: aiMenu.description || description || '',
        })
        .eq('id', data.id)

      return NextResponse.json(
        {
          ...data,
          title: aiMenu.title || title,
          description: aiMenu.description || description || '',
          nutrition_focus: aiMenu.nutrition_focus,
          follow_up_questions: aiMenu.follow_up_questions,
          matched_meals: matchedItems.length,
          warning: matchedItems.length < 28
            ? 'Some AI meal names did not map cleanly, so fallback meals were used to complete the weekly calendar.'
            : undefined,
          updateError: updateError?.message,
        },
        { status: 201 }
      )
    } catch (aiError) {
      const message = aiError instanceof Error ? aiError.message : 'AI menu generation failed'
      return NextResponse.json(
        { ...data, warning: message },
        { status: 201 }
      )
    }
  }

  if (auto_fill) {
    const filteredFoodsForSuggestions = filterFoodsByDiet((foods ?? []) as FoodRow[], dietary_filter as DietaryFilter | undefined)

    const suggestedItems = buildSuggestedItems(
      data.id,
      age_group as AgeGroup,
      filteredFoodsForSuggestions
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
