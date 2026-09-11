'use client'

import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { CheckCircle2, CreditCard, History, Trash2 } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { getDueDateLabel } from '@/lib/debts'
import { useCanEditActiveWallet } from '@/hooks/useCanEditActiveWallet'
import { StatusBadge } from './StatusBadge'
import { CicilanProgress } from './CicilanProgress'
import type { Debt } from '@/types'

export function DebtCard({
  debt,
  index,
  totalPaid,
  onMarkPaid,
  onDelete,
  onTap,
  onPayCicilan,
  onShowHistory,
}: {
  debt: Debt
  index: number
  totalPaid: number
  onMarkPaid: (debt: Debt) => void
  onDelete: (debt: Debt) => void
  onTap: (debt: Debt) => void
  onPayCicilan: (debt: Debt) => void
  onShowHistory: (debt: Debt) => void
}) {
  const canEdit = useCanEditActiveWallet()
  const isPaid = debt.status === 'paid'
  const isOverdue = debt.status === 'overdue'
  const { label: dueDateLabel } = debt.dueDate ? getDueDateLabel(debt.dueDate) : { label: '' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border p-4 transition-all ${
        isOverdue
          ? 'border-red-200 dark:border-red-800/60 bg-red-50/40 dark:bg-red-900/10'
          : isPaid
          ? 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 opacity-60'
          : 'border-sky-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/60'
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <button onClick={() => onTap(debt)} className="flex-1 text-left">
          <p className={`font-bold text-base ${isPaid ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {debt.person}
          </p>
          {debt.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {debt.description}
            </p>
          )}
        </button>
        <div className="text-right shrink-0">
          <p className={`text-lg font-bold ${
            debt.type === 'hutang' ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {debt.type === 'hutang' ? '-' : '+'}{formatRupiah(debt.amount)}
          </p>
          {debt.isCicilan && debt.cicilanAmount && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Cicilan {formatRupiah(debt.cicilanAmount)}/bln
            </p>
          )}
        </div>
      </div>

      {/* Status + due date */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <StatusBadge status={debt.status} dueDate={debt.dueDate} isCicilan={debt.isCicilan} />
        {!debt.isCicilan && debt.dueDate && !isPaid && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {debt.status === 'overdue' ? dueDateLabel : `Jatuh tempo ${dueDateLabel}`}
          </span>
        )}
        {debt.isCicilan && debt.cicilanDay && !isPaid && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Tiap tgl {debt.cicilanDay}
          </span>
        )}
        {isPaid && debt.paidAt && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Lunas {format(new Date(debt.paidAt), 'd MMM yyyy', { locale: id })}
          </span>
        )}
      </div>

      {/* Progress bar for cicilan */}
      {debt.isCicilan && !isPaid && (
        <div className="mb-3">
          <CicilanProgress debt={debt} totalPaid={totalPaid} />
        </div>
      )}

      {/* Actions */}
      {!isPaid && (
        <div className="flex gap-2">
          {debt.isCicilan ? (
            <>
              {canEdit && (
                <button
                  onClick={() => onPayCicilan(debt)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold active:scale-95 transition-transform"
                >
                  <CreditCard className="w-4 h-4" /> Bayar Cicilan
                </button>
              )}
              <button
                onClick={() => onShowHistory(debt)}
                className="w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 active:scale-95 transition-transform"
              >
                <History className="w-4 h-4" />
              </button>
            </>
          ) : canEdit ? (
            <button
              onClick={() => onMarkPaid(debt)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold active:scale-95 transition-transform"
            >
              <CheckCircle2 className="w-4 h-4" /> Tandai Lunas
            </button>
          ) : null}
          {canEdit && (
            <button
              onClick={() => onDelete(debt)}
              className="w-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 active:scale-95 transition-transform"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      {isPaid && (
        <div className="flex gap-2">
          {debt.isCicilan && (
            <button
              onClick={() => onShowHistory(debt)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-slate-400 dark:text-slate-500 text-xs active:scale-95"
            >
              <History className="w-3.5 h-3.5" /> Riwayat
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => onDelete(debt)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-slate-400 dark:text-slate-500 text-xs active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus catatan
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
