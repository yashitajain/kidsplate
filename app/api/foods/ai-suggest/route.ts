import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  const { name } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Food name is required' }, { status: 400 })
  }

  const prompt = `You are a nutrition expert. For the Indian food "${name.trim()}", provide nutritional data per typical single serving.
Respond ONLY with valid JSON matching this exact structure:
{
  "name": "...",
  "aliases": ["...", "..."],
  "category": "grain|legume|vegetable|dairy|fruit|protein|snack",
  "serving_size_g": 100,
  "serving_label": "1 serving (100g)",
  "calories": 0,
  "protein_g": 0,
  "carbs_g": 0,
  "fat_g": 0,
  "fiber_g": 0,
  "iron_mg": 0,
  "calcium_mg": 0,
  "vitamin_c_mg": 0
}`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.choices[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const nutrition = JSON.parse(jsonMatch[0])
    return NextResponse.json(nutrition)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
