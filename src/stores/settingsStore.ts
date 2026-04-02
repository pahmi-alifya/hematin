'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import type { AISettings, AIProvider } from '@/types'

export interface CachedModel {
  id: string
  name: string
  desc: string
  vision: boolean
}

interface SettingsStore {
  aiSettings: AISettings | null
  isConfigured: boolean
  isLoading: boolean
  // Simpan models per-provider agar tidak hilang saat ganti tab
  cachedModelsByProvider: Record<string, CachedModel[]>
  loadSettings: () => Promise<void>
  saveSettings: (data: { provider: AIProvider; model: string; apiKey: string }) => Promise<void>
  clearSettings: () => Promise<void>
  setCachedModels: (models: CachedModel[], provider: string) => void
  clearCachedModels: () => void
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  aiSettings: null,
  isConfigured: false,
  isLoading: false,
  cachedModelsByProvider: {},

  loadSettings: async () => {
    set({ isLoading: true })
    try {
      const settings = await db.settings.get('ai-config')
      set({
        aiSettings: settings ?? null,
        isConfigured: settings?.isConfigured ?? false,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  saveSettings: async ({ provider, model, apiKey }) => {
    const settings: AISettings = {
      id: 'ai-config',
      provider,
      model,
      apiKey,
      isConfigured: true,
      updatedAt: Date.now(),
    }
    await db.settings.put(settings)
    set({ aiSettings: settings, isConfigured: true })
  },

  clearSettings: async () => {
    await db.settings.delete('ai-config')
    set({ aiSettings: null, isConfigured: false, cachedModelsByProvider: {} })
  },

  setCachedModels: (models, provider) => {
    set((state) => ({
      cachedModelsByProvider: { ...state.cachedModelsByProvider, [provider]: models },
    }))
  },

  clearCachedModels: () => {
    set({ cachedModelsByProvider: {} })
  },
}))
