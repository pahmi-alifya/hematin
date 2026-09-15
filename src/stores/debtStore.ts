'use client'

import { create } from 'zustand'
import { format } from 'date-fns'
import { db } from '@/lib/db'
import { generateId } from '@/lib/utils'
import { useWalletStore } from '@/stores/walletStore'
import { pushDebt, pushDebtDelete, pushDebtPayment, pushDebtPaymentDelete } from '@/lib/sync/walletSync'
import type { Debt, DebtPayment } from '@/types'

interface DebtStore {
  debts: Debt[]
  payments: DebtPayment[]
  isLoading: boolean

  loadDebts: () => Promise<void>
  addDebt: (data: Omit<Debt, 'id' | 'createdAt' | 'status' | 'walletId'>) => Promise<void>
  markAsPaid: (id: string, notes?: string) => Promise<void>
  deleteDebt: (id: string) => Promise<void>
  updateDebt: (id: string, data: Partial<Omit<Debt, 'id'>>) => Promise<void>

  // Payment actions (cicilan)
  addPayment: (data: Omit<DebtPayment, 'id' | 'createdAt' | 'walletId'>) => Promise<{ isFullyPaid: boolean }>
  deletePayment: (id: string) => Promise<void>
  getPaymentsByDebt: (debtId: string) => DebtPayment[]
  getTotalPaid: (debtId: string) => number
  getRemaining: (debtId: string) => number
  getPendingCicilanToday: () => Debt[]

  // Computed selectors
  getActiveHutang: () => Debt[]
  getActivePiutang: () => Debt[]
  getOverdueCount: () => number
  getTotalHutang: () => number
  getTotalPiutang: () => number
  getUpcomingDebts: (days?: number) => Debt[]
}

