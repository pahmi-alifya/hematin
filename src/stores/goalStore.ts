'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { generateId } from '@/lib/utils'
import { useWalletStore } from '@/stores/walletStore'
import type { Goal } from '@/types'

interface GoalStore {
  goals: Goal[]
  isLoading: boolean
  loadGoals: () => Promise<void>
  setGoal: (data: { category: string; limitAmount: number }) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  getGoalForCategory: (category: string) => Goal | undefined
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  isLoading: false,

  loadGoals: async () => {
    set({ isLoading: true })
    try {
      const walletId = useWalletStore.getState().activeWalletId
      if (!walletId) {
        set({ goals: [], isLoading: false })
        return
      }
      const goals = await db.goals.where('walletId').equals(walletId).toArray()
      goals.sort((a, b) => b.createdAt - a.createdAt)
      set({ goals, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setGoal: async ({ category, limitAmount }) => {
    const walletId = useWalletStore.getState().activeWalletId
    if (!walletId) return
    const existing = get().goals.find((g) => g.category === category)
    if (existing) {
      await db.goals.update(existing.id, { limitAmount })
      await get().loadGoals()
    } else {
      const goal: Goal = {
        id: generateId(),
        walletId,
        category,
        limitAmount,
        createdAt: Date.now(),
      }
      await db.goals.add(goal)
      await get().loadGoals()
    }
  },

  deleteGoal: async (id) => {
    await db.goals.delete(id)
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }))
  },

  getGoalForCategory: (category) => {
    return get().goals.find((g) => g.category === category)
  },
}))
