'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO, subMonths } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Transaction } from '@/types'

interface CashFlowChartProps {
  transactions: Transaction[]
  /** current month in "yyyy-MM" format */
  currentMonth: string
  /** how many months to show, default 4 */
  months?: number
}

function buildData(transactions: Transaction[], currentMonth: string, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const date = subMonths(parseISO(currentMonth + '-01'), count - 1 - i)
    const monthStr = format(date, 'yyyy-MM')
    const label = format(date, 'MMM', { locale: id })
    const monthTx = transactions.filter((t) => t.date.startsWith(monthStr))
    return {
      label,
      income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      saving: monthTx.filter((t) => t.type === 'saving').reduce((s, t) => s + t.amount, 0),
    }
  })
}

function formatYAxis(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}jt`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`
  return `${value}`
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  function fmt(v: number) {
    if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}jt`
    if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}rb`
    return `Rp ${v}`
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-sky-100 dark:border-slate-700 px-3 py-2 text-xs space-y-1 pointer-events-none">
      <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p
          key={p.name}
          className={p.name === 'income' ? 'text-emerald-600' : p.name === 'saving' ? 'text-teal-600' : 'text-red-500'}
        >
          {p.name === 'income' ? '+' : p.name === 'saving' ? '→' : '-'}{fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

export function CashFlowChart({ transactions, currentMonth, months = 4 }: CashFlowChartProps) {
  const data = buildData(transactions, currentMonth, months)

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barGap={3} barCategoryGap="35%">
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.06)', radius: 4 }} />
          <Bar dataKey="income" name="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={14} />
          <Bar dataKey="expense" name="expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={14} />
          <Bar dataKey="saving" name="saving" fill="#14B8A6" radius={[4, 4, 0, 0]} maxBarSize={14} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-3 mt-1 justify-center flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Pemasukan
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Pengeluaran
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" /> Tabungan
        </span>
      </div>
    </div>
  )
}
