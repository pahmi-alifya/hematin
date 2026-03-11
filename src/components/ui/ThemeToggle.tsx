'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'

/** Inisialisasi theme dari localStorage sebelum hydration */
export function ThemeProvider() {
  const setTheme = useThemeStore((s) => s.setTheme)

  useEffect(() => {
    const saved = localStorage.getItem('hematin-theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(saved ?? (prefersDark ? 'dark' : 'light'))
  }, [setTheme])

  return null
}

/** Tombol toggle light/dark */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <motion.button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
        bg-slate-100 text-slate-600 hover:bg-slate-200
        dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600
        ${className ?? ''}`}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </motion.div>
    </motion.button>
  )
}
