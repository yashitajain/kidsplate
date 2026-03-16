import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calcAllDaysNutrition, calcWeeklyAverage, RDA, type AgeGroup } from '@/lib/nutrition'
import { formatEvidenceForPrompt, generateJson, retrieveNutritionEvidence } from '@/lib/ai'

type FeedbackResponse = {
  summary: string
  alerts: Array<{
    nutrient: string
    severity: 'low' | 'watch' | 'good'
    message: string
    foods_to_try: string[]
  }>
  wins: string[]
  follow_up_questions: string[]
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const menuId = String(body.menuId ?? '').trim()

  if (!menuId) {
    return NextResponse.json({ error: 'menuId is required' }, { status: 400 })
  }

  const { data: menu, error: menuError } = await supabase
    .from('menus')
    .select('*')
    .eq('id', menuId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (menuError) {
    return NextResponse.json({ error: menuError.message }, { status: 500 })
  }

  if (!menu) {
    return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
  }

  const { data: items, error: itemsError } = await supabase
    .from('menu_items')
    .select('id, menu_id, food_id, day, meal_type, servings, food:foods(*)')
    .eq('menu_id', menuId)

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Menu has no meals yet' }, { status: 400 })
  }

  const days = calcAllDaysNutrition(items as never)
  const average = calcWeeklyAverage(days)
  const ageGroup = menu.age_group as AgeGroup
  const target = RDA[ageGroup]
  const percent = {
    calories: Math.round((average.calories / target.calories) * 100),
    protein: Math.round((average.protein / target.protein) * 100),
    iron: Math.round((average.iron / target.iron) * 100),
    calcium: Math.round((average.calcium / target.calcium) * 100),
    vitaminC: Math.round((average.vitaminC / target.vitaminC) * 100),
    fiber: Math.round((average.fiber / target.fiber) * 100),
  }

  const lowNutrients = Object.entries(percent)
    .filter(([, value]) => value < 80)
    .map(([key, value]) => `${key} ${value}% of target`)
    .join(', ')

  const evidence = await retrieveNutritionEvidence(
    supabase,
    `${menu.age_group} nutrition gaps ${lowNutrients || 'balanced week'}`
  )

  const result = await generateJson<FeedbackResponse>({
    system:
      'You are a pediatric nutrition assistant. Use the nutrient percentages and retrieved evidence. Do not diagnose. Be concrete and use kid-friendly foods.',
    prompt: `Menu title: ${menu.title}
Age group: ${menu.age_group}
Weekly average nutrients: ${JSON.stringify(average)}
Target nutrients: ${JSON.stringify(target)}
Percent of target: ${JSON.stringify(percent)}

Grounding evidence:
${formatEvidenceForPrompt(evidence)}

Return JSON with:
- summary
- alerts: 2 to 4 items with nutrient, severity, message, foods_to_try
- wins: array of strengths
- follow_up_questions: array of 3 concise follow-up questions`,
  })

  return NextResponse.json({
    ...result,
    computed_percentages: percent,
    sources: evidence.map((doc) => ({
      title: doc.title,
      source: doc.source,
      url: doc.sourceUrl,
    })),
  })
}
