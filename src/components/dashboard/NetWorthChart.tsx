'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Transaction } from '@/types'
import { formatRupiah, formatRupiahShort } from '@/lib/utils'

interface NetWorthChartProps {
  transactions: Transaction[]
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: { month: string; cumulative: number; net: number } }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-sky-100 dark:border-slate-700 px-3 py-2 text-xs pointer-events-none space-y-1">
      <p className="font-semibold text-slate-500 dark:text-slate-400">
        {format(parseISO(d.month + '-01'), 'MMMM yyyy', { locale: id })}
      </p>
      <p className={`font-bold ${d.cumulative >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-500'}`}>
        Total: {formatRupiah(d.cumulative)}
      </p>
      <p className={`${d.net >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
        Bulan ini: {d.net >= 0 ? '+' : ''}{formatRupiah(d.net)}
      </p>
    </div>
  )
}

export function NetWorthChart({ transactions }: NetWorthChartProps) {
  const data = useMemo(() => {
    if (transactions.length === 0) return []

    const monthMap: Record<string, { income: number; expense: number; saving: number }> = {}
    for (const t of transactions) {
      const month = t.date.substring(0, 7)
      if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0, saving: 0 }
      if (t.type === 'income') monthMap[month].income += t.amount
      if (t.type === 'expense') monthMap[month].expense += t.amount
      if (t.type === 'saving') monthMap[month].saving += t.amount
    }

    const months = Object.keys(monthMap).sort()
    let cumulative = 0
    return months.map((month) => {
      const { income, expense, saving } = monthMap[month]
      const net = income - expense - saving
      cumulative += net
      return {
        month,
        label: format(parseISO(month + '-01'), 'MMM yy', { locale: id }),
        net,
        cumulative,
      }
    })
  }, [transactions])

  if (data.length < 2) return null

  const latest = data[data.length - 1]
  const isPositive = latest.cumulative >= 0
  const color = isPositive ? '#0EA5E9' : '#EF4444'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saldo Berjalan</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{data[0].label} – {latest.label}</p>
        </div>
        <span className={`text-sm font-bold ${isPositive ? 'text-sky-600 dark:text-sky-400' : 'text-rose-500'}`}>
          {isPositive ? '+' : ''}{formatRupiahShort(latest.cumulative)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            interval={data.length > 6 ? Math.floor(data.length / 6) : 0}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={color}
            strokeWidth={2}
            fill="url(#netWorthGrad)"
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
