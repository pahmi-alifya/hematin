'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BottomNav } from '@/components/layout/BottomNav'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionList } from '@/components/transactions/TransactionList'
import { useTransactionStore } from '@/stores/transactionStore'
import { getCurrentMonth } from '@/lib/utils'
import { format, subMonths, addMonths, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Search, X, RefreshCw } from 'lucide-react'
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
          <Link
            href="/recurring"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Rutin
          </Link>
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

      <BottomNav onFabClick={() => setShowForm(true)} />

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
