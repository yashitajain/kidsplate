import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOpenAIClient } from '@/lib/ai'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const image = String(body.image ?? '').trim()

  if (!image) {
    return NextResponse.json({ error: 'image is required' }, { status: 400 })
  }

  const client = getOpenAIClient()
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    max_tokens: 1200,
    messages: [
      {
        role: 'system',
        content:
          'You identify kid meals from images. Estimate cautiously and say when uncertain. Return only JSON.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'Identify the meal, list likely ingredients, estimate rough nutrition for one child portion, and suggest 3 follow-up questions. Return JSON with meal_name, confidence_note, identified_foods, estimated_nutrition, follow_up_questions.',
          },
          {
            type: 'image_url',
            image_url: { url: image },
          },
        ],
      },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    return NextResponse.json({ error: 'AI response was empty' }, { status: 500 })
  }

  return NextResponse.json(JSON.parse(content))
}
