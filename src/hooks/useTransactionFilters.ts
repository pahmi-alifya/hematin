'use client'

import { useMemo, useState } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, SAVING_CATEGORIES } from '@/lib/categories'
import { useMonthNavigator } from './useMonthNavigator'
import type { TypeFilter, SortBy } from '@/lib/transactions'
import type { Transaction } from '@/types'

function matchesSearch(t: Transaction, query: string): boolean {
  const q = query.toLowerCase()
  return (
    !!t.merchant?.toLowerCase().includes(q) ||
    !!t.notes?.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q)
  )
}

/**
 * Owns month/search/type/category/sort state untuk halaman Transaksi, plus semua
 * derivasi (kategori tersedia bulan ini, list & summary stats hasil filter).
 */
export function useTransactionFilters(transactions: Transaction[]) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')

  function resetFilters() {
    setTypeFilter('all')
    setCategoryFilter('all')
    setSearch('')
  }

  /** Reset khusus tombol Filter (tipe/kategori/sort) - search punya tombol clear sendiri. */
  function resetSheetFilters() {
    setTypeFilter('all')
    setCategoryFilter('all')
    setSortBy('newest')
  }

  const { month, monthLabel, isCurrentMonth, prevMonth, nextMonth } = useMonthNavigator(resetFilters)

  function handleTypeChange(t: TypeFilter) {
    setTypeFilter(t)
    setCategoryFilter('all')
  }

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

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((t) => t.date.startsWith(month))
    if (search) result = result.filter((t) => matchesSearch(t, search))
    if (typeFilter !== 'all') result = result.filter((t) => t.type === typeFilter)
    if (categoryFilter !== 'all') result = result.filter((t) => t.category === categoryFilter)

    return [...result].sort((a, b) => {
      if (sortBy === 'oldest') return a.createdAt - b.createdAt
      if (sortBy === 'largest') return b.amount - a.amount
      if (sortBy === 'smallest') return a.amount - b.amount
      return b.createdAt - a.createdAt // newest (default)
    })
  }, [transactions, month, search, typeFilter, categoryFilter, sortBy])

  // Summary stats diturunkan dari filteredTransactions (sort tidak mengubah totalnya)
  const filteredStats = useMemo(() => {
    const incomeList = filteredTransactions.filter((t) => t.type === 'income')
    const expenseList = filteredTransactions.filter((t) => t.type === 'expense')
    const savingList = filteredTransactions.filter((t) => t.type === 'saving')
    return {
      incomeTotal: incomeList.reduce((s, t) => s + t.amount, 0),
      incomeCount: incomeList.length,
      expenseTotal: expenseList.reduce((s, t) => s + t.amount, 0),
      expenseCount: expenseList.length,
      savingTotal: savingList.reduce((s, t) => s + t.amount, 0),
      savingCount: savingList.length,
      total: filteredTransactions.length,
    }
  }, [filteredTransactions])

  // Badge tombol Filter - cuma tipe/kategori/sort, search dihitung terpisah (ada clear-nya sendiri).
  const activeSheetFiltersCount = [typeFilter !== 'all', categoryFilter !== 'all', sortBy !== 'newest'].filter(Boolean).length

  return {
    month,
    monthLabel,
    isCurrentMonth,
    prevMonth,
    nextMonth,
    search,
    setSearch,
    typeFilter,
    handleTypeChange,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    monthCategories,
    filteredTransactions,
    filteredStats,
    activeSheetFiltersCount,
    resetFilters,
    resetSheetFilters,
  }
}
