'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletStore, isSharedWithMe } from '@/stores/walletStore'
import { useAuthStore } from '@/stores/authStore'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { fetchWalletMembers } from '@/lib/sharing'
import { toast } from '@/components/ui/Toast'
import { useTranslation } from '@/hooks/useTranslation'
import type { WalletMemberRow } from '@/lib/supabase/types'
import type { Wallet } from '@/types'

export type DeletionStep = 'idle' | 'checking' | 'transfer' | 'confirm'

interface SharedOwnedWallet {
  wallet: Wallet
  members: WalletMemberRow[]
}

/** Owns seluruh alur "Hapus Akun" — cek dompet shared, transfer kepemilikan, konfirmasi, lalu eksekusi. */
export function useAccountDeletion() {
  const t = useTranslation()
  const router = useRouter()
  const wallets = useWalletStore((s) => s.wallets)
  const userId = useAuthStore((s) => s.user?.id)

  const [step, setStep] = useState<DeletionStep>('idle')
  const [sharedOwnedWallets, setSharedOwnedWallets] = useState<SharedOwnedWallet[]>([])
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const confirmPhrase = t.account.confirmSheet.confirmPhrase
  const canConfirm = confirmText.trim() === confirmPhrase

  async function open() {
    setStep('checking')
    const ownedCloudWallets = wallets.filter((w) => w.cloudWalletId && !isSharedWithMe(w))

    if (ownedCloudWallets.length === 0) {
      setStep('confirm')
      return
    }

    try {
      const results = await Promise.all(
        ownedCloudWallets.map(async (w) => {
          const allMembers = await fetchWalletMembers(w.cloudWalletId as string)
          // ensureOwnerMembership() (src/lib/sync/mappers.ts) selalu kasih owner baris
          // wallet_members sendiri (role 'owner') untuk SEMUA dompet cloud-linked, bahkan
          // yang tidak pernah di-share ke siapapun — baris itu harus dibuang dari sini,
          // kalau tidak dompet pribadi akan selalu dianggap "punya anggota" (dirinya sendiri).
          return { wallet: w, members: allMembers.filter((m) => m.user_id !== userId) }
        }),
      )
      const withMembers = results.filter((r) => r.members.length > 0)

      if (withMembers.length === 0) {
        setStep('confirm')
      } else {
        setSharedOwnedWallets(withMembers)
        setStep('transfer')
      }
    } catch {
      toast(t.account.toast.loadMembersError, 'error')
      setStep('idle')
    }
  }

  function close() {
    setStep('idle')
    setSharedOwnedWallets([])
    setSelections({})
    setConfirmText('')
  }

  function selectOwner(walletId: string, newOwnerId: string) {
    setSelections((s) => ({ ...s, [walletId]: newOwnerId }))
  }

  function proceedFromTransfer() {
    const allSelected = sharedOwnedWallets.every((sw) => !!selections[sw.wallet.id])
    if (!allSelected) {
      toast(t.account.transferSheet.incompleteToast, 'error')
      return
    }
    setStep('confirm')
  }

  async function confirmDelete() {
    if (!canConfirm || deleting) return
    setDeleting(true)

    const transfers = Object.entries(selections).map(([walletId, newOwnerId]) => ({
      walletId,
      newOwnerId,
    }))

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transfers }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || t.account.toast.genericError)
      }

      await useWalletStore.getState().cleanupAfterAccountDeletion(transfers.map((tr) => tr.walletId))

      if (isSupabaseConfigured()) {
        await createClient().auth.signOut()
      }
      useAuthStore.setState({ user: null, isGuest: true })

      toast(t.account.toast.success, 'success')
      close()
      router.push('/')
    } catch (e) {
      toast(e instanceof Error ? e.message : t.account.toast.genericError, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return {
    step,
    sharedOwnedWallets,
    selections,
    confirmText,
    setConfirmText,
    deleting,
    canConfirm,
    confirmPhrase,
    open,
    close,
    selectOwner,
    proceedFromTransfer,
    confirmDelete,
  }
}
