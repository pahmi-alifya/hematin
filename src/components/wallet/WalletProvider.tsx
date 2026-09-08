'use client'

import { useEffect, useRef } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useGoalStore } from '@/stores/goalStore'
import { useDebtStore } from '@/stores/debtStore'
import { useRecurringStore } from '@/stores/recurringStore'

/**
 * Reload semua store yang di-scope per-dompet setiap kali activeWalletId berubah,
 * supaya halaman yang sedang terbuka (tanpa remount) ikut ter-update saat user
 * ganti dompet lewat switcher.
 */
export function WalletProvider() {
  const loadWallets = useWalletStore((s) => s.loadWallets)
  const activeWalletId = useWalletStore((s) => s.activeWalletId)
  const loadTransactions = useTransactionStore((s) => s.loadTransactions)
  const loadGoals = useGoalStore((s) => s.loadGoals)
  const loadDebts = useDebtStore((s) => s.loadDebts)
  const loadTemplates = useRecurringStore((s) => s.loadTemplates)
  const didInit = useRef(false)

  useEffect(() => {
    loadWallets()
  }, [loadWallets])

  useEffect(() => {
    if (!activeWalletId) return
    // Hindari double-load di render pertama — masing-masing halaman sudah
    // memanggil loadX() sendiri saat mount.
    if (!didInit.current) {
      didInit.current = true
      return
    }
    loadTransactions()
    loadGoals()
    loadDebts()
    loadTemplates()
  }, [activeWalletId, loadTransactions, loadGoals, loadDebts, loadTemplates])

  return null
}