export const useDebtStore = create<DebtStore>((set, get) => ({
  debts: [],
  payments: [],
  isLoading: false,

  loadDebts: async () => {
    set({ isLoading: true })
    try {
      const walletId = useWalletStore.getState().activeWalletId
      if (!walletId) {
        set({ debts: [], payments: [], isLoading: false })
        return
      }
      const today = format(new Date(), 'yyyy-MM-dd')
      const currentMonth = format(new Date(), 'yyyy-MM')
      let debts = (
        await db.debts.where('walletId').equals(walletId).sortBy('createdAt')
      ).reverse()
      const payments = (
        await db.debtPayments.where('walletId').equals(walletId).sortBy('createdAt')
      ).reverse()

      // Build paid totals map
      const paidMap: Record<string, number> = {}
      for (const p of payments) {
        paidMap[p.debtId] = (paidMap[p.debtId] ?? 0) + p.amount
      }

      // Auto-update status for each debt
      const updates: Array<{ id: string; status: Debt['status']; paidAt?: number }> = []
      for (const d of debts) {
        const totalPaid = paidMap[d.id] ?? 0
        const remaining = d.amount - totalPaid

        if (d.status === 'paid') continue // already done

        if (remaining <= 0) {
          // fully paid via cicilan
          updates.push({ id: d.id, status: 'paid', paidAt: Date.now() })
        } else if (d.isCicilan) {
          // check if this month's cicilan is overdue
          const todayDate = new Date()
          const day = todayDate.getDate()
          const paidThisMonth = payments.some(
            (p) => p.debtId === d.id && p.month === currentMonth,
          )
          if (
            !paidThisMonth &&
            d.cicilanDay !== undefined &&
            day > d.cicilanDay &&
            d.cicilanStartMonth &&
            currentMonth >= d.cicilanStartMonth
          ) {
            updates.push({ id: d.id, status: 'overdue' })
          } else if (totalPaid > 0) {
            updates.push({ id: d.id, status: 'partial' })
          }
        } else {
          // non-cicilan: overdue by dueDate
          if (d.dueDate && d.dueDate < today && d.status === 'active') {
            updates.push({ id: d.id, status: 'overdue' })
          }
        }
      }

      if (updates.length > 0) {
        await Promise.all(
          updates.map(({ id, ...data }) => db.debts.update(id, data)),
        )
        debts = (
          await db.debts.where('walletId').equals(walletId).sortBy('createdAt')
        ).reverse()
      }

      set({ debts, payments, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  addDebt: async (data) => {
    const walletId = useWalletStore.getState().activeWalletId
    if (!walletId) return
    const debt: Debt = {
      ...data,
      walletId,
      id: generateId(),
      createdAt: Date.now(),
      status: 'active',
    }
    await db.debts.add(debt)
    await get().loadDebts()
    pushDebt(walletId, debt)
  },

  markAsPaid: async (id, notes) => {
    await db.debts.update(id, {
      status: 'paid',
      paidAt: Date.now(),
      ...(notes ? { notes } : {}),
    })
    await get().loadDebts()
    const updated = await db.debts.get(id)
    if (updated) pushDebt(updated.walletId, updated)
  },

  deleteDebt: async (id) => {
    const walletId = get().debts.find((d) => d.id === id)?.walletId
    await db.debts.delete(id)
    // cascade delete payments - cloud_debt_payments ikut cascade lewat FK on delete cascade
    await db.debtPayments.where('debtId').equals(id).delete()
    await get().loadDebts()
    if (walletId) pushDebtDelete(walletId, id)
  },

  updateDebt: async (id, data) => {
    await db.debts.update(id, data)
    await get().loadDebts()
    const updated = await db.debts.get(id)
    if (updated) pushDebt(updated.walletId, updated)
  },

  // ─── Cicilan Payment Actions ──────────────────────────────────────────────

  addPayment: async (data) => {
    const walletId = useWalletStore.getState().activeWalletId
    if (!walletId) return { isFullyPaid: false }
    const payment: DebtPayment = {
      ...data,
      walletId,
      id: generateId(),
      createdAt: Date.now(),
    }
    await db.debtPayments.add(payment)
    pushDebtPayment(walletId, payment)

    // Check if fully paid after this payment
    const allPayments = await db.debtPayments.where('debtId').equals(data.debtId).toArray()
    const totalPaid = allPayments.reduce((s, p) => s + p.amount, 0)
    const debt = await db.debts.get(data.debtId)
    const isFullyPaid = !!debt && totalPaid >= debt.amount

    if (isFullyPaid) {
      await db.debts.update(data.debtId, { status: 'paid', paidAt: Date.now() })
    } else if (totalPaid > 0) {
      await db.debts.update(data.debtId, { status: 'partial' })
    }
    const updatedDebt = await db.debts.get(data.debtId)
    if (updatedDebt) pushDebt(walletId, updatedDebt)

    await get().loadDebts()
    return { isFullyPaid }
  },

  deletePayment: async (id) => {
    const payment = await db.debtPayments.get(id)
    const walletId = payment?.walletId
    await db.debtPayments.delete(id)
    if (walletId) pushDebtPaymentDelete(walletId, id)
    if (payment) {
      // recalculate status
      const remaining = await db.debtPayments.where('debtId').equals(payment.debtId).toArray()
      const totalPaid = remaining.reduce((s, p) => s + p.amount, 0)
      const debt = await db.debts.get(payment.debtId)
      if (debt && debt.status === 'paid' && totalPaid < debt.amount) {
        await db.debts.update(payment.debtId, {
          status: totalPaid > 0 ? 'partial' : 'active',
          paidAt: undefined,
        })
        const updatedDebt = await db.debts.get(payment.debtId)
        if (updatedDebt && walletId) pushDebt(walletId, updatedDebt)
      }
    }
    await get().loadDebts()
  },

  getPaymentsByDebt: (debtId) =>
    get().payments.filter((p) => p.debtId === debtId),

  getTotalPaid: (debtId) =>
    get().payments
      .filter((p) => p.debtId === debtId)
      .reduce((s, p) => s + p.amount, 0),

  getRemaining: (debtId) => {
    const debt = get().debts.find((d) => d.id === debtId)
    if (!debt) return 0
    return Math.max(0, debt.amount - get().getTotalPaid(debtId))
  },

  getPendingCicilanToday: () => {
    const today = new Date()
    const todayDay = today.getDate()
    const currentMonth = format(today, 'yyyy-MM')

    return get().debts.filter((d) => {
      if (!d.isCicilan || d.status === 'paid') return false
      if (d.cicilanDay !== todayDay) return false
      if (d.cicilanStartMonth && currentMonth < d.cicilanStartMonth) return false

      const paidThisMonth = get()
        .getPaymentsByDebt(d.id)
        .some((p) => p.month === currentMonth)
      return !paidThisMonth
    })
  },

  // ─── Computed Selectors ───────────────────────────────────────────────────

  getActiveHutang: () =>
    get().debts.filter((d) => d.type === 'hutang' && d.status !== 'paid'),

  getActivePiutang: () =>
    get().debts.filter((d) => d.type === 'piutang' && d.status !== 'paid'),

  getOverdueCount: () =>
    get().debts.filter((d) => d.status === 'overdue').length,

  getTotalHutang: () =>
    get()
      .getActiveHutang()
      .reduce((sum, d) => sum + get().getRemaining(d.id), 0),

  getTotalPiutang: () =>
    get()
      .getActivePiutang()
      .reduce((sum, d) => sum + get().getRemaining(d.id), 0),

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
