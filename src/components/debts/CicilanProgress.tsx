'use client'

import { motion } from 'framer-motion'
import { formatRupiah } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import type { Debt } from '@/types'

export function CicilanProgress({ debt, totalPaid }: { debt: Debt; totalPaid: number }) {
  const t = useTranslation()
  const pct = Math.min(100, (totalPaid / debt.amount) * 100)
  const remaining = Math.max(0, debt.amount - totalPaid)
  const color = pct >= 90 ? 'bg-emerald-500' : pct >= 50 ? 'bg-green-500' : 'bg-sky-500'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>{t.debts.progress.paid(formatRupiah(totalPaid))}</span>
        <span>{t.debts.progress.remaining(formatRupiah(remaining))}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
