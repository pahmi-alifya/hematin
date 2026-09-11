'use client'

import { useState } from 'react'
import { format, subMonths, addMonths, parseISO } from 'date-fns'
import { getCurrentMonth, formatMonthYear } from '@/lib/utils'

/**
 * Owns navigasi bulan "yyyy-MM" (mundur/maju, dibatasi tidak lewat bulan berjalan).
 * `onChange` opsional dipanggil setiap kali bulan berpindah — dipakai caller untuk
 * efek samping masing-masing (reset filter di Transaksi, reset mode "Semua" di Laporan).
 */
export function useMonthNavigator(onChange?: (month: string) => void) {
  const [month, setMonth] = useState(getCurrentMonth())

  function prevMonth() {
    const next = format(subMonths(parseISO(month + '-01'), 1), 'yyyy-MM')
    setMonth(next)
    onChange?.(next)
  }

  function nextMonth() {
    const next = format(addMonths(parseISO(month + '-01'), 1), 'yyyy-MM')
    if (next <= getCurrentMonth()) {
      setMonth(next)
      onChange?.(next)
    }
  }

  return {
    month,
    monthLabel: formatMonthYear(month),
    isCurrentMonth: month === getCurrentMonth(),
    prevMonth,
    nextMonth,
  }
}
