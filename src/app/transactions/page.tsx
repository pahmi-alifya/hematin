'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BottomNav } from '@/components/layout/BottomNav'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionList } from '@/components/transactions/TransactionList'
import { useTransactionStore } from '@/stores/transactionStore'
import { getCurrentMonth, formatRupiah } from '@/lib/utils'
import { format, subMonths, addMonths, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Search, X, RefreshCw, Plus, TrendingUp, TrendingDown, ArrowUpDown, Check } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, SAVING_CATEGORIES } from '@/lib/categories'
import { cn } from '@/lib/utils'

type TypeFilter = 'all' | 'income' | 'expense' | 'saving'
type SortBy = 'newest' | 'oldest' | 'largest' | 'smallest'

const TYPE_FILTERS: { value: TypeFilter; label: string; icon: string }[] = [
  { value: 'all',     label: 'Semua',    icon: '📋' },
  { value: 'income',  label: 'Masuk',    icon: '💰' },
  { value: 'expense', label: 'Keluar',   icon: '💸' },
  { value: 'saving',  label: 'Tabungan', icon: '🏦' },
]

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'newest',   label: 'Terbaru' },
  { value: 'oldest',   label: 'Terlama' },
  { value: 'largest',  label: 'Terbesar' },
  { value: 'smallest', label: 'Terkecil' },
]

