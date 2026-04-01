'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Upload, AlertTriangle, X, Database } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import {
  downloadBackup,
  parseBackupFile,
  importData,
  getImportPreview,
  type HematinBackup,
  type ImportMode,
  type ImportPreview,
} from '@/lib/export-import'
import { useTransactionStore } from '@/stores/transactionStore'
import { useGoalStore } from '@/stores/goalStore'

export function DataBackupSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  // Modal state
  const [backup, setBackup] = useState<HematinBackup | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [mode, setMode] = useState<ImportMode>('merge')

  const loadTransactions = useTransactionStore((s) => s.loadTransactions)
  const loadGoals = useGoalStore((s) => s.loadGoals)

  async function handleExport() {
    setExporting(true)
    try {
      await downloadBackup()
      toast('Data berhasil diexport', 'success')
    } catch {
      toast('Gagal export data', 'error')
    } finally {
      setExporting(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!e.target.files) return
    // reset input so same file can be re-selected
    e.target.value = ''
    if (!file) return

    try {
      const parsed = await parseBackupFile(file)
      setBackup(parsed)
      setPreview(getImportPreview(parsed))
      setMode('merge')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'File tidak valid', 'error')
    }
  }

  async function handleConfirmImport() {
    if (!backup) return
    setImporting(true)
    try {
      await importData(backup, mode)
      await Promise.all([loadTransactions(), loadGoals()])
      toast('Data berhasil diimport', 'success')
      setBackup(null)
      setPreview(null)
    } catch {
      toast('Gagal import data', 'error')
    } finally {
      setImporting(false)
    }
  }

  const totalRecords = preview
    ? preview.transactions + preview.goals + preview.debts + preview.recurringTemplates
    : 0

  return (
    <>
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-sky-500" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Data & Backup
          </p>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          Export semua data ke file JSON untuk backup atau pindah perangkat. Import file backup untuk memulihkan data.
        </p>

        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            fullWidth
            loading={exporting}
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Import Confirmation Modal */}
      <AnimatePresence>
        {backup && preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-6 sm:pb-0"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setBackup(null)
                setPreview(null)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Konfirmasi Import
                </p>
                <button
                  onClick={() => { setBackup(null); setPreview(null) }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 pb-4 space-y-4">
                {/* Preview counts */}
                <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-800/40 p-3">
                  <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 mb-2">
                    Data ditemukan: {totalRecords} record
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <span>Transaksi: <b className="text-slate-800 dark:text-slate-200">{preview.transactions}</b></span>
                    <span>Goals: <b className="text-slate-800 dark:text-slate-200">{preview.goals}</b></span>
                    <span>Hutang: <b className="text-slate-800 dark:text-slate-200">{preview.debts}</b></span>
                    <span>Berulang: <b className="text-slate-800 dark:text-slate-200">{preview.recurringTemplates}</b></span>
                  </div>
                </div>

                {/* Mode selector */}
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Mode import
                  </p>
                  <div className="flex gap-2">
                    {(['merge', 'replace'] as ImportMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                          mode === m
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {m === 'merge' ? 'Gabung' : 'Timpa'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                    {mode === 'merge'
                      ? 'Tambah data baru saja, data lama tetap aman.'
                      : 'Hapus semua data lama, ganti dengan data dari file.'}
                  </p>
                </div>

                {/* Warning for replace */}
                <AnimatePresence>
                  {mode === 'replace' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Semua data yang ada sekarang akan dihapus permanen dan tidak bisa dikembalikan.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => { setBackup(null); setPreview(null) }}
                  >
                    Batal
                  </Button>
                  <Button
                    variant={mode === 'replace' ? 'danger' : 'primary'}
                    fullWidth
                    loading={importing}
                    onClick={handleConfirmImport}
                  >
                    {mode === 'replace' ? 'Timpa Data' : 'Import'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
