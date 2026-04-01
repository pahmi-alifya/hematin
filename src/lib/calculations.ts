import { format, subDays } from 'date-fns'
import type { Transaction, FinancialContext } from '@/types'
import { EXPENSE_CATEGORIES } from './categories'

export function getTotalIncome(transactions: Transaction[], month: string): number {
  return transactions
    .filter((t) => t.type === 'income' && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getTotalExpense(transactions: Transaction[], month: string): number {
  return transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getCashFlowStatus(income: number, expense: number): 'positive' | 'neutral' | 'negative' {
  const balance = income - expense
  if (balance > 0) return 'positive'
  if (balance < 0) return 'negative'
  return 'neutral'
}

export function getTopCategory(transactions: Transaction[], month: string): string {
  const map: Record<string, number> = {}
  transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(month))
    .forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + t.amount
    })
  const top = Object.entries(map).sort(([, a], [, b]) => b - a)[0]
  if (!top) return 'Tidak ada'
  const cat = EXPENSE_CATEGORIES.find((c) => c.id === top[0])
  return cat ? `${cat.icon} ${cat.name}` : top[0]
}

export function getSpendingTrend(transactions: Transaction[]): 'increasing' | 'stable' | 'decreasing' {
  const today = new Date()
  const last7Start = format(subDays(today, 6), 'yyyy-MM-dd')
  const prev7Start = format(subDays(today, 13), 'yyyy-MM-dd')
  const prev7End = format(subDays(today, 7), 'yyyy-MM-dd')

  const last7 = transactions
    .filter((t) => t.type === 'expense' && t.date >= last7Start)
    .reduce((sum, t) => sum + t.amount, 0)

  const prev7 = transactions
    .filter((t) => t.type === 'expense' && t.date >= prev7Start && t.date <= prev7End)
    .reduce((sum, t) => sum + t.amount, 0)

  if (prev7 === 0) return 'stable'
  const change = (last7 - prev7) / prev7
  if (change > 0.1) return 'increasing'
  if (change < -0.1) return 'decreasing'
  return 'stable'
}

export function getLast7DaysData(transactions: Transaction[]): Array<{ date: string; income: number; expense: number }> {
  return Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
    const dayTx = transactions.filter((t) => t.date === date)
    return {
      date,
      income: dayTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: dayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })
}

export function getConsistencyLevel(transactions: Transaction[]): 'good' | 'medium' | 'low' {
  const days7 = getLast7DaysData(transactions)
  const activeDays = days7.filter((d) => d.income > 0 || d.expense > 0).length
  if (activeDays >= 5) return 'good'
  if (activeDays >= 3) return 'medium'
  return 'low'
}

export function buildFinancialContext(transactions: Transaction[]): FinancialContext {
  const month = format(new Date(), 'yyyy-MM')
  const today = format(new Date(), 'yyyy-MM-dd')

  const total_income = getTotalIncome(transactions, month)
  const total_expense = getTotalExpense(transactions, month)
  const balance = total_income - total_expense

  const todayTx = transactions.filter((t) => t.date === today)
  const income_today = todayTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense_today = todayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const categories_today = [...new Set(todayTx.filter((t) => t.type === 'expense').map((t) => t.category))]

  return {
    total_income,
    total_expense,
    cash_flow_status: getCashFlowStatus(total_income, total_expense),
    balance,
    top_category: getTopCategory(transactions, month),
    trend: getSpendingTrend(transactions),
    income_today,
    expense_today,
    categories_today,
    consistency_level: getConsistencyLevel(transactions),
  }
}

export function formatContextForAI(ctx: FinancialContext): string {
  const fmt = (v: number) => {
    const abs = Math.abs(v)
    const sign = v < 0 ? '-' : ''
    if (abs >= 1_000_000) return `${sign}Rp${(abs / 1_000_000).toFixed(1)}jt`
    if (abs >= 1_000) return `${sign}Rp${(abs / 1_000).toFixed(0)}rb`
    return `${sign}Rp${abs}`
  }

  const statusMap = { positive: 'aman', neutral: 'waspada', negative: 'defisit' }
  const trendMap = { increasing: 'naik', stable: 'stabil', decreasing: 'turun' }
  const consistencyMap = { good: 'baik', medium: 'sedang', low: 'rendah' }

  return [
    `Bulan ini: pemasukan ${fmt(ctx.total_income)}, pengeluaran ${fmt(ctx.total_expense)}, saldo ${fmt(ctx.balance)} (${statusMap[ctx.cash_flow_status]})`,
    `Terbesar: ${ctx.top_category} | tren 7hr: ${trendMap[ctx.trend]} | konsistensi: ${consistencyMap[ctx.consistency_level]}`,
    ctx.categories_today.length > 0
      ? `Hari ini: pemasukan ${fmt(ctx.income_today)}, pengeluaran ${fmt(ctx.expense_today)}, kategori: ${ctx.categories_today.join(', ')}`
      : `Hari ini: pemasukan ${fmt(ctx.income_today)}, pengeluaran ${fmt(ctx.expense_today)}, belum ada transaksi`,
  ].join('\n')
}
