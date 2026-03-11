'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, subMonths, addMonths, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BottomNav } from '@/components/layout/BottomNav'
import { EmptyState } from '@/components/ui/EmptyState'
import { CashFlowChart } from '@/components/reports/CashFlowChart'
import { CategoryDonut } from '@/components/reports/CategoryDonut'
import { useTransactionStore } from '@/stores/transactionStore'
import { EXPENSE_CATEGORIES } from '@/lib/categories'
import { formatRupiah, getCurrentMonth, cn } from '@/lib/utils'

export default function ReportsPage() {
  const { transactions, isLoading, loadTransactions } = useTransactionStore()
  const [month, setMonth] = useState(getCurrentMonth())
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  function prevMonth() {
    setShowAll(false)
    setMonth((m) => format(subMonths(parseISO(m + '-01'), 1), 'yyyy-MM'))
  }

  function nextMonth() {
    const next = format(addMonths(parseISO(month + '-01'), 1), 'yyyy-MM')
    if (next <= getCurrentMonth()) {
      setShowAll(false)
      setMonth(next)
    }
  }

  const isCurrentMonth = month === getCurrentMonth()
  const monthLabel = format(parseISO(month + '-01'), 'MMMM yyyy', { locale: id })

  const filteredTx = useMemo(
    () => showAll ? transactions : transactions.filter((t) => t.date.startsWith(month)),
    [transactions, month, showAll]
  )

  const income = useMemo(() => filteredTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0), [filteredTx])
  const expense = useMemo(() => filteredTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [filteredTx])

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {}
    filteredTx.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + t.amount
    })
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
  }, [filteredTx])

  const donutData = useMemo(() =>
    byCategory.map(([catId, amount]) => {
      const cat = EXPENSE_CATEGORIES.find((c) => c.id === catId)
      return {
        id: catId,
        name: cat?.name ?? catId,
        icon: cat?.icon ?? '📦',
        amount,
        color: cat?.color ?? '#64748B',
        bgColor: cat?.bgColor ?? '#F1F5F9',
      }
    }),
    [byCategory]
  )

  // Number of months to display in CashFlowChart when showing all data
  const chartMonthsCount = useMemo(() => {
    if (!showAll || transactions.length === 0) return 4
    const months = new Set(transactions.map((t) => t.date.slice(0, 7)))
    return Math.max(4, months.size)
  }, [showAll, transactions])

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title="Laporan" />

      <PageWrapper>
        <div className="pb-28 space-y-4">
          {/* Month Navigator */}
          <div className="flex items-center bg-white dark:bg-slate-800/60 rounded-2xl px-3 py-3 shadow-sm border border-sky-100 dark:border-slate-700/60 gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAll(true)}
              className={cn(
                'shrink-0 h-7 px-2.5 rounded-xl text-xs font-semibold transition-all',
                showAll
                  ? 'bg-sky-500 text-white'
                  : 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
              )}
            >
              Semua
            </motion.button>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

            <div className="flex-1 flex items-center justify-between">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={prevMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {showAll ? 'Semua Data' : monthLabel}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={nextMonth}
                disabled={showAll || isCurrentMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pemasukan</span>
              </div>
              <p className="text-lg font-bold text-emerald-600">{formatRupiah(income)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pengeluaran</span>
              </div>
              <p className="text-lg font-bold text-red-500">{formatRupiah(expense)}</p>
            </div>
          </div>

          {/* Cash Flow Chart */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
              {showAll ? 'Arus Kas Semua Bulan' : 'Arus Kas 4 Bulan'}
            </p>
            {isLoading ? (
              <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
            ) : transactions.length === 0 ? (
              <EmptyState
                icon="📊"
                title="Belum ada data"
                description="Mulai catat transaksi untuk melihat laporan"
                className="py-8"
              />
            ) : (
              <CashFlowChart
                transactions={transactions}
                currentMonth={getCurrentMonth()}
                months={chartMonthsCount}
              />
            )}
          </div>

          {/* Category Donut */}
          {donutData.length > 0 && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Distribusi Pengeluaran</p>
              <CategoryDonut data={donutData} total={expense} />
            </div>
          )}

          {/* Net Cash Flow */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Net Cash Flow</p>
              <p className={`text-xl font-bold ${income - expense >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {income - expense >= 0 ? '+' : ''}{formatRupiah(income - expense)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Total Transaksi</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{filteredTx.length}</p>
            </div>
          </div>

          {/* Avg daily — only for specific month */}
          {!showAll && expense > 0 && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Rata-rata pengeluaran/hari</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {formatRupiah(Math.round(expense / new Date().getDate()))}
                </p>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>

      <BottomNav />
    </div>
  )
}
