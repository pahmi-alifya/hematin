'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { useGoalStore } from '@/stores/goalStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { EXPENSE_CATEGORIES } from '@/lib/categories'
import { formatRupiah, getCurrentMonth } from '@/lib/utils'

export function GoalAlertBanner() {
  const goals = useGoalStore((s) => s.goals)
  const transactions = useTransactionStore((s) => s.transactions)
  const currentMonth = getCurrentMonth()

  const alerts = useMemo(() => {
    const monthGoals = goals.filter((g) => g.month === currentMonth)
    const spentByCategory: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach((t) => {
        spentByCategory[t.category] = (spentByCategory[t.category] ?? 0) + t.amount
      })

    return monthGoals
      .filter((g) => (spentByCategory[g.category] ?? 0) > g.limitAmount)
      .map((g) => {
        const cat = EXPENSE_CATEGORIES.find((c) => c.id === g.category)
        const spent = spentByCategory[g.category] ?? 0
        return { cat, spent, limit: g.limitAmount, overage: spent - g.limitAmount }
      })
  }, [goals, transactions, currentMonth])

  return (
    <AnimatePresence>
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-red-200 dark:border-red-800/50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Batas Terlampaui
              </span>
              <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {alerts.length}
              </span>
            </div>
            <Link
              href="/goals"
              className="flex items-center gap-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400"
            >
              Kelola <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {alerts.slice(0, 3).map(({ cat, spent, limit, overage }) => (
              <Link
                key={cat?.id ?? 'unknown'}
                href="/goals"
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50/40 dark:hover:bg-red-900/10 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#FEE2E2' }}
                >
                  <span className="text-sm">{cat?.icon ?? '📦'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {cat?.name ?? 'Kategori'}
                  </p>
                  <p className="text-xs text-red-500 font-medium">
                    Lebih {formatRupiah(overage)} dari limit
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-red-500">{formatRupiah(spent)}</p>
                  <p className="text-[10px] text-slate-400">limit {formatRupiah(limit)}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
