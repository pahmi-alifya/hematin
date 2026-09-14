import { format } from 'date-fns'
import { db } from './db'
import { buildFinancialContext, formatContextForAI } from './calculations'
import { buildAIHeaders } from './utils'
import type { Transaction, AISettings, InsightCache, Debt } from '@/types'
import type { Language } from '@/stores/languageStore'

export function formatDebtContextForAI(debts: Debt[], language: Language = 'id'): string | undefined {
  const activeHutang = debts.filter((d) => d.type === 'hutang' && d.status !== 'paid')
  const activePiutang = debts.filter((d) => d.type === 'piutang' && d.status !== 'paid')
  if (activeHutang.length === 0 && activePiutang.length === 0) return undefined

  const locale = language === 'en' ? 'en-US' : 'id-ID'
  const lines: string[] = []

  if (language === 'en') {
    if (activeHutang.length > 0) {
      const total = activeHutang.reduce((s, d) => s + d.amount, 0)
      const overdue = activeHutang.filter((d) => d.status === 'overdue')
      lines.push(`Active debts: ${activeHutang.length} records, total Rp ${total.toLocaleString(locale)}`)
      if (overdue.length > 0) {
        lines.push(`Overdue debts: ${overdue.map((d) => `${d.person} Rp ${d.amount.toLocaleString(locale)}`).join(', ')}`)
      }
    }
    if (activePiutang.length > 0) {
      const total = activePiutang.reduce((s, d) => s + d.amount, 0)
      lines.push(`Active credits: ${activePiutang.length} records, total Rp ${total.toLocaleString(locale)}`)
    }
    return lines.join('\n')
  }

  if (activeHutang.length > 0) {
    const total = activeHutang.reduce((s, d) => s + d.amount, 0)
    const overdue = activeHutang.filter((d) => d.status === 'overdue')
    lines.push(`Hutang aktif: ${activeHutang.length} catatan, total Rp ${total.toLocaleString(locale)}`)
    if (overdue.length > 0) {
      lines.push(`Hutang overdue: ${overdue.map((d) => `${d.person} Rp ${d.amount.toLocaleString(locale)}`).join(', ')}`)
    }
  }
  if (activePiutang.length > 0) {
    const total = activePiutang.reduce((s, d) => s + d.amount, 0)
    lines.push(`Piutang aktif: ${activePiutang.length} catatan, total Rp ${total.toLocaleString(locale)}`)
  }
  return lines.join('\n')
}

export async function getCachedInsight(walletId: string, date: string): Promise<InsightCache | undefined> {
  return db.insights.get(`insight-${walletId}-${date}`)
}

async function saveInsightCache(walletId: string, date: string, content: string): Promise<void> {
  await db.insights.put({
    id: `insight-${walletId}-${date}`,
    walletId,
    date,
    content,
    generatedAt: Date.now(),
  })
}

export async function fetchInsight(
  context: string,
  settings: AISettings,
  debtContext?: string,
  language?: Language,
): Promise<string> {
  const res = await fetch('/api/insight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAIHeaders({ provider: settings.provider, apiKey: settings.apiKey, model: settings.model, language }),
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
  walletId: string,
  transactions: Transaction[],
  settings: AISettings,
  forceRefresh = false,
  debts?: Debt[],
  language?: Language,
): Promise<string> {
  const today = format(new Date(), 'yyyy-MM-dd')

  if (!forceRefresh) {
    const cached = await getCachedInsight(walletId, today)
    if (cached) return cached.content
  }

  const ctx = buildFinancialContext(transactions, language)
  const contextStr = formatContextForAI(ctx, language)
  const debtContext = debts ? formatDebtContextForAI(debts, language) : undefined
  const insight = await fetchInsight(contextStr, settings, debtContext, language)
  await saveInsightCache(walletId, today, insight)
  return insight
}
