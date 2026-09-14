'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'
import { useRecurringStore } from '@/stores/recurringStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useTranslation } from '@/hooks/useTranslation'
import { formatRupiahShort, getCurrentDate, getCurrentMonth } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

function getDismissKey() {
  return `hematin_recurring_dismissed_${getCurrentDate()}`
}

export function RecurringReminderBanner() {
  const { getPendingToday, updateTemplate } = useRecurringStore()
  const { addTransaction } = useTransactionStore()
  const t = useTranslation()
  const [dismissed, setDismissed] = useState(true) // true dulu sampai mount cek localStorage
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const alreadyDismissed = localStorage.getItem(getDismissKey()) === '1'
    setDismissed(alreadyDismissed)
  }, [])

  const pending = getPendingToday()

  if (dismissed || pending.length === 0) return null

  const previewText = pending
    .slice(0, 2)
    .map((tpl) => `${tpl.merchant || tpl.notes || tpl.category} ${formatRupiahShort(tpl.amount)}`)
    .join(' + ')
  const extraCount = pending.length > 2 ? pending.length - 2 : 0

  function handleNanti() {
    localStorage.setItem(getDismissKey(), '1')
    setDismissed(true)
  }

  async function handleCatatSekarang() {
    setLoading(true)
    const today = getCurrentDate()
    const currentMonth = getCurrentMonth()
    try {
      for (const tpl of pending) {
        await addTransaction({
          type: tpl.type,
          amount: tpl.amount,
          category: tpl.category,
          merchant: tpl.merchant,
          notes: tpl.notes,
          date: today,
          source: 'recurring',
          recurringId: tpl.id,
        })
        await updateTemplate(tpl.id, { lastGeneratedMonth: currentMonth })
      }
      toast(t.dashboard.recurringRecordedSuccess(pending.length), 'success')
      localStorage.setItem(getDismissKey(), '1')
      setDismissed(true)
    } catch {
      toast(t.dashboard.recurringRecordError, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-200 dark:border-sky-800/60 overflow-hidden"
      >
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  🔁 {t.dashboard.recurringTodayCount(pending.length)}
                </p>
                {previewText && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {previewText}
                    {extraCount > 0 ? ` ${t.dashboard.andMore(extraCount)}` : ''}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleNanti}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCatatSekarang}
              disabled={loading}
              className="flex-1 h-9 rounded-xl bg-sky-500 text-white text-sm font-semibold disabled:opacity-60 transition-opacity"
            >
              {loading ? t.dashboard.recording : t.dashboard.recordNow}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNanti}
              className="px-4 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold"
            >
              {t.dashboard.later}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
