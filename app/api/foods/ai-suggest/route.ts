import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const CATEGORIES = ['grain', 'legume', 'vegetable', 'dairy', 'fruit', 'protein', 'snack'] as const
type Category = (typeof CATEGORIES)[number]

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rawApiKey = process.env.OPENAI_API_KEY?.trim()
  const apiKey = rawApiKey?.replace(/^['"]|['"]$/g, '')

  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is missing on server' }, { status: 500 })
  }

  if (!/^[\x00-\x7F]+$/.test(apiKey)) {
    return NextResponse.json(
      {
        error:
          'OPENAI_API_KEY contains non-ASCII characters (often smart quotes). Re-copy the key from OpenAI and paste plain text into .env.local.',
      },
      { status: 500 }
    )
  }

  const client = new OpenAI({ apiKey })
  const { name } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Food name is required' }, { status: 400 })
  }

  const prompt = `You are a nutrition expert for Indian foods.
Given food: "${name.trim()}".
Return only valid JSON with fields:
name, aliases, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg.
Rules:
- category must be one of: ${CATEGORIES.join(', ')}
- aliases must be an array of strings
- all numeric fields must be numbers
- keep values realistic for one common serving`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.choices[0]?.message?.content ?? ''
    if (!text) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const nutrition = JSON.parse(text)
    const category: Category = CATEGORIES.includes(nutrition.category)
      ? nutrition.category
      : 'snack'

    const normalized = {
      name: String(nutrition.name ?? name).trim(),
      aliases: Array.isArray(nutrition.aliases)
        ? nutrition.aliases.map((a: unknown) => String(a).trim()).filter(Boolean)
        : [],
      category,
      serving_size_g: Number(nutrition.serving_size_g) || 100,
      serving_label: String(nutrition.serving_label ?? '1 serving (100g)').trim(),
      calories: Number(nutrition.calories) || 0,
      protein_g: Number(nutrition.protein_g) || 0,
      carbs_g: Number(nutrition.carbs_g) || 0,
      fat_g: Number(nutrition.fat_g) || 0,
      fiber_g: Number(nutrition.fiber_g) || 0,
      iron_mg: Number(nutrition.iron_mg) || 0,
      calcium_mg: Number(nutrition.calcium_mg) || 0,
      vitamin_c_mg: Number(nutrition.vitamin_c_mg) || 0,
    }

    return NextResponse.json(normalized)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
