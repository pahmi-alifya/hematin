'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

// Global toast state
let toastListeners: ((toasts: ToastItem[]) => void)[] = []
let toasts: ToastItem[] = []

function notify(listeners: typeof toastListeners, items: typeof toasts) {
  listeners.forEach((fn) => fn([...items]))
}

export function toast(message: string, type: ToastType = 'success') {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { id, message, type }]
  notify(toastListeners, toasts)

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notify(toastListeners, toasts)
  }, 3500)
}

export function ToastProvider() {
  const [items, setItems] = useState<ToastItem[]>([])

  const handleClose = useCallback((id: string) => {
    toasts = toasts.filter((t) => t.id !== id)
    setItems([...toasts])
  }, [])

  useEffect(() => {
    const listener = (updated: ToastItem[]) => setItems(updated)
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error:   <XCircle className="w-5 h-5 text-red-500" />,
    info:    <AlertCircle className="w-5 h-5 text-sky-500" />,
  }

  const borders = {
    success: 'border-l-emerald-400',
    error:   'border-l-red-400',
    info:    'border-l-sky-400',
  }

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700 border-l-4 px-4 py-3',
              'flex items-center gap-3 pointer-events-auto',
              borders[item.type]
            )}
          >
            {icons[item.type]}
            <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 font-medium">{item.message}</p>
            <button
              onClick={() => handleClose(item.id)}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
