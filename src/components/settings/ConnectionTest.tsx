'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import type { AISettings } from '@/types'

type TestStatus = 'idle' | 'loading' | 'success' | 'rate-limited' | 'invalid-key' | 'error'

interface ConnectionTestProps {
  settings: AISettings
}

const DUMMY_CONTEXT = `Bulan ini: Pemasukan Rp 0, Pengeluaran Rp 0, Saldo Rp 0
Status cash flow: Netral (tes koneksi)
Berikan satu kalimat konfirmasi bahwa koneksi berhasil.`

export function ConnectionTest({ settings }: ConnectionTestProps) {
  const t = useTranslation()
  const [status, setStatus] = useState<TestStatus>('idle')
  const [message, setMessage] = useState('')

  async function handleTest() {
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-Provider': settings.provider,
          'X-AI-Model': settings.model,
          'X-AI-Key': settings.apiKey,
        },
        body: JSON.stringify({ context: DUMMY_CONTEXT }),
      })

      if (res.ok) {
        setStatus('success')
        setMessage(t.settings.connectionTest.messages.success)
        return
      }

      if (res.status === 401 || res.status === 403) {
        setStatus('invalid-key')
        setMessage(t.settings.connectionTest.messages.invalidKey)
        return
      }

      if (res.status === 429) {
        setStatus('rate-limited')
        setMessage(t.settings.connectionTest.messages.rateLimited)
        return
      }

      const body = await res.json().catch(() => ({}))
      setStatus('error')
      setMessage(body.error ?? t.settings.connectionTest.messages.genericError(res.status))
    } catch {
      setStatus('error')
      setMessage(t.settings.connectionTest.messages.networkError)
    }
  }

  const statusConfig = {
    success: {
      icon: <Wifi className="w-4 h-4" />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40',
      label: t.settings.connectionTest.status.success,
    },
    'rate-limited': {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40',
      label: t.settings.connectionTest.status.rateLimited,
    },
    'invalid-key': {
      icon: <WifiOff className="w-4 h-4" />,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40',
      label: t.settings.connectionTest.status.invalidKey,
    },
    error: {
      icon: <WifiOff className="w-4 h-4" />,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40',
      label: t.settings.connectionTest.status.error,
    },
  } as const

  const cfg = status !== 'idle' && status !== 'loading' ? statusConfig[status] : null

  return (
    <div className="space-y-3">
      <Button
        variant="secondary"
        fullWidth
        loading={status === 'loading'}
        onClick={handleTest}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t.settings.connectionTest.testingButton}
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 mr-2" />
            {t.settings.connectionTest.button}
          </>
        )}
      </Button>

      <AnimatePresence>
        {cfg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 ${cfg.bg}`}
          >
            <span className={`mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</span>
            <div>
              <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
