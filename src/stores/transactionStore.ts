'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { generateId } from '@/lib/utils'
import { migrateSavingsFromExpense } from '@/lib/migrations'
import type { Transaction } from '@/types'

interface TransactionStore {
  transactions: Transaction[]
  isLoading: boolean
  loadTransactions: () => Promise<void>
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
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
      const transactions = await db.transactions
        .orderBy('createdAt')
        .reverse()
        .toArray()
      set({ transactions, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  addTransaction: async (data) => {
    const transaction: Transaction = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    }
    await db.transactions.add(transaction)
    await get().loadTransactions()
  },

  updateTransaction: async (id, data) => {
    await db.transactions.update(id, data)
    await get().loadTransactions()
  },

  deleteTransaction: async (id) => {
    await db.transactions.delete(id)
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }))
  },
}))
