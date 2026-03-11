'use client'

import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', t === 'dark')
  localStorage.setItem('hematin-theme', t)
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',

  toggle: () =>
    set((s) => {
      const next: Theme = s.theme === 'light' ? 'dark' : 'light'
      applyTheme(next)
      return { theme: next }
    }),

  setTheme: (t) => {
    applyTheme(t)
    set({ theme: t })
  },
}))
