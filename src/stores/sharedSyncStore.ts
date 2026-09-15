'use client'

import { create } from 'zustand'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useGoalStore } from '@/stores/goalStore'
import { useDebtStore } from '@/stores/debtStore'
import { useRecurringStore } from '@/stores/recurringStore'
import { refreshSharedWallet } from '@/lib/sync/walletSync'

interface SharedSyncStore {
  refreshingWalletId: string | null
  refreshWallet: (walletId: string) => Promise<void>
}

/**
 * Satu-satunya pemicu Lapis 2 (collaboration sync) - dipanggil tombol refresh manual
 * (WalletSwitcher, Kelola Dompet, Kelola Akses) maupun interval otomatis (WalletProvider,
 * cuma untuk dompet aktif). Bisa refresh dompet MANAPUN (bukan cuma yang lagi aktif) -
 * store/transaksi/goal/debt/recurring cuma di-reload kalau dompet yang di-refresh itu
 * kebetulan dompet aktif, supaya tidak salah nimpa data dompet lain yang lagi ditampilkan.
 */
export const useSharedSyncStore = create<SharedSyncStore>((set, get) => ({
  refreshingWalletId: null,

  refreshWallet: async (walletId) => {
    if (get().refreshingWalletId) return

    set({ refreshingWalletId: walletId })
    try {
      const { revoked } = await refreshSharedWallet(walletId)
      const isActiveWallet = useWalletStore.getState().activeWalletId === walletId
      if (!revoked && isActiveWallet) {
        await Promise.all([
          useTransactionStore.getState().loadTransactions(),
          useGoalStore.getState().loadGoals(),
          useDebtStore.getState().loadDebts(),
          useRecurringStore.getState().loadTemplates(),
        ])
      }
    } finally {
      set({ refreshingWalletId: null })
    }
  },
}))
