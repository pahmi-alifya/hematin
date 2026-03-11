'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Camera, Plus, TrendingUp, TrendingDown, Minus, Settings } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BottomNav } from '@/components/layout/BottomNav'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionList } from '@/components/transactions/TransactionList'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { MiniChart } from '@/components/dashboard/MiniChart'
import { AIInsightCard } from '@/components/dashboard/AIInsightCard'
import { DebtReminderBanner } from '@/components/dashboard/DebtReminderBanner'
import { RecurringReminderBanner } from '@/components/dashboard/RecurringReminderBanner'
import { formatRupiah, getCurrentMonth } from '@/lib/utils'
import { useDebtStore } from '@/stores/debtStore'
import { useRecurringStore } from '@/stores/recurringStore'

function CashFlowStatus({ balance }: { balance: number }) {
  if (balance > 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-full">
      <TrendingUp className="w-3 h-3" /> Aman
    </span>
  )
  if (balance < 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50/80 px-2 py-0.5 rounded-full">
      <TrendingDown className="w-3 h-3" /> Perlu Hati-hati
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50/80 px-2 py-0.5 rounded-full">
      <Minus className="w-3 h-3" /> Waspada
    </span>
  )
}

export default function DashboardPage() {
  const { transactions, isLoading, loadTransactions } = useTransactionStore()
  const { loadSettings } = useSettingsStore()
  const { loadDebts } = useDebtStore()
  const { loadTemplates } = useRecurringStore()
  const [showForm, setShowForm] = useState(false)
  const [mounted, setMounted] = useState(false)

  const currentMonth = getCurrentMonth()
  const monthLabel = format(new Date(), 'MMMM yyyy', { locale: id })

  useEffect(() => {
    setMounted(true)
    loadTransactions()
    loadSettings()
    loadDebts()
    loadTemplates()
  }, [loadTransactions, loadSettings, loadDebts, loadTemplates])

  const monthlyTransactions = useMemo(
    () => transactions.filter((t) => t.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  )

  const income = useMemo(
    () => monthlyTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [monthlyTransactions]
  )
  const expense = useMemo(
    () => monthlyTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [monthlyTransactions]
  )
  const balance = income - expense

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden pt-14"
        style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 60%, #7DD3FC 100%)' }}
      >
        {/* Settings link */}
        <Link
          href="/settings"
          className="absolute top-3 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white"
        >
          <Settings className="w-5 h-5" />
        </Link>

        <div className="px-5 pt-4 pb-8">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
            {monthLabel}
          </p>
          <p className="text-sm text-white/80 mb-1">Saldo Bulan Ini</p>
          <motion.p
            key={balance}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white tracking-tight mb-2"
          >
            {balance >= 0 ? '' : '-'}{formatRupiah(Math.abs(balance))}
          </motion.p>
          <CashFlowStatus balance={balance} />
        </div>

        {/* Summary Cards */}
        <div className="mx-4 mb-0 grid grid-cols-2 gap-3 pb-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-white/80" />
              <span className="text-xs text-white/80 font-medium">Pemasukan</span>
            </div>
            <p className="text-lg font-bold text-white">{formatRupiah(income)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-white/80" />
              <span className="text-xs text-white/80 font-medium">Pengeluaran</span>
            </div>
            <p className="text-lg font-bold text-white">{formatRupiah(expense)}</p>
          </motion.div>
        </div>

        {/* Wave bottom */}
        <div className="h-6 bg-sky-50 dark:bg-[#0B1120]" style={{ borderTopLeftRadius: '28px', borderTopRightRadius: '28px' }} />
      </div>

      <PageWrapper className="mt-0">
        <div className="space-y-4 pb-28">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(true)}
              className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-800/60 rounded-2xl py-5 shadow-sm border border-sky-100 dark:border-slate-700/60 active:bg-sky-50 dark:active:bg-slate-700"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Catat Transaksi</span>
            </motion.button>

            <Link href="/scan">
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-800/60 rounded-2xl py-5 shadow-sm border border-sky-100 dark:border-slate-700/60 active:bg-sky-50 dark:active:bg-slate-700 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Scan Struk</span>
              </motion.div>
            </Link>
          </div>

          {/* Recurring Reminder Banner */}
          <RecurringReminderBanner />

          {/* Debt Reminder Banner */}
          <DebtReminderBanner />

          {/* AI Insight Card */}
          <AIInsightCard />

          {/* Mini Chart */}
          {monthlyTransactions.length > 0 && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
              <MiniChart transactions={transactions} />
            </div>
          )}

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Transaksi Bulan Ini</h2>
              <Link href="/transactions" className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                Lihat semua →
              </Link>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 overflow-hidden">
              <TransactionList
                month={currentMonth}
                onAddClick={() => setShowForm(true)}
              />
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Bottom Nav */}
      <BottomNav onFabClick={() => setShowForm(true)} />

      {/* Add Transaction Sheet */}
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
