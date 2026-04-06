import { NextRequest, NextResponse } from 'next/server'
import type { ScannedReceipt } from '@/types'

export async function POST(req: NextRequest) {
  const provider = req.headers.get('X-AI-Provider') as string
  const model = req.headers.get('X-AI-Model') as string
  const apiKey = req.headers.get('X-AI-Key') as string

  if (!provider || !model || !apiKey) {
    return NextResponse.json({ error: 'Missing AI configuration headers' }, { status: 400 })
  }

  let body: { imageBase64: string; mimeType: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { imageBase64, mimeType } = body

  if (!imageBase64) {
    return NextResponse.json({ error: 'Missing image data' }, { status: 400 })
  }

  const systemPrompt = `OCR struk belanja Indonesia. Balas HANYA raw JSON valid, TANPA markdown, TANPA code block, TANPA penjelasan apapun. Mulai langsung dengan { dan akhiri dengan }. Gunakan null jika tidak ditemukan. Format: {"merchant":string|null,"date":"YYYY-MM-DD"|null,"total":number|null,"category":"food|transport|shopping|health|entertainment|bills|education|other","notes":string|null,"confidence":"high|medium|low"}`

  const userMessage = 'Ekstrak data struk ini.'

  // Strip markdown code fences if AI wraps response in ```json ... ```
  function extractJSON(text: string): string {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) return match[1].trim()
    // Find first { to last } to be safe
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1)
    return text.trim()
  }

  try {
    let result: ScannedReceipt

    if (provider === 'anthropic') {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey })
      const message = await client.messages.create({
        model,
        max_tokens: 512,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                  data: imageBase64,
                },
              },
              { type: 'text', text: userMessage },
            ],
          },
        ],
      })
      const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
      result = JSON.parse(extractJSON(text))
    } else if (provider === 'openai') {
      const OpenAI = (await import('openai')).default
      const client = new OpenAI({ apiKey })
      const completion = await client.chat.completions.create({
        model,
        max_tokens: 512,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
              { type: 'text', text: userMessage },
            ],
          },
        ],
      })
      const text = completion.choices[0]?.message?.content ?? '{}'
      result = JSON.parse(extractJSON(text))
    } else if (provider === 'gemini') {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const geminiModel = genAI.getGenerativeModel({ model, systemInstruction: systemPrompt })
      const geminiResult = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [
          { inlineData: { data: imageBase64, mimeType } },
          { text: userMessage },
        ]}],
        generationConfig: { maxOutputTokens: 512 },
      })
      const text = geminiResult.response.text()
      result = JSON.parse(extractJSON(text))
    } else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
    }

    // Validate and sanitize
    const sanitized: ScannedReceipt = {
      merchant: typeof result.merchant === 'string' ? result.merchant : null,
      date: typeof result.date === 'string' ? result.date : null,
      total: typeof result.total === 'number' ? result.total : null,
      category: typeof result.category === 'string' ? result.category : null,
      notes: typeof result.notes === 'string' ? result.notes : null,
      confidence: ['high', 'medium', 'low'].includes(result.confidence) ? result.confidence : 'low',
    }

    return NextResponse.json(sanitized)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scan failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
