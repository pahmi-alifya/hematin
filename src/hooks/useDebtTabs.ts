'use client'

import { useMemo, useState } from 'react'
import { useDebtStore } from '@/stores/debtStore'
import type { Debt } from '@/types'

/** Owns tab aktif (hutang/piutang) + semua daftar & total turunannya. */
export function useDebtTabs(debts: Debt[]) {
  const { getActiveHutang, getActivePiutang, getTotalHutang, getTotalPiutang } = useDebtStore()
  const [activeTab, setActiveTab] = useState<'hutang' | 'piutang'>('hutang')

  const activeHutang = useMemo(() => getActiveHutang(), [debts])
  const activePiutang = useMemo(() => getActivePiutang(), [debts])
  const totalHutang = useMemo(() => getTotalHutang(), [debts])
  const totalPiutang = useMemo(() => getTotalPiutang(), [debts])

  const activeList = activeTab === 'hutang' ? activeHutang : activePiutang

  const paidList = useMemo(
    () => debts.filter((d) => d.type === activeTab && d.status === 'paid'),
    [debts, activeTab],
  )

  const sortedActive = useMemo(
    () =>
      [...activeList].sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1
        if (b.status === 'overdue' && a.status !== 'overdue') return 1
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return b.createdAt - a.createdAt
      }),
    [activeList],
  )

  const overdueCount = useMemo(() => activeHutang.filter((d) => d.status === 'overdue').length, [activeHutang])

  return {
    activeTab,
    setActiveTab,
    activeHutang,
    activePiutang,
    totalHutang,
    totalPiutang,
    sortedActive,
    paidList,
    overdueCount,
  }
}
