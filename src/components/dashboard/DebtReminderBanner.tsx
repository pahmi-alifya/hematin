'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { format, parseISO, differenceInDays } from 'date-fns'
import { id } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Clock, ChevronRight } from 'lucide-react'
import { useDebtStore } from '@/stores/debtStore'
import { formatRupiah } from '@/lib/utils'
import type { Debt } from '@/types'

function getUrgencyLabel(debt: Debt): string {
  if (debt.status === 'overdue') {
    if (!debt.dueDate) return 'Sudah jatuh tempo'
    const today = format(new Date(), 'yyyy-MM-dd')
    const diff = differenceInDays(parseISO(today), parseISO(debt.dueDate))
    return `${diff} hari lalu`
  }
  if (!debt.dueDate) return ''
  const today = format(new Date(), 'yyyy-MM-dd')
  const diff = differenceInDays(parseISO(debt.dueDate), parseISO(today))
  if (diff === 0) return 'Hari ini!'
  if (diff === 1) return 'Besok'
  return `${diff} hari lagi`
}

export function DebtReminderBanner() {
  const debts = useDebtStore((s) => s.debts)

  // Overdue hutang + hutang yang jatuh tempo dalam 7 hari
  const urgentDebts = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const limit = format(new Date(Date.now() + 7 * 86_400_000), 'yyyy-MM-dd')
    return debts
      .filter((d) => d.type === 'hutang' && d.status !== 'paid')
      .filter((d) => d.status === 'overdue' || (d.dueDate && d.dueDate <= limit))
      .sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1
        if (b.status === 'overdue' && a.status !== 'overdue') return 1
        return 0
      })
      .slice(0, 3) // max 3 ditampilkan
  }, [debts])

  return (
    <AnimatePresence>
      {urgentDebts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-800/60 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Pengingat Hutang
              </span>
            </div>
            <Link
              href="/debts"
              className="flex items-center gap-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400"
            >
              Lihat semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* List items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {urgentDebts.map((debt) => {
              const isOverdue = debt.status === 'overdue'
              const urgencyLabel = getUrgencyLabel(debt)
              return (
                <Link
                  key={debt.id}
                  href="/debts"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isOverdue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    {isOverdue
                      ? <AlertCircle className="w-4 h-4 text-red-500" />
                      : <Clock className="w-4 h-4 text-amber-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      Hutang ke {debt.person}
                    </p>
                    {urgencyLabel && (
                      <p className={`text-xs ${isOverdue ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
                        {urgencyLabel}
                      </p>
                    )}
                  </div>
                  <p className={`text-sm font-bold shrink-0 ${isOverdue ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {formatRupiah(debt.amount)}
                  </p>
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
