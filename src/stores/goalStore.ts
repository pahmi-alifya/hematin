'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { generateId, getCurrentMonth } from '@/lib/utils'
import type { Goal } from '@/types'

interface GoalStore {
  goals: Goal[]
  isLoading: boolean
  loadGoals: () => Promise<void>
  setGoal: (data: { category: string; limitAmount: number; month?: string }) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  getGoalForCategory: (category: string, month?: string) => Goal | undefined
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  isLoading: false,

  loadGoals: async () => {
    set({ isLoading: true })
    try {
      const goals = await db.goals.toArray()
      goals.sort((a, b) => b.createdAt - a.createdAt)
      set({ goals, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setGoal: async ({ category, limitAmount, month }) => {
    const targetMonth = month ?? getCurrentMonth()
    const existing = get().goals.find((g) => g.category === category && g.month === targetMonth)
    if (existing) {
      await db.goals.update(existing.id, { limitAmount })
      await get().loadGoals()
    } else {
      const goal: Goal = {
        id: generateId(),
        category,
        limitAmount,
        month: targetMonth,
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

  getGoalForCategory: (category, month) => {
    const targetMonth = month ?? getCurrentMonth()
    return get().goals.find((g) => g.category === category && g.month === targetMonth)
  },
}))
