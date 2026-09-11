'use client'

import { useState } from 'react'
import type { Debt } from '@/types'

/** Owns visibilitas semua bottom sheet di halaman Utang & Piutang. */
export function useDebtSheets() {
  const [showAdd, setShowAdd] = useState(false)
  const [showPaidSheet, setShowPaidSheet] = useState<Debt | null>(null)
  const [showDetail, setShowDetail] = useState<Debt | null>(null)
  const [showPaidList, setShowPaidList] = useState(false)
  const [showPaymentSheet, setShowPaymentSheet] = useState<Debt | null>(null)
  const [showHistory, setShowHistory] = useState<Debt | null>(null)

  return {
    showAdd,
    openAdd: () => setShowAdd(true),
    closeAdd: () => setShowAdd(false),

    showPaidSheet,
    openPaidSheet: setShowPaidSheet,
    closePaidSheet: () => setShowPaidSheet(null),

    showDetail,
    openDetail: setShowDetail,
    closeDetail: () => setShowDetail(null),

    showPaidList,
    togglePaidList: () => setShowPaidList((v) => !v),

    showPaymentSheet,
    openPaymentSheet: setShowPaymentSheet,
    closePaymentSheet: () => setShowPaymentSheet(null),

    showHistory,
    openHistory: setShowHistory,
    closeHistory: () => setShowHistory(null),
  }
}
