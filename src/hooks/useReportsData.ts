'use client'

import { useMemo, useState } from 'react'
import { format, parseISO, getDaysInMonth } from 'date-fns'
import { getCategoryById, getCategoryLabel } from '@/lib/categories'
import { groupSumByCategory } from '@/lib/calculations'
import { getCurrentMonth } from '@/lib/utils'
import { useMonthNavigator } from './useMonthNavigator'
import { useTranslation } from './useTranslation'
import { useDateLocale } from './useDateLocale'
import { useLanguageStore } from '@/stores/languageStore'
import type { Language } from '@/stores/languageStore'
import type { TransactionType } from '@/lib/transactions'
import type { Transaction } from '@/types'

interface DonutDatum {
  id: string
  name: string
  icon: string
  amount: number
  color: string
  bgColor: string
}

const DONUT_FALLBACK: Record<TransactionType, { icon: string; color: string; bgColor: string }> = {
  expense: { icon: '📦', color: '#64748B', bgColor: '#F1F5F9' },
  income: { icon: '💰', color: '#10B981', bgColor: '#ECFDF5' },
  saving: { icon: '🏦', color: '#0D9488', bgColor: '#CCFBF1' },
}

function buildDonutData(transactions: Transaction[], type: TransactionType, language: Language): DonutDatum[] {
  const map = groupSumByCategory(transactions, type)
  const fallback = DONUT_FALLBACK[type]
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([catId, amount]) => {
      const cat = getCategoryById(catId, type)
      return {
        id: catId,
        name: getCategoryLabel(cat, language) ?? catId,
        icon: cat?.icon ?? fallback.icon,
        amount,
        color: cat?.color ?? fallback.color,
        bgColor: cat?.bgColor ?? fallback.bgColor,
      }
    })
}

/** Owns state & derivasi halaman Laporan: filter bulan/"Semua", totals, donut per tipe, statistik harian. */
export function useReportsData(transactions: Transaction[]) {
  const t = useTranslation()
  const dateLocale = useDateLocale()
  const language = useLanguageStore((s) => s.language)
  const [showAll, setShowAll] = useState(false)
  const { month, monthLabel, isCurrentMonth, prevMonth, nextMonth } = useMonthNavigator(() => setShowAll(false))

  function showAllTime() {
    setShowAll(true)
  }

  const filteredTx = useMemo(
    () => (showAll ? transactions : transactions.filter((t) => t.date.startsWith(month))),
    [transactions, month, showAll],
  )

  const income = useMemo(
    () => filteredTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [filteredTx],
  )
  const expense = useMemo(
    () => filteredTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [filteredTx],
  )
  const saving = useMemo(
    () => filteredTx.filter((t) => t.type === 'saving').reduce((s, t) => s + t.amount, 0),
    [filteredTx],
  )
  const savingRate = income > 0 ? Math.round((saving / income) * 100) : 0

  const donutData = useMemo(() => buildDonutData(filteredTx, 'expense', language), [filteredTx, language])
  const incomeDonutData = useMemo(() => buildDonutData(filteredTx, 'income', language), [filteredTx, language])
  const savingDonutData = useMemo(() => buildDonutData(filteredTx, 'saving', language), [filteredTx, language])

  // Daily stats (hanya untuk bulan spesifik, bukan "Semua")
  const dailyStats = useMemo(() => {
    if (showAll) return null
    const monthDate = parseISO(month + '-01')
    const daysInMonth = getDaysInMonth(monthDate)
    const daysElapsed = isCurrentMonth ? new Date().getDate() : daysInMonth

    const avgExpense = daysElapsed > 0 ? expense / daysElapsed : 0
    const avgIncome = daysElapsed > 0 ? income / daysElapsed : 0
    const avgSaving = daysElapsed > 0 ? saving / daysElapsed : 0

    // Hari paling boros
    const expenseByDay: Record<string, number> = {}
    filteredTx
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseByDay[t.date] = (expenseByDay[t.date] ?? 0) + t.amount
      })
    const busiestEntry = Object.entries(expenseByDay).sort(([, a], [, b]) => b - a)[0]
    const busiestDay = busiestEntry ? format(parseISO(busiestEntry[0]), 'EEE, d MMM', { locale: dateLocale }) : null
    const busiestAmount = busiestEntry?.[1] ?? 0

    // Hari aktif (ada transaksi apapun)
    const activeDates = new Set(filteredTx.map((tx) => tx.date))
    const activeDays = activeDates.size

    // Proyeksi akhir bulan (bulan berjalan) atau realisasi (bulan lampau)
    const projection = isCurrentMonth ? Math.round(avgExpense * daysInMonth) : expense
    const projectionLabel = isCurrentMonth ? t.reports.projectionEndOfMonth : t.reports.projectionRealized

    return {
      avgExpense,
      avgIncome,
      avgSaving,
      busiestDay,
      busiestAmount,
      activeDays,
      daysElapsed,
      daysInMonth,
      projection,
      projectionLabel,
    }
  }, [showAll, month, isCurrentMonth, expense, income, saving, filteredTx, dateLocale, t])

  return {
    month,
    monthLabel,
    isCurrentMonth,
    showAll,
    showAllTime,
    prevMonth,
    nextMonth,
    filteredTx,
    income,
    expense,
    saving,
    savingRate,
    donutData,
    incomeDonutData,
    savingDonutData,
    dailyStats,
  }
}
