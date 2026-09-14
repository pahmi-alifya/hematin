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
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { toast } from '@/components/ui/Toast'
import { useReceiptScan } from '@/hooks/useReceiptScan'
import { useCanEditActiveWallet } from '@/hooks/useCanEditActiveWallet'
import { useTranslation } from '@/hooks/useTranslation'
import { formatRupiah } from '@/lib/utils'

export default function ScanPage() {
  const t = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showForm, setShowForm] = useState(false)
  const canEdit = useCanEditActiveWallet()
  const { isConfigured, preview, scanState, scanned, handleFile, reset, defaultFormValues } = useReceiptScan()

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
        <Header title={t.scan.pageTitle} showBack />
        <PageWrapper>
          <EmptyState
            icon="🔒"
            title={t.scan.restrictedTitle}
            description={t.scan.restrictedDescription}
          />
        </PageWrapper>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title={t.scan.pageTitle} showBack />

      <PageWrapper>
        <div className="pb-28 space-y-4">
          {!isConfigured && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{t.scan.aiNotActiveTitle}</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">{t.scan.aiNotActiveDescription}</p>
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
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">{t.scan.uploadTitle}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{t.scan.uploadDescription}</p>
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
                    {t.scan.cameraButton}
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
                    {t.scan.uploadButton}
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
                    alt={t.scan.receiptAlt}
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
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.scan.scanningText}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Result */}
                {scanState === 'done' && scanned && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">{t.scan.scanSuccessText}</span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                        scanned.confidence === 'high' ? 'bg-emerald-50 text-emerald-600'
                        : scanned.confidence === 'medium' ? 'bg-amber-50 text-amber-600'
                        : 'bg-red-50 text-red-500'
                      }`}>
                        {scanned.confidence === 'high' ? t.scan.confidenceHigh : scanned.confidence === 'medium' ? t.scan.confidenceMedium : t.scan.confidenceLow}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-700">
                      {[
                        { label: t.scan.fieldMerchant, value: scanned.merchant ?? '-' },
                        { label: t.scan.fieldTotal, value: scanned.total ? formatRupiah(scanned.total) : '-' },
                        { label: t.common.date, value: scanned.date ?? '-' },
                        { label: t.common.category, value: scanned.category ?? '-' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between px-3 py-2 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">{label}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="secondary" fullWidth onClick={reset}>
                        {t.scan.retryButton}
                      </Button>
                      <Button variant="primary" fullWidth onClick={() => setShowForm(true)}>
                        {t.scan.saveTransactionButton}
                      </Button>
                    </div>
                  </div>
                )}

                {scanState === 'error' && (
                  <div className="p-4">
                    <p className="text-sm text-red-500 text-center mb-3">{t.scan.scanErrorText}</p>
                    <Button variant="secondary" fullWidth onClick={reset}>
                      {t.scan.tryAgainButton}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">{t.scan.tipsTitle}</p>
            <ul className="space-y-1">
              {t.scan.tips.map((tip) => (
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
        title={t.scan.saveTransactionButton}
      >
        <TransactionForm
          defaultValues={defaultFormValues}
          onSuccess={() => {
            setShowForm(false)
            reset()
            toast(t.scan.successToast, 'success')
          }}
        />
      </BottomSheet>
    </div>
  )
}
