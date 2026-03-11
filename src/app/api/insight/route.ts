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

  const systemPrompt = `Kamu adalah HEMATIN, asisten keuangan harian yang empatik untuk pengguna Indonesia.
Tugasmu: analisis data keuangan harian dan berikan insight yang singkat, personal, dan actionable.

Aturan respons:
- Bahasa Indonesia yang natural dan hangat
- Maksimal 3 paragraf pendek (bukan list/bullet)
- Mulai dengan satu kalimat apresiasi atau empati
- Berikan 1-2 insight spesifik dari data
- Jika ada hutang yang mendesak, singgung dengan lembut tanpa menghakimi
- Akhiri dengan 1 saran actionable yang konkret
- Jangan gunakan markdown atau formatting khusus
- Nada: seperti teman yang peduli, bukan robot keuangan`

  const debtSection = body.debtContext ? `\n\nInfo utang piutang:\n${body.debtContext}` : ''
  const userMessage = `Data keuangan hari ini:\n${body.context}${debtSection}\n\nBerikan insight keuangan harian yang personal dan actionable.`

  try {
    if (provider === 'anthropic') {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey })
      const message = await client.messages.create({
        model,
        max_tokens: 400,
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
        max_tokens: 400,
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
      const geminiModel = genAI.getGenerativeModel({ model, systemInstruction: systemPrompt })
      const result = await geminiModel.generateContent(userMessage)
      const text = result.response.text()
      return NextResponse.json({ insight: text })
    }

    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI request failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
