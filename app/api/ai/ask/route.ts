import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { formatEvidenceForPrompt, generateJson, retrieveNutritionEvidence } from '@/lib/ai'

type AskResponse = {
  answer: string
  sources: Array<{ title: string; source: string; url: string }>
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
  const question = String(body.question ?? '').trim()
  const ageContext = String(body.age_context ?? '').trim()
  const constraints = Array.isArray(body.constraints) ? body.constraints.join(', ') : String(body.constraints ?? '')

  if (!question) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 })
  }

  const evidence = await retrieveNutritionEvidence(supabase, `${question} ${ageContext} ${constraints}`)
  const prompt = `Answer this parent nutrition question in plain language.
Question: ${question}
Age context: ${ageContext || 'not provided'}
Dietary constraints: ${constraints || 'none provided'}

Use the retrieved evidence below to ground the answer. If evidence is limited, say so briefly without refusing.
${formatEvidenceForPrompt(evidence)}

Return JSON with:
- answer: short answer with practical dinner or feeding guidance
- follow_up_questions: array of 3 concise follow-up questions a parent might ask next`

  const result = await generateJson<AskResponse>({
    system:
      'You are a pediatric meal planning assistant. Be careful, practical, and cite only the retrieved evidence as sources. Avoid diagnosis. Mention when an answer is an inference.',
    prompt,
  })

  return NextResponse.json({
    ...result,
    sources: evidence.map((doc) => ({
      title: doc.title,
      source: doc.source,
      url: doc.sourceUrl,
    })),
  })
}
