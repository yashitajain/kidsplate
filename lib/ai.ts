import OpenAI from 'openai'
import { NUTRITION_KNOWLEDGE_DOCS, type NutritionKnowledgeDoc } from '@/data/nutrition-rag'

export type RetrievedEvidence = {
  id: string
  title: string
  source: string
  sourceUrl: string
  summary: string
  chunk: string
  score: number
}

export function getOpenAIClient() {
  const rawApiKey = process.env.OPENAI_API_KEY?.trim()
  const apiKey = rawApiKey?.replace(/^['"]|['"]$/g, '')

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing on server')
  }

  if (!/^[\x00-\x7F]+$/.test(apiKey)) {
    throw new Error('OPENAI_API_KEY contains non-ASCII characters. Re-copy the key as plain text.')
  }

  return new OpenAI({ apiKey })
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function scoreDoc(query: string, doc: NutritionKnowledgeDoc) {
  const queryTokens = new Set(tokenize(query))
  const docTokens = tokenize([doc.title, doc.summary, doc.chunk, doc.tags.join(' ')].join(' '))
  return docTokens.reduce((score, token) => score + (queryTokens.has(token) ? 1 : 0), 0)
}

export async function retrieveNutritionEvidence(
  supabase: unknown,
  query: string,
  limit = 4
): Promise<RetrievedEvidence[]> {
  try {
    const client = getOpenAIClient()
    const embedding = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })

    if (supabase && typeof supabase === 'object' && 'rpc' in supabase && typeof supabase.rpc === 'function') {
      const { data, error } = await supabase.rpc('match_nutrition_knowledge', {
        query_embedding: embedding.data[0]?.embedding,
        match_count: limit,
      } as Record<string, unknown>)

      if (!error && Array.isArray(data) && data.length > 0) {
        return (data as Array<Record<string, unknown>>).map((doc) => ({
          id: String(doc.id),
          title: String(doc.title),
          source: String(doc.source),
          sourceUrl: String(doc.source_url),
          summary: String(doc.summary ?? ''),
          chunk: String(doc.chunk),
          score: Number(doc.similarity ?? 0),
        }))
      }
    }
  } catch {}

  return NUTRITION_KNOWLEDGE_DOCS
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      source: doc.source,
      sourceUrl: doc.sourceUrl,
      summary: doc.summary,
      chunk: doc.chunk,
      score: scoreDoc(query, doc),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function formatEvidenceForPrompt(evidence: RetrievedEvidence[]) {
  if (evidence.length === 0) return 'No evidence retrieved.'

  return evidence
    .map(
      (doc, index) =>
        `[${index + 1}] ${doc.title} | ${doc.source} | ${doc.sourceUrl}\nSummary: ${doc.summary}\nEvidence: ${doc.chunk}`
    )
    .join('\n\n')
}

export async function generateJson<T>({
  system,
  prompt,
}: {
  system: string
  prompt: string
}): Promise<T> {
  const client = getOpenAIClient()
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_tokens: 2000,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('AI response was empty')
  }

  return JSON.parse(content) as T
}

export function normalizeFoodName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}
