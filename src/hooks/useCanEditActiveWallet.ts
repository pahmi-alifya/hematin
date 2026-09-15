'use client'

import { useWalletStore } from '@/stores/walletStore'

/**
 * false HANYA kalau dompet aktif adalah shared wallet dengan role 'viewer' (§4.5).
 * Dompet lokal biasa/owner/editor selalu true - ini murni UX (RLS Supabase yang jadi
 * enforcement sebenarnya di sisi server).
 */
export function useCanEditActiveWallet(): boolean {
  return useWalletStore((s) => {
    const wallet = s.wallets.find((w) => w.id === s.activeWalletId)
    return wallet?.ownerRole !== 'viewer'
  })
}
