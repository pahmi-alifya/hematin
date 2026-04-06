'use client'

import { motion } from 'framer-motion'
import { getCategoryById } from '@/lib/categories'
import { formatRupiah, formatRelativeDate } from '@/lib/utils'
import type { Transaction } from '@/types'

interface TransactionItemProps {
  transaction: Transaction
  onPress?: () => void
  index?: number
}

const TYPE_CONFIG = {
  income:  { prefix: '+', colorClass: 'text-emerald-600 dark:text-emerald-400' },
  expense: { prefix: '-', colorClass: 'text-slate-700 dark:text-slate-300' },
  saving:  { prefix: '→', colorClass: 'text-teal-600 dark:text-teal-400' },
}

export function TransactionItem({ transaction, onPress, index = 0 }: TransactionItemProps) {
  const cat = getCategoryById(transaction.category, transaction.type)
  const { prefix, colorClass } = TYPE_CONFIG[transaction.type] ?? TYPE_CONFIG.expense

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700 transition-colors text-left"
    >
      {/* Category Icon */}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: cat?.bgColor ?? '#F1F5F9' }}
      >
        {cat?.icon ?? '📦'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
          {transaction.merchant || cat?.name || transaction.category}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {cat?.name}
          {transaction.notes && ` · ${transaction.notes}`}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${colorClass}`}>
          {prefix}{formatRupiah(transaction.amount)}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {transaction.source === 'scan' ? '📷' : transaction.source === 'recurring' ? '🔁' : '✏️'}
        </p>
      </div>
    </motion.button>
  )
}
