'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { generateId } from '@/lib/utils'
import { migrateSavingsFromExpense } from '@/lib/migrations'
import { useWalletStore } from '@/stores/walletStore'
import { pushTransaction, pushTransactionDelete } from '@/lib/sync/walletSync'
import type { Transaction } from '@/types'

interface TransactionStore {
  transactions: Transaction[]
  isLoading: boolean
  loadTransactions: () => Promise<void>
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'walletId'>) => Promise<void>
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  isLoading: false,

  loadTransactions: async () => {
    set({ isLoading: true })
    try {
      await migrateSavingsFromExpense()
      const walletId = useWalletStore.getState().activeWalletId
      if (!walletId) {
        set({ transactions: [], isLoading: false })
        return
      }
      const transactions = (
        await db.transactions.where('walletId').equals(walletId).sortBy('createdAt')
      ).reverse()
      set({ transactions, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  addTransaction: async (data) => {
    const walletId = useWalletStore.getState().activeWalletId
    if (!walletId) return
    const transaction: Transaction = {
      ...data,
      walletId,
      id: generateId(),
      createdAt: Date.now(),
    }
    await db.transactions.add(transaction)
    await get().loadTransactions()
    pushTransaction(walletId, transaction)
  },

  updateTransaction: async (id, data) => {
    await db.transactions.update(id, data)
    await get().loadTransactions()
    const updated = await db.transactions.get(id)
    if (updated) pushTransaction(updated.walletId, updated)
  },

  deleteTransaction: async (id) => {
    const walletId = get().transactions.find((t) => t.id === id)?.walletId
    await db.transactions.delete(id)
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }))
    if (walletId) pushTransactionDelete(walletId, id)
  },
}))
