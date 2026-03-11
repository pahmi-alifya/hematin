'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { generateId, getCurrentMonth } from '@/lib/utils'
import type { RecurringTemplate } from '@/types'

interface RecurringStore {
  templates: RecurringTemplate[]
  isLoading: boolean

  loadTemplates: () => Promise<void>
  addTemplate: (data: Omit<RecurringTemplate, 'id' | 'createdAt'>) => Promise<string>
  updateTemplate: (id: string, data: Partial<Omit<RecurringTemplate, 'id'>>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  toggleActive: (id: string) => Promise<void>

  // Ambil template yang perlu di-generate hari ini:
  // isActive && recurringDay <= hari ini && lastGeneratedMonth !== bulan ini
  getPendingToday: () => RecurringTemplate[]
}

export const useRecurringStore = create<RecurringStore>((set, get) => ({
  templates: [],
  isLoading: false,

  loadTemplates: async () => {
    set({ isLoading: true })
    try {
      const templates = await db.recurringTemplates.orderBy('createdAt').reverse().toArray()
      set({ templates, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  addTemplate: async (data) => {
    const id = generateId()
    const template: RecurringTemplate = {
      ...data,
      id,
      createdAt: Date.now(),
    }
    await db.recurringTemplates.add(template)
    await get().loadTemplates()
    return id
  },

  updateTemplate: async (id, data) => {
    await db.recurringTemplates.update(id, data)
    await get().loadTemplates()
  },

  deleteTemplate: async (id) => {
    await db.recurringTemplates.delete(id)
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }))
  },

  toggleActive: async (id) => {
    const template = get().templates.find((t) => t.id === id)
    if (!template) return
    await db.recurringTemplates.update(id, { isActive: !template.isActive })
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, isActive: !t.isActive } : t,
      ),
    }))
  },

  getPendingToday: () => {
    const todayDay = new Date().getDate()
    const currentMonth = getCurrentMonth()
    return get().templates.filter(
      (t) =>
        t.isActive &&
        t.recurringDay <= todayDay &&
        t.lastGeneratedMonth !== currentMonth,
    )
  },
}))
