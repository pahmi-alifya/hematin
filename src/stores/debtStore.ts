'use client'

import { create } from 'zustand'
import { format } from 'date-fns'
import { db } from '@/lib/db'
import { generateId } from '@/lib/utils'
import type { Debt } from '@/types'

interface DebtStore {
  debts: Debt[]
  isLoading: boolean

  loadDebts: () => Promise<void>
  addDebt: (data: Omit<Debt, 'id' | 'createdAt' | 'status'>) => Promise<void>
  markAsPaid: (id: string, notes?: string) => Promise<void>
  deleteDebt: (id: string) => Promise<void>
  updateDebt: (id: string, data: Partial<Omit<Debt, 'id'>>) => Promise<void>

  // Computed selectors
  getActiveHutang: () => Debt[]
  getActivePiutang: () => Debt[]
  getOverdueCount: () => number
  getTotalHutang: () => number
  getTotalPiutang: () => number
  getUpcomingDebts: (days?: number) => Debt[] // due within N days
}

export const useDebtStore = create<DebtStore>((set, get) => ({
  debts: [],
  isLoading: false,

  loadDebts: async () => {
    set({ isLoading: true })
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      let debts = await db.debts.orderBy('createdAt').reverse().toArray()

      // Auto-mark overdue: active debts with dueDate < today
      const overdueIds = debts
        .filter((d) => d.status === 'active' && d.dueDate && d.dueDate < today)
        .map((d) => d.id)

      if (overdueIds.length > 0) {
        await db.debts.where('id').anyOf(overdueIds).modify({ status: 'overdue' })
        debts = await db.debts.orderBy('createdAt').reverse().toArray()
      }

      set({ debts, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  addDebt: async (data) => {
    const debt: Debt = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
      status: 'active',
    }
    await db.debts.add(debt)
    await get().loadDebts()
  },

  markAsPaid: async (id, notes) => {
    await db.debts.update(id, {
      status: 'paid',
      paidAt: Date.now(),
      ...(notes ? { notes } : {}),
    })
    await get().loadDebts()
  },

  deleteDebt: async (id) => {
    await db.debts.delete(id)
    set((state) => ({ debts: state.debts.filter((d) => d.id !== id) }))
  },

  updateDebt: async (id, data) => {
    await db.debts.update(id, data)
    await get().loadDebts()
  },

  // Hutang aktif (belum lunas, baik active maupun overdue)
  getActiveHutang: () =>
    get().debts.filter((d) => d.type === 'hutang' && d.status !== 'paid'),

  // Piutang aktif
  getActivePiutang: () =>
    get().debts.filter((d) => d.type === 'piutang' && d.status !== 'paid'),

  // Jumlah hutang overdue (untuk badge nav)
  getOverdueCount: () =>
    get().debts.filter((d) => d.status === 'overdue').length,

  // Total nominal hutang yang belum lunas
  getTotalHutang: () =>
    get()
      .getActiveHutang()
      .reduce((sum, d) => sum + d.amount, 0),

  // Total nominal piutang yang belum lunas
  getTotalPiutang: () =>
    get()
      .getActivePiutang()
      .reduce((sum, d) => sum + d.amount, 0),

  // Hutang aktif yang jatuh tempo dalam N hari ke depan
  getUpcomingDebts: (days = 7) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const limit = format(new Date(Date.now() + days * 86_400_000), 'yyyy-MM-dd')
    return get().debts.filter(
      (d) =>
        d.status !== 'paid' &&
        d.dueDate &&
        d.dueDate >= today &&
        d.dueDate <= limit,
    )
  },
}))
