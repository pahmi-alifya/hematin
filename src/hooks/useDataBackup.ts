'use client'

import { useState } from 'react'
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
import { toast } from '@/components/ui/Toast'

/** Owns alur export/import backup JSON: pilih file → preview → konfirmasi mode → import. */
export function useDataBackup() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
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
    e.target.value = '' // reset input supaya file yang sama bisa dipilih ulang
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

  function cancelImport() {
    setBackup(null)
    setPreview(null)
  }

  async function handleConfirmImport() {
    if (!backup) return
    setImporting(true)
    try {
      await importData(backup, mode)
      await Promise.all([loadTransactions(), loadGoals()])
      toast('Data berhasil diimport', 'success')
      cancelImport()
    } catch {
      toast('Gagal import data', 'error')
    } finally {
      setImporting(false)
    }
  }

  return {
    exporting,
    importing,
    backup,
    preview,
    mode,
    setMode,
    handleExport,
    handleFileChange,
    handleConfirmImport,
    cancelImport,
  }
}
