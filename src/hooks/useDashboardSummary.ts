'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDebtStore } from '@/stores/debtStore'
import { useRecurringStore } from '@/stores/recurringStore'
import { useGoalStore } from '@/stores/goalStore'
import { getTotalIncome, getTotalExpense, getTotalSaving } from '@/lib/calculations'
import { getCurrentMonth, formatMonthYear } from '@/lib/utils'

/** Boot semua store yang dipakai Dashboard, plus ringkasan saldo bulan berjalan & total saldo. */
export function useDashboardSummary() {
  const { transactions, loadTransactions } = useTransactionStore()
  const { loadSettings } = useSettingsStore()
  const { loadDebts } = useDebtStore()
  const { loadTemplates } = useRecurringStore()
  const { loadGoals } = useGoalStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadTransactions()
    loadSettings()
    loadDebts()
    loadTemplates()
    loadGoals()
  }, [loadTransactions, loadSettings, loadDebts, loadTemplates, loadGoals])

  const currentMonth = getCurrentMonth()
  const monthLabel = formatMonthYear(currentMonth)

  const monthlyTransactions = useMemo(
    () => transactions.filter((t) => t.date.startsWith(currentMonth)),
    [transactions, currentMonth],
  )

  const incomeCount = useMemo(() => monthlyTransactions.filter((t) => t.type === 'income').length, [monthlyTransactions])
  const expenseCount = useMemo(() => monthlyTransactions.filter((t) => t.type === 'expense').length, [monthlyTransactions])
  const savingCount = useMemo(() => monthlyTransactions.filter((t) => t.type === 'saving').length, [monthlyTransactions])

  const income = useMemo(() => getTotalIncome(transactions, currentMonth), [transactions, currentMonth])
  const expense = useMemo(() => getTotalExpense(transactions, currentMonth), [transactions, currentMonth])
  const saving = useMemo(() => getTotalSaving(transactions, currentMonth), [transactions, currentMonth])

  const totalBalance = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const totalSaving = transactions.filter((t) => t.type === 'saving').reduce((s, t) => s + t.amount, 0)
    return totalIncome - totalExpense - totalSaving
  }, [transactions])

  return {
    transactions,
    mounted,
    currentMonth,
    monthLabel,
    income,
    expense,
    saving,
    incomeCount,
    expenseCount,
    savingCount,
    totalBalance,
  }
}
