'use client'

import { useState } from 'react'
import compressImage from 'browser-image-compression'
import { useSettingsStore } from '@/stores/settingsStore'
import { useLanguageStore } from '@/stores/languageStore'
import { toast } from '@/components/ui/Toast'
import { useTranslation } from '@/hooks/useTranslation'
import { buildAIHeaders, getCurrentDate } from '@/lib/utils'
import { IMAGE_COMPRESSION_OPTIONS } from '@/lib/constants'
import type { ScannedReceipt } from '@/types'

type ScanState = 'idle' | 'scanning' | 'done' | 'error'

/** Owns alur upload → compress → panggil /api/scan → parse hasil untuk halaman Scan Struk. */
export function useReceiptScan() {
  const t = useTranslation()
  const language = useLanguageStore((s) => s.language)
  const { aiSettings, isConfigured } = useSettingsStore()
  const [preview, setPreview] = useState<string | null>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [scanned, setScanned] = useState<ScannedReceipt | null>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast(t.scan.errorNotImage, 'error')
      return
    }

    const compressed = await compressImage(file, IMAGE_COMPRESSION_OPTIONS)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)

      if (!isConfigured || !aiSettings) {
        toast(t.scan.errorAIRequired, 'error')
        return
      }

      setScanState('scanning')
      try {
        const [header, base64] = dataUrl.split(',')
        const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'

        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...buildAIHeaders({ provider: aiSettings.provider, apiKey: aiSettings.apiKey, model: aiSettings.model, language }),
          },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? t.scan.errorScanFailed)
        }

        const data: ScannedReceipt = await res.json()
        setScanned(data)
        setScanState('done')
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t.scan.errorScanFailed
        toast(message, 'error')
        setScanState('error')
      }
    }
    reader.readAsDataURL(compressed)
  }

  function reset() {
    setPreview(null)
    setScanState('idle')
    setScanned(null)
  }

  const defaultFormValues = scanned
    ? {
        type: 'expense' as const,
        amount: scanned.total ?? 0,
        category: scanned.category ?? 'other',
        merchant: scanned.merchant ?? '',
        date: scanned.date ?? getCurrentDate(),
        notes: scanned.notes ?? '',
        source: 'scan' as const,
      }
    : undefined

  return {
    isConfigured,
    preview,
    scanState,
    scanned,
    handleFile,
    reset,
    defaultFormValues,
  }
}
