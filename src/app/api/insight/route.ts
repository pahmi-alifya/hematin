import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const provider = req.headers.get('X-AI-Provider') as string
  const model = req.headers.get('X-AI-Model') as string
  const apiKey = req.headers.get('X-AI-Key') as string

  if (!provider || !model || !apiKey) {
    return NextResponse.json({ error: 'Missing AI configuration headers' }, { status: 400 })
  }

  let body: { context: string; debtContext?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const systemPrompt = `Kamu HEMATIN, asisten keuangan personal Indonesia. Bahasa Indonesia natural, tanpa markdown, tanpa sapaan pembuka seperti "Halo", "Hai", "Waduh", atau sejenisnya. Langsung analisis data keuangan: tulis 1 paragraf max 1 paragraf — kondisi bulan ini, pola yang perlu diperhatikan, satu saran konkret. Jika ada hutang mendesak, singgung singkat berika insight langsung to the point.`

  const debtSection = body.debtContext ? `\nUtang: ${body.debtContext}` : ''
  const userMessage = `${body.context}${debtSection}`

  try {
    if (provider === 'anthropic') {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey })
      const message = await client.messages.create({
        model,
        max_tokens: 500,
        messages: [{ role: 'user', content: userMessage }],
        system: systemPrompt,
      })
      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      return NextResponse.json({ insight: text })
    }

    if (provider === 'openai') {
      const OpenAI = (await import('openai')).default
      const client = new OpenAI({ apiKey })
      const completion = await client.chat.completions.create({
        model,
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      })
      const text = completion.choices[0]?.message?.content ?? ''
      return NextResponse.json({ insight: text })
    }

    if (provider === 'gemini') {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const geminiModel = genAI.getGenerativeModel(
        { model, systemInstruction: systemPrompt },
      )
      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 1000 },
      })
      const text = result.response.text()
      return NextResponse.json({ insight: text })
    }

    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI request failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
