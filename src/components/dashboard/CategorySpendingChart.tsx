'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { EXPENSE_CATEGORIES } from '@/lib/categories'
import { formatRupiah, getCurrentMonth } from '@/lib/utils'
import type { Transaction } from '@/types'

interface CategorySpendingChartProps {
  transactions: Transaction[]
}

export function CategorySpendingChart({ transactions }: CategorySpendingChartProps) {
  const currentMonth = getCurrentMonth()

  const data = useMemo(() => {
    const map: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach((t) => {
        map[t.category] = (map[t.category] ?? 0) + t.amount
      })

    const total = Object.values(map).reduce((s, v) => s + v, 0)
    if (total === 0) return []

    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([catId, amount]) => {
        const cat = EXPENSE_CATEGORIES.find((c) => c.id === catId)
        return {
          id: catId,
          name: cat?.name ?? catId,
          icon: cat?.icon ?? '📦',
          color: cat?.color ?? '#64748B',
          bgColor: cat?.bgColor ?? '#F1F5F9',
          amount,
          pct: Math.round((amount / total) * 100),
        }
      })
  }, [transactions, currentMonth])

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-6 text-slate-400 dark:text-slate-500">
        <p className="text-xs">Belum ada pengeluaran bulan ini</p>
      </div>
    )
  }

  const maxAmount = data[0].amount

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={item.id} className="flex items-center gap-3">
          {/* Rank + icon */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
            style={{ backgroundColor: item.bgColor }}
          >
            {item.icon}
          </div>

          {/* Bar + label */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {item.name}
              </span>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  {item.pct}%
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {formatRupiah(item.amount)}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.amount / maxAmount) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
