export type TransactionType = 'income' | 'expense' | 'saving'

/** Label Indonesia untuk tiap tipe transaksi — dipakai di detail sheet & ringkasan. */
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Pemasukan',
  expense: 'Pengeluaran',
  saving: 'Tabungan / Investasi',
}

/** Prefix tanda +/-/→ di depan nominal, konsisten di semua tampilan transaksi. */
export const TRANSACTION_TYPE_PREFIX: Record<TransactionType, string> = {
  income: '+',
  expense: '-',
  saving: '→',
}

/** Toggle tipe transaksi (emoji + warna aktif) — dipakai di TransactionForm & form recurring. */
export const TRANSACTION_TYPE_TOGGLE: {
  value: TransactionType
  label: string
  activeClass: string
}[] = [
  { value: 'expense', label: '💸 Keluar', activeClass: 'text-red-500' },
  { value: 'income', label: '💰 Masuk', activeClass: 'text-emerald-500' },
  { value: 'saving', label: '🏦 Tabungan', activeClass: 'text-teal-600 dark:text-teal-400' },
]

export type TypeFilter = 'all' | TransactionType

export const TYPE_FILTERS: { value: TypeFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'Semua', icon: '📋' },
  { value: 'income', label: 'Masuk', icon: '💰' },
  { value: 'expense', label: 'Keluar', icon: '💸' },
  { value: 'saving', label: 'Tabungan', icon: '🏦' },
]

export type SortBy = 'newest' | 'oldest' | 'largest' | 'smallest'

export const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'largest', label: 'Terbesar' },
  { value: 'smallest', label: 'Terkecil' },
]
