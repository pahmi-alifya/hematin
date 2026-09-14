'use client'

import { format, parseISO } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { useDateLocale } from '@/hooks/useDateLocale'
import type { DebtPayment } from '@/types'

export function PaymentHistory({
  payments,
  totalPaid,
  remaining,
  onDeletePayment,
}: {
  payments: DebtPayment[]
  totalPaid: number
  remaining: number
  onDeletePayment: (id: string) => void
}) {
  const sorted = [...payments].sort((a, b) => b.createdAt - a.createdAt)
  const t = useTranslation()
  const dateLocale = useDateLocale()

  return (
    <div className="px-5 pb-6 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.debts.paymentHistory.totalPaid}</p>
          <p className="font-bold text-emerald-600 dark:text-emerald-400 text-base">{formatRupiah(totalPaid)}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.debts.paymentHistory.remaining}</p>
          <p className={`font-bold text-base ${remaining <= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {remaining <= 0 ? t.debts.paymentHistory.fullyPaid : formatRupiah(remaining)}
          </p>
        </div>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-4">{t.debts.paymentHistory.empty}</p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {sorted.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatRupiah(p.amount)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {format(parseISO(p.paidDate), 'd MMM yyyy', { locale: dateLocale })}
                  {p.notes && ` · ${p.notes}`}
                </p>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full shrink-0">
                {p.month}
              </span>
              <button
                onClick={() => onDeletePayment(p.id)}
                className="text-red-400 hover:text-red-600 shrink-0 active:scale-90 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
