'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BottomNav } from '@/components/layout/BottomNav'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { toast } from '@/components/ui/Toast'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatRupiah, getCurrentDate } from '@/lib/utils'
import type { ScannedReceipt } from '@/types'
import compressImage from 'browser-image-compression'

type ScanState = 'idle' | 'scanning' | 'done' | 'error'

export default function ScanPage() {
  const { aiSettings, isConfigured } = useSettingsStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [scanned, setScanned] = useState<ScannedReceipt | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast('File harus berupa gambar', 'error')
      return
    }

    // Compress image
    const compressed = await compressImage(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    })

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)

      if (!isConfigured || !aiSettings) {
        toast('Aktifkan AI di Pengaturan terlebih dahulu', 'error')
        return
      }

      setScanState('scanning')
      try {
        // Extract base64 from data URL
        const [header, base64] = dataUrl.split(',')
        const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'

        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-AI-Provider': aiSettings.provider,
            'X-AI-Model': aiSettings.model,
            'X-AI-Key': aiSettings.apiKey,
          },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? 'Scan gagal')
        }

        const data: ScannedReceipt = await res.json()
        setScanned(data)
        setScanState('done')
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Scan gagal'
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

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title="Scan Struk" showBack />

      <PageWrapper>
        <div className="pb-28 space-y-4">
          {!isConfigured && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">AI Belum Aktif</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">Buka Pengaturan dan hubungkan API key untuk menggunakan fitur ini.</p>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-800/60 rounded-2xl border-2 border-dashed border-sky-200 dark:border-sky-800/60 p-8 flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-sky-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Foto atau Upload Struk</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">AI akan membaca detail transaksi secara otomatis</p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.setAttribute('capture', 'environment')
                        fileInputRef.current.click()
                      }
                    }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Kamera
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.removeAttribute('capture')
                        fileInputRef.current.click()
                      }
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                    e.target.value = ''
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-800/60 rounded-2xl overflow-hidden shadow-sm border border-sky-100 dark:border-slate-700/60"
              >
                <div className="relative">
                  <Image
                    src={preview}
                    alt="Struk"
                    width={400}
                    height={300}
                    className="w-full object-cover max-h-64"
                    unoptimized
                  />
                  <button
                    onClick={reset}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Scan overlay */}
                  {scanState === 'scanning' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl px-5 py-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Membaca struk...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Result */}
                {scanState === 'done' && scanned && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">Struk berhasil dibaca</span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                        scanned.confidence === 'high' ? 'bg-emerald-50 text-emerald-600'
                        : scanned.confidence === 'medium' ? 'bg-amber-50 text-amber-600'
                        : 'bg-red-50 text-red-500'
                      }`}>
                        {scanned.confidence === 'high' ? 'Akurat' : scanned.confidence === 'medium' ? 'Cukup akurat' : 'Perlu cek ulang'}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-700">
                      {[
                        { label: 'Merchant', value: scanned.merchant ?? '-' },
                        { label: 'Total', value: scanned.total ? formatRupiah(scanned.total) : '-' },
                        { label: 'Tanggal', value: scanned.date ?? '-' },
                        { label: 'Kategori', value: scanned.category ?? '-' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between px-3 py-2 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">{label}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="secondary" fullWidth onClick={reset}>
                        Ulangi
                      </Button>
                      <Button variant="primary" fullWidth onClick={() => setShowForm(true)}>
                        Simpan Transaksi
                      </Button>
                    </div>
                  </div>
                )}

                {scanState === 'error' && (
                  <div className="p-4">
                    <p className="text-sm text-red-500 text-center mb-3">Gagal membaca struk. Coba foto yang lebih jelas.</p>
                    <Button variant="secondary" fullWidth onClick={reset}>
                      Coba Lagi
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Tips foto struk yang baik:</p>
            <ul className="space-y-1">
              {[
                'Pastikan pencahayaan cukup',
                'Foto seluruh struk, termasuk total',
                'Hindari bayangan atau lipatan',
                'Foto tegak lurus, tidak miring',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-sky-500 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageWrapper>

      <BottomNav />

      {/* Transaction Form with pre-filled data */}
      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Simpan Transaksi"
      >
        <TransactionForm
          defaultValues={defaultFormValues}
          onSuccess={() => {
            setShowForm(false)
            reset()
            toast('Transaksi berhasil disimpan', 'success')
          }}
        />
      </BottomSheet>
    </div>
  )
}
