'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { CreditCard, X } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import type { Debt } from '@/types'

export function CicilanReminderBanner({
  debts,
  onPayNow,
}: {
  debts: Debt[]
  onPayNow: (debt: Debt) => void
}) {
  const [dismissed, setDismissed] = useState(false)
  const dismissKey = `hematin_cicilan_dismissed_${format(new Date(), 'yyyy-MM-dd')}`

  useEffect(() => {
    setDismissed(localStorage.getItem(dismissKey) === '1')
  }, [dismissKey])

  if (dismissed || debts.length === 0) return null

  function handleDismiss() {
    localStorage.setItem(dismissKey, '1')
    setDismissed(true)
  }

  const preview = debts
    .slice(0, 2)
    .map((d) => `${d.person} ${formatRupiah(d.cicilanAmount ?? 0)}`)
    .join(' · ')

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl px-4 py-3"
    >
      <div className="flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            {debts.length} cicilan jatuh tempo hari ini
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 truncate mt-0.5">{preview}</p>
          <button
            onClick={() => onPayNow(debts[0])}
            className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300 underline underline-offset-2"
          >
            Catat Pembayaran
          </button>
        </div>
        <button onClick={handleDismiss} className="text-amber-400 hover:text-amber-600 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}
