'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  format,
  subMonths,
  addMonths,
  parseISO,
  getDaysInMonth,
} from 'date-fns'
import { id } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Transaction } from '@/types'
import { formatRupiah, getCurrentMonth } from '@/lib/utils'

interface MonthlyChartProps {
  transactions: Transaction[]
  /** Jika diisi, chart dikontrol dari luar (tidak tampilkan navigator) */
  externalMonth?: string
}

function buildDailyData(transactions: Transaction[], month: string) {
  const daysInMonth = getDaysInMonth(parseISO(month + '-01'))
  const today = format(new Date(), 'yyyy-MM-dd')

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dateStr = `${month}-${String(day).padStart(2, '0')}`
    const dayTx = transactions.filter((t) => t.date === dateStr)
    const income = dayTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = dayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { day, dateStr, income, expense, isToday: dateStr === today }
  })
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: { dateStr: string; income: number; expense: number } }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d || (d.income === 0 && d.expense === 0)) return null
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-sky-100 dark:border-slate-700 px-3 py-2 text-xs pointer-events-none space-y-1">
      <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">
        {format(parseISO(d.dateStr), 'd MMM', { locale: id })}
      </p>
      {d.income > 0 && <p className="text-emerald-600 font-semibold">+{formatRupiah(d.income)}</p>}
      {d.expense > 0 && <p className="text-red-500 font-semibold">-{formatRupiah(d.expense)}</p>}
    </div>
  )
}

function XAxisTick({ x, y, payload }: { x: string | number; y: string | number; payload: { value: number } }) {
  if (payload.value % 5 !== 0 && payload.value !== 1) return <g />
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fill="#94A3B8" fontSize={9}>
        {payload.value}
      </text>
    </g>
  )
}

export function MonthlyChart({ transactions, externalMonth }: MonthlyChartProps) {
  const currentMonth = getCurrentMonth()
  const [internalMonth, setInternalMonth] = useState(currentMonth)

  // Jika externalMonth diisi → controlled mode (tanpa navigator)
  const month = externalMonth ?? internalMonth
  const controlled = externalMonth !== undefined
  const isCurrentMonth = month === currentMonth

  function prevMonth() {
    setInternalMonth((m) => format(subMonths(parseISO(m + '-01'), 1), 'yyyy-MM'))
  }
  function nextMonth() {
    const next = format(addMonths(parseISO(internalMonth + '-01'), 1), 'yyyy-MM')
    if (next <= currentMonth) setInternalMonth(next)
  }

  const monthLabel = format(parseISO(month + '-01'), 'MMMM yyyy', { locale: id })
  const data = useMemo(() => buildDailyData(transactions, month), [transactions, month])
  const totalIncome = useMemo(() => data.reduce((s, d) => s + d.income, 0), [data])
  const totalExpense = useMemo(() => data.reduce((s, d) => s + d.expense, 0), [data])
  const balance = totalIncome - totalExpense
  const hasData = totalIncome > 0 || totalExpense > 0

  return (
    <div className="w-full">
      {/* Navigator — hanya tampil di uncontrolled mode */}
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={prevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{monthLabel}</p>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="flex flex-col items-center gap-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl py-2.5 px-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mb-0.5" />
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Masuk</p>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 text-center leading-tight">
            {formatRupiah(totalIncome)}
          </p>
        </div>
        <div className="flex flex-col items-center gap-0.5 bg-red-50 dark:bg-red-900/20 rounded-xl py-2.5 px-1">
          <TrendingDown className="w-3.5 h-3.5 text-red-500 mb-0.5" />
          <p className="text-[10px] text-red-500 font-medium">Keluar</p>
          <p className="text-xs font-bold text-red-600 dark:text-red-400 text-center leading-tight">
            {formatRupiah(totalExpense)}
          </p>
        </div>
        <div className={`flex flex-col items-center gap-0.5 rounded-xl py-2.5 px-1 ${
          balance >= 0 ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
        }`}>
          <Wallet className={`w-3.5 h-3.5 mb-0.5 ${balance >= 0 ? 'text-sky-500' : 'text-orange-500'}`} />
          <p className={`text-[10px] font-medium ${balance >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-orange-500'}`}>
            Saldo
          </p>
          <p className={`text-xs font-bold text-center leading-tight ${
            balance >= 0 ? 'text-sky-700 dark:text-sky-300' : 'text-orange-600 dark:text-orange-400'
          }`}>
            {balance >= 0 ? '' : '-'}{formatRupiah(Math.abs(balance))}
          </p>
        </div>
      </div>

      {/* Chart */}
      {!hasData ? (
        <div className="flex flex-col items-center gap-1.5 py-6 text-slate-400 dark:text-slate-500">
          <p className="text-xs">Belum ada transaksi bulan ini</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={data} barGap={1} barCategoryGap="15%">
              <XAxis
                dataKey="day"
                tick={(props) => <XAxisTick {...props} />}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.06)', radius: 4 }} />
              <Bar dataKey="income" name="income" radius={[2, 2, 0, 0]} maxBarSize={8}>
                {data.map((entry) => (
                  <Cell key={entry.dateStr} fill={entry.isToday ? '#059669' : '#6EE7B7'} />
                ))}
              </Bar>
              <Bar dataKey="expense" name="expense" radius={[2, 2, 0, 0]} maxBarSize={8}>
                {data.map((entry) => (
                  <Cell key={entry.dateStr} fill={entry.isToday ? '#DC2626' : '#FCA5A5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-4 mt-1.5 justify-center">
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" /> Pemasukan
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> Pengeluaran
            </span>
            {isCurrentMonth && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="w-2 h-2 rounded-sm bg-emerald-600 inline-block" /> Hari ini
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
