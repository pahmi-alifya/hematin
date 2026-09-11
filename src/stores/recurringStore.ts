'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { generateId, getCurrentMonth } from '@/lib/utils'
import { useWalletStore } from '@/stores/walletStore'
import { pushRecurringTemplate, pushRecurringTemplateDelete } from '@/lib/sync/walletSync'
import type { RecurringTemplate } from '@/types'

interface RecurringStore {
  templates: RecurringTemplate[]
  isLoading: boolean

  loadTemplates: () => Promise<void>
  addTemplate: (data: Omit<RecurringTemplate, 'id' | 'createdAt' | 'walletId'>) => Promise<string>
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
      const walletId = useWalletStore.getState().activeWalletId
      if (!walletId) {
        set({ templates: [], isLoading: false })
        return
      }
      const templates = (
        await db.recurringTemplates.where('walletId').equals(walletId).sortBy('createdAt')
      ).reverse()
      set({ templates, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  addTemplate: async (data) => {
    const walletId = useWalletStore.getState().activeWalletId
    if (!walletId) return ''
    const id = generateId()
    const template: RecurringTemplate = {
      ...data,
      walletId,
      id,
      createdAt: Date.now(),
    }
    await db.recurringTemplates.add(template)
    await get().loadTemplates()
    pushRecurringTemplate(walletId, template)
    return id
  },

  updateTemplate: async (id, data) => {
    await db.recurringTemplates.update(id, data)
    await get().loadTemplates()
    const updated = await db.recurringTemplates.get(id)
    if (updated) pushRecurringTemplate(updated.walletId, updated)
  },

  deleteTemplate: async (id) => {
    const walletId = get().templates.find((t) => t.id === id)?.walletId
    await db.recurringTemplates.delete(id)
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }))
    if (walletId) pushRecurringTemplateDelete(walletId, id)
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
    pushRecurringTemplate(template.walletId, { ...template, isActive: !template.isActive })
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
