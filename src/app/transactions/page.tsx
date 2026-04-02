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
import { ChevronLeft, ChevronRight, Search, X, RefreshCw, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getCategoryById, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories'
import { cn } from '@/lib/utils'

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

export default function TransactionsPage() {
  const { transactions, loadTransactions } = useTransactionStore()
  const [showForm, setShowForm] = useState(false)
  const [month, setMonth] = useState(getCurrentMonth())
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  function prevMonth() {
    setMonth((m) => format(subMonths(parseISO(m + '-01'), 1), 'yyyy-MM'))
    setCategoryFilter('all')
    setSearch('')
  }
  function nextMonth() {
    const next = format(addMonths(parseISO(month + '-01'), 1), 'yyyy-MM')
    if (next <= getCurrentMonth()) {
      setMonth(next)
      setCategoryFilter('all')
      setSearch('')
    }
  }

  const monthLabel = format(parseISO(month + '-01'), 'MMMM yyyy', { locale: id })
  const isCurrentMonth = month === getCurrentMonth()

  // Summary stats — mirroring filter logic in TransactionList
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
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter)
    }
    const incomeList = result.filter((t) => t.type === 'income')
    const expenseList = result.filter((t) => t.type === 'expense')
    return {
      incomeCount: incomeList.length,
      incomeTotal: incomeList.reduce((s, t) => s + t.amount, 0),
      expenseCount: expenseList.length,
      expenseTotal: expenseList.reduce((s, t) => s + t.amount, 0),
      total: result.length,
    }
  }, [transactions, month, search, categoryFilter])

  // Kategori yang muncul di bulan ini (untuk filter pills)
  const monthCategories = useMemo(() => {
    const cats = new Set(
      transactions.filter((t) => t.date.startsWith(month)).map((t) => t.category),
    )
    return ALL_CATEGORIES.filter((c) => cats.has(c.id))
  }, [transactions, month])

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

          {/* Search + Filter toolbar */}
          <div className="space-y-2">
            {/* Search bar */}
            <div className="relative flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowSearch(true)}
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
            </div>

            {/* Category filter pills */}
            {monthCategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {/* Semua */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategoryFilter('all')}
                  className={cn(
                    'shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-all',
                    categoryFilter === 'all'
                      ? 'bg-sky-500 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
                  )}
                >
                  Semua
                </motion.button>
                {monthCategories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategoryFilter(cat.id === categoryFilter ? 'all' : cat.id)}
                    className={cn(
                      'shrink-0 h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all',
                      categoryFilter === cat.id
                        ? 'bg-sky-500 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
                    )}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <motion.div
            key={`${month}-${categoryFilter}-${search}`}
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
                  {filteredStats.incomeCount} transaksi
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
                  {filteredStats.expenseCount} transaksi
                </p>
              </div>

              {/* Saldo */}
              <div className="px-3 py-3 flex flex-col gap-0.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <Wallet className="w-3 h-3 text-sky-500 shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Saldo</span>
                </div>
                <p className={`text-[13px] font-bold leading-tight truncate ${
                  filteredStats.incomeTotal - filteredStats.expenseTotal >= 0
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-rose-500 dark:text-rose-400'
                }`}>
                  {filteredStats.incomeTotal - filteredStats.expenseTotal >= 0 ? '' : '-'}
                  {formatRupiah(Math.abs(filteredStats.incomeTotal - filteredStats.expenseTotal))}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {filteredStats.total} total
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
              categoryFilter={categoryFilter}
            />
          </div>
        </div>
      </PageWrapper>

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