export default function TransactionsPage() {
  const { transactions, loadTransactions } = useTransactionStore()
  const [showForm, setShowForm] = useState(false)
  const [month, setMonth] = useState(getCurrentMonth())
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [showSort, setShowSort] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  function prevMonth() {
    setMonth((m) => format(subMonths(parseISO(m + '-01'), 1), 'yyyy-MM'))
    resetFilters()
  }
  function nextMonth() {
    const next = format(addMonths(parseISO(month + '-01'), 1), 'yyyy-MM')
    if (next <= getCurrentMonth()) {
      setMonth(next)
      resetFilters()
    }
  }
  function resetFilters() {
    setTypeFilter('all')
    setCategoryFilter('all')
    setSearch('')
  }

  const monthLabel = format(parseISO(month + '-01'), 'MMMM yyyy', { locale: id })
  const isCurrentMonth = month === getCurrentMonth()

  // Kategori yang tersedia di bulan ini, difilter berdasarkan tipe aktif
  const monthCategories = useMemo(() => {
    const monthTx = transactions.filter((t) => t.date.startsWith(month))
    const filteredByType = typeFilter === 'all' ? monthTx : monthTx.filter((t) => t.type === typeFilter)
    const cats = new Set(filteredByType.map((t) => t.category))

    const pool =
      typeFilter === 'income' ? INCOME_CATEGORIES :
      typeFilter === 'expense' ? EXPENSE_CATEGORIES :
      typeFilter === 'saving' ? SAVING_CATEGORIES :
      [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...SAVING_CATEGORIES]

    return pool.filter((c) => cats.has(c.id))
  }, [transactions, month, typeFilter])

  // Reset category filter jika tipe berubah
  function handleTypeChange(t: TypeFilter) {
    setTypeFilter(t)
    setCategoryFilter('all')
  }

  // Summary stats — ikuti semua filter
  const filteredStats = useMemo(() => {
    let result = transactions.filter((t) => t.date.startsWith(month))
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.merchant?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      )
    }
    if (typeFilter !== 'all') result = result.filter((t) => t.type === typeFilter)
    if (categoryFilter !== 'all') result = result.filter((t) => t.category === categoryFilter)

    const incomeList  = result.filter((t) => t.type === 'income')
    const expenseList = result.filter((t) => t.type === 'expense')
    const savingList  = result.filter((t) => t.type === 'saving')
    return {
      incomeTotal:  incomeList.reduce((s, t) => s + t.amount, 0),
      incomeCount:  incomeList.length,
      expenseTotal: expenseList.reduce((s, t) => s + t.amount, 0),
      expenseCount: expenseList.length,
      savingTotal:  savingList.reduce((s, t) => s + t.amount, 0),
      savingCount:  savingList.length,
      total:        result.length,
    }
  }, [transactions, month, search, typeFilter, categoryFilter])

  const activeFiltersCount = [
    typeFilter !== 'all',
    categoryFilter !== 'all',
    !!search,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header
        title="Transaksi"
        rightElement={
          <div className="flex items-center gap-2">
            <Link
              href="/recurring"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Rutin
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
            </button>
          </div>
        }
      />

      <PageWrapper>
        <div className="pb-28 space-y-3">
          {/* Month Navigator */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-800/60 rounded-2xl px-4 py-3 shadow-sm border border-sky-100 dark:border-slate-700/60">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{monthLabel}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Search + Sort */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Sort button */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSort((v) => !v)}
                className={cn(
                  'h-10 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all',
                  sortBy !== 'newest'
                    ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-500 dark:text-slate-400',
                )}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
              </motion.button>

              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden min-w-[140px]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 text-sm transition-colors',
                          sortBy === opt.value
                            ? 'text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-900/20'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
                        )}
                      >
                        {opt.label}
                        {sortBy === opt.value && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Type filter pills */}
          <div className="flex gap-2">
            {TYPE_FILTERS.map((t) => (
              <motion.button
                key={t.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTypeChange(t.value)}
                className={cn(
                  'flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all',
                  typeFilter === t.value
                    ? t.value === 'income'  ? 'bg-emerald-500 text-white shadow-sm'
                    : t.value === 'expense' ? 'bg-rose-500 text-white shadow-sm'
                    : t.value === 'saving'  ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-sky-500 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
                )}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Category filter pills — adapts to active type */}
          <AnimatePresence>
            {monthCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategoryFilter('all')}
                    className={cn(
                      'shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-all',
                      categoryFilter === 'all'
                        ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
                    )}
                  >
                    Semua Kategori
                  </motion.button>
                  {monthCategories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategoryFilter(cat.id === categoryFilter ? 'all' : cat.id)}
                      className={cn(
                        'shrink-0 h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all',
                        categoryFilter === cat.id
                          ? 'text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
                      )}
                      style={categoryFilter === cat.id ? { backgroundColor: cat.color } : undefined}
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter indicator + reset */}
          <AnimatePresence>
            {activeFiltersCount > 0 && (
              <motion.button
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reset filter ({activeFiltersCount} aktif)
              </motion.button>
            )}
          </AnimatePresence>

          {/* Summary Stats */}
          <motion.div
            key={`${month}-${typeFilter}-${categoryFilter}-${search}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 overflow-hidden"
          >
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700">
              {/* Pemasukan */}
              <div className="px-3 py-3 flex flex-col gap-0.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Masuk</span>
                </div>
                <p className="text-[13px] font-bold text-emerald-500 dark:text-emerald-400 leading-tight truncate">
                  {formatRupiah(filteredStats.incomeTotal)}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {filteredStats.incomeCount}x
                </p>
              </div>

              {/* Pengeluaran */}
              <div className="px-3 py-3 flex flex-col gap-0.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <TrendingDown className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Keluar</span>
                </div>
                <p className="text-[13px] font-bold text-rose-500 dark:text-rose-400 leading-tight truncate">
                  {formatRupiah(filteredStats.expenseTotal)}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {filteredStats.expenseCount}x
                </p>
              </div>

              {/* Tabungan */}
              <div className="px-3 py-3 flex flex-col gap-0.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px]">🏦</span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Tabungan</span>
                </div>
                <p className="text-[13px] font-bold text-teal-600 dark:text-teal-400 leading-tight truncate">
                  {formatRupiah(filteredStats.savingTotal)}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {filteredStats.savingCount}x
                </p>
              </div>
            </div>
          </motion.div>

          {/* Transaction List */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 overflow-hidden">
            <TransactionList
              month={month}
              onAddClick={() => setShowForm(true)}
              search={search || undefined}
              typeFilter={typeFilter}
              categoryFilter={categoryFilter}
              sortBy={sortBy}
            />
          </div>
        </div>
      </PageWrapper>

      {/* Close sort dropdown on outside tap */}
      {showSort && (
        <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
      )}

      <BottomNav />

      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Catat Transaksi"
      >
        <TransactionForm onSuccess={() => setShowForm(false)} />
      </BottomSheet>
    </div>
  )
}
