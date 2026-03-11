import { format } from 'date-fns'
import { db } from './db'
import { buildFinancialContext, formatContextForAI } from './calculations'
import type { Transaction, AISettings, InsightCache, Debt } from '@/types'

export function formatDebtContextForAI(debts: Debt[]): string | undefined {
  const activeHutang = debts.filter((d) => d.type === 'hutang' && d.status !== 'paid')
  const activePiutang = debts.filter((d) => d.type === 'piutang' && d.status !== 'paid')
  if (activeHutang.length === 0 && activePiutang.length === 0) return undefined

  const lines: string[] = []
  if (activeHutang.length > 0) {
    const total = activeHutang.reduce((s, d) => s + d.amount, 0)
    const overdue = activeHutang.filter((d) => d.status === 'overdue')
    lines.push(`Hutang aktif: ${activeHutang.length} catatan, total Rp ${total.toLocaleString('id-ID')}`)
    if (overdue.length > 0) {
      lines.push(`Hutang overdue: ${overdue.map((d) => `${d.person} Rp ${d.amount.toLocaleString('id-ID')}`).join(', ')}`)
    }
  }
  if (activePiutang.length > 0) {
    const total = activePiutang.reduce((s, d) => s + d.amount, 0)
    lines.push(`Piutang aktif: ${activePiutang.length} catatan, total Rp ${total.toLocaleString('id-ID')}`)
  }
  return lines.join('\n')
}

export async function getCachedInsight(date: string): Promise<InsightCache | undefined> {
  return db.insights.get(`insight-${date}`)
}

async function saveInsightCache(date: string, content: string): Promise<void> {
  await db.insights.put({
    id: `insight-${date}`,
    date,
    content,
    generatedAt: Date.now(),
  })
}

export async function fetchInsight(context: string, settings: AISettings, debtContext?: string): Promise<string> {
  const res = await fetch('/api/insight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-AI-Provider': settings.provider,
      'X-AI-Model': settings.model,
      'X-AI-Key': settings.apiKey,
    },
    body: JSON.stringify({ context, ...(debtContext ? { debtContext } : {}) }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request gagal' }))
    throw new Error(err.error ?? 'Request gagal')
  }

  const data = await res.json()
  return data.insight as string
}

export async function getOrFetchInsight(
  transactions: Transaction[],
  settings: AISettings,
  forceRefresh = false,
  debts?: Debt[]
): Promise<string> {
  const today = format(new Date(), 'yyyy-MM-dd')

  if (!forceRefresh) {
    const cached = await getCachedInsight(today)
    if (cached) return cached.content
  }

  const ctx = buildFinancialContext(transactions)
  const contextStr = formatContextForAI(ctx)
  const debtContext = debts ? formatDebtContextForAI(debts) : undefined
  const insight = await fetchInsight(contextStr, settings, debtContext)
  await saveInsightCache(today, insight)
  return insight
}
