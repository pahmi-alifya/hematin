'use client'

import { useEffect, useState } from 'react'
import { useWalletStore, isSharedWithMe } from '@/stores/walletStore'
import { toast } from '@/components/ui/Toast'
import { db } from '@/lib/db'
import { leaveWallet, deleteCloudWallet } from '@/lib/sharing'
import type { Wallet } from '@/types'

interface WalletCounts {
  transactions: number
  goals: number
  debts: number
  recurringTemplates: number
}

async function countWalletData(walletId: string): Promise<WalletCounts> {
  const [transactions, goals, debts, recurringTemplates] = await Promise.all([
    db.transactions.where('walletId').equals(walletId).count(),
    db.goals.where('walletId').equals(walletId).count(),
    db.debts.where('walletId').equals(walletId).count(),
    db.recurringTemplates.where('walletId').equals(walletId).count(),
  ])
  return { transactions, goals, debts, recurringTemplates }
}

/** Owns hitung jumlah data yang akan ikut terhapus + alur konfirmasi hapus dompet. */
export function useDeleteWalletConfirm(wallet: Wallet | null, onDeleted: () => void) {
  const deleteWallet = useWalletStore((s) => s.deleteWallet)
  const [counts, setCounts] = useState<WalletCounts | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!wallet) {
      setCounts(null)
      return
    }
    countWalletData(wallet.id).then(setCounts)
  }, [wallet])

  async function handleConfirm() {
    if (!wallet) return
    setDeleting(true)
    try {
      if (isSharedWithMe(wallet)) {
        // Member (editor/viewer) — "hapus" di sini berarti keluar, bukan menghapus data
        // yang juga dipakai owner & anggota lain.
        await leaveWallet(wallet.cloudWalletId!)
        await deleteWallet(wallet.id)
        toast(`Akses ke dompet "${wallet.name}" berhasil dihapus`, 'success')
      } else {
        // Owner (atau dompet lokal murni) — hapus penuh. Kalau cloud-linked, hapus juga
        // row cloud_wallets-nya supaya cascade ke wallet_members/activity_log/semua data
        // anak, jadi anggota lain otomatis kehilangan akses (bukan cuma cache device ini).
        if (wallet.cloudWalletId) await deleteCloudWallet(wallet.cloudWalletId)
        await deleteWallet(wallet.id)
        toast(`Dompet "${wallet.name}" berhasil dihapus`, 'success')
      }
      onDeleted()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal menghapus dompet', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return { counts, deleting, handleConfirm, isLeaving: wallet ? isSharedWithMe(wallet) : false }
}
