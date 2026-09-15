export type TransactionType = 'income' | 'expense' | 'saving'

/** Prefix tanda +/-/→ di depan nominal, konsisten di semua tampilan transaksi. */
export const TRANSACTION_TYPE_PREFIX: Record<TransactionType, string> = {
  income: '+',
  expense: '-',
  saving: '→',
}

/** Key dictionary (`t.transactions.<key>`) untuk label singkat tiap tipe transaksi. */
export type TransactionTypeLabelKey = 'typeShortIncome' | 'typeShortExpense' | 'typeShortSaving'

/**
 * Toggle tipe transaksi (emoji + warna aktif) - dipakai di TransactionForm & form recurring.
 * `labelKey` dipakai untuk lookup dictionary (`t.transactions[labelKey]`) sesuai bahasa aktif.
 */
export const TRANSACTION_TYPE_TOGGLE: {
  value: TransactionType
  labelKey: TransactionTypeLabelKey
  activeClass: string
}[] = [
    { value: 'expense', labelKey: 'typeShortExpense', activeClass: 'text-red-500' },
    { value: 'income', labelKey: 'typeShortIncome', activeClass: 'text-emerald-500' },
    { value: 'saving', labelKey: 'typeShortSaving', activeClass: 'text-teal-600 dark:text-teal-400' },
  ]

export type TypeFilter = 'all' | TransactionType

export const TYPE_FILTERS: { value: TypeFilter; labelKey: 'typeShortAll' | TransactionTypeLabelKey; icon: string }[] = [
  { value: 'all', labelKey: 'typeShortAll', icon: '📋' },
  { value: 'income', labelKey: 'typeShortIncome', icon: '💰' },
  { value: 'expense', labelKey: 'typeShortExpense', icon: '💸' },
  { value: 'saving', labelKey: 'typeShortSaving', icon: '🏦' },
]

export type SortBy = 'newest' | 'oldest' | 'largest' | 'smallest'

export const SORT_OPTIONS: { value: SortBy; labelKey: 'sortNewest' | 'sortOldest' | 'sortLargest' | 'sortSmallest' }[] = [
  { value: 'newest', labelKey: 'sortNewest' },
  { value: 'oldest', labelKey: 'sortOldest' },
  { value: 'largest', labelKey: 'sortLargest' },
  { value: 'smallest', labelKey: 'sortSmallest' },
]
