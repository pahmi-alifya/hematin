import { CheckCircle2, AlertCircle, CreditCard, Clock } from 'lucide-react'
import { getDueDateLabel } from '@/lib/debts'
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguageStore } from '@/stores/languageStore'
import type { Debt } from '@/types'

export function StatusBadge({
  status,
  dueDate,
  isCicilan,
}: {
  status: Debt['status']
  dueDate?: string
  isCicilan?: boolean
}) {
  const t = useTranslation()
  const language = useLanguageStore((s) => s.language)

  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> {t.debts.badge.paid}
      </span>
    )
  }
  if (status === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3" /> {isCicilan ? t.debts.badge.overdueCicilan : t.debts.badge.overdueDue}
      </span>
    )
  }
  if (status === 'partial') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
        <CreditCard className="w-3 h-3" /> {t.debts.badge.partial}
      </span>
    )
  }
  if (isCicilan) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-400 px-2 py-0.5 rounded-full">
        <CreditCard className="w-3 h-3" /> {t.debts.badge.cicilan}
      </span>
    )
  }
  if (dueDate) {
    const { label, urgent } = getDueDateLabel(dueDate, language)
    if (urgent) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" /> {label}
        </span>
      )
    }
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-400 px-2 py-0.5 rounded-full">
      {t.debts.badge.active}
    </span>
  )
}
