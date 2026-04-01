import { NextRequest, NextResponse } from 'next/server'

export interface ModelOption {
  id: string
  name: string
  desc: string
  vision: boolean
}

// ─── Anthropic ────────────────────────────────────────────────────────────────
async function fetchAnthropicModels(apiKey: string): Promise<ModelOption[]> {
  const res = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  })
  if (!res.ok) throw new Error(`Anthropic: ${res.status} ${res.statusText}`)
  const json = await res.json() as { data: { id: string; display_name: string }[] }

  return json.data.map((m) => ({
    id: m.id,
    name: m.display_name ?? m.id,
    desc: inferAnthropicDesc(m.id),
    vision: true,
  }))
}

function inferAnthropicDesc(id: string): string {
  if (id.includes('opus')) return 'Paling cerdas & powerful'
  if (id.includes('sonnet')) return 'Seimbang antara kecerdasan & kecepatan'
  if (id.includes('haiku')) return 'Paling hemat & cepat'
  return 'Claude model'
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────
async function fetchOpenAIModels(apiKey: string): Promise<ModelOption[]> {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`OpenAI: ${res.status} ${res.statusText}`)
  const json = await res.json() as { data: { id: string }[] }

  // Filter hanya model chat yang relevan
  const INCLUDE_PREFIXES = ['gpt-4', 'gpt-3.5', 'o1', 'o3', 'o4']
  const EXCLUDE_KEYWORDS = ['instruct', 'vision', 'realtime', 'audio', 'search', 'preview']

  const filtered = json.data
    .map((m) => m.id)
    .filter((id) =>
      INCLUDE_PREFIXES.some((p) => id.startsWith(p)) &&
      !EXCLUDE_KEYWORDS.some((kw) => id.includes(kw))
    )
    .sort()
    .reverse()

  return filtered.map((id) => ({
    id,
    name: formatOpenAIName(id),
    desc: inferOpenAIDesc(id),
    vision: id.includes('4o') || id.includes('4-turbo') || id.startsWith('o'),
  }))
}

function formatOpenAIName(id: string): string {
  return id
    .replace(/-(\d{4}-\d{2}-\d{2})$/, '') // hapus tanggal di belakang
    .toUpperCase()
    .replace(/-/g, ' ')
}

function inferOpenAIDesc(id: string): string {
  if (id.startsWith('o4')) return 'Model reasoning terbaru OpenAI'
  if (id.startsWith('o3')) return 'Model reasoning canggih'
  if (id.startsWith('o1')) return 'Model reasoning kuat'
  if (id === 'gpt-4o') return 'Recommended — multimodal terbaik'
  if (id.includes('4o-mini')) return 'Lebih hemat, tetap cerdas'
  if (id.includes('4-turbo')) return 'GPT-4 versi turbo'
  if (id.startsWith('gpt-4')) return 'GPT-4 standar'
  if (id.startsWith('gpt-3.5')) return 'Paling hemat & cepat'
  return 'OpenAI model'
}

// ─── Gemini ───────────────────────────────────────────────────────────────────
async function fetchGeminiModels(apiKey: string): Promise<ModelOption[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  )
  if (!res.ok) throw new Error(`Gemini: ${res.status} ${res.statusText}`)
  const json = await res.json() as {
    models: {
      name: string
      displayName: string
      supportedGenerationMethods: string[]
    }[]
  }

  return json.models
    .filter((m) => m.supportedGenerationMethods.includes('generateContent'))
    .filter((m) => {
      const name = m.name.replace('models/', '')
      return (
        (name.startsWith('gemini') || name.startsWith('learnlm')) &&
        !name.includes('vision') &&
        !name.includes('embedding') &&
        !name.includes('aqa')
      )
    })
    .map((m) => {
      const id = m.name.replace('models/', '')
      return {
        id,
        name: m.displayName,
        desc: inferGeminiDesc(id),
        vision: true,
      }
    })
}

function inferGeminiDesc(id: string): string {
  if (id.includes('pro')) return 'Paling cerdas dari Gemini'
  if (id.includes('flash')) return 'Cepat & efisien'
  if (id.includes('nano')) return 'Paling ringan & hemat'
  return 'Gemini model'
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const provider = req.headers.get('X-AI-Provider')
  const apiKey = req.headers.get('X-AI-Key')

  if (!provider || !apiKey) {
    return NextResponse.json({ error: 'Missing provider or API key' }, { status: 400 })
  }

  try {
    let models: ModelOption[] = []

    if (provider === 'anthropic') models = await fetchAnthropicModels(apiKey)
    else if (provider === 'openai') models = await fetchOpenAIModels(apiKey)
    else if (provider === 'gemini') models = await fetchGeminiModels(apiKey)
    else return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })

    return NextResponse.json({ models })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch models'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
