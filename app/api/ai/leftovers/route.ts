import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateJson } from '@/lib/ai'

type LeftoverResponse = {
  meals: Array<{
    name: string
    why_it_works: string
    quick_steps: string[]
    nutrition_note: string
  }>
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
  const ingredients = String(body.ingredients ?? '').trim()
  const constraints = String(body.constraints ?? '').trim()

  if (!ingredients) {
    return NextResponse.json({ error: 'ingredients are required' }, { status: 400 })
  }

  const result = await generateJson<LeftoverResponse>({
    system:
      'You are a kid-friendly meal planner. Create simple leftover ideas for busy parents. Prefer familiar textures and flexible swaps.',
    prompt: `You have these leftovers or ingredients: ${ingredients}
Dietary constraints: ${constraints || 'none'}

Return JSON with:
- meals: exactly 3 options with name, why_it_works, quick_steps, nutrition_note
- follow_up_questions: array of 3 concise next questions`,
  })

  return NextResponse.json(result)
}
