'use client'

import { useEffect, useState } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import { toast } from '@/components/ui/Toast'
import { MAX_WALLETS, WALLET_ICONS, WALLET_COLORS } from '@/lib/constants'
import type { Wallet } from '@/types'

/** Owns state form tambah/edit dompet (nama, ikon, warna) untuk WalletFormSheet. */
export function useWalletForm(open: boolean, editing: Wallet | null, onSaved: () => void) {
  const { createWallet, renameWallet, updateWalletAppearance, canCreateWallet } = useWalletStore()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(WALLET_ICONS[0])
  const [color, setColor] = useState(WALLET_COLORS[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(editing?.name ?? '')
    setIcon(editing?.icon ?? WALLET_ICONS[0])
    setColor(editing?.color ?? WALLET_COLORS[0])
  }, [open, editing])

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      toast('Nama dompet tidak boleh kosong', 'error')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await renameWallet(editing.id, trimmed)
        await updateWalletAppearance(editing.id, icon, color)
        toast('Dompet berhasil diperbarui', 'success')
      } else {
        if (!canCreateWallet()) {
          toast(`Maksimal ${MAX_WALLETS} dompet`, 'error')
          setSaving(false)
          return
        }
        await createWallet({ name: trimmed, icon, color })
        toast('Dompet baru berhasil dibuat', 'success')
      }
      onSaved()
    } catch {
      toast('Gagal menyimpan dompet', 'error')
    } finally {
      setSaving(false)
    }
  }

  return { name, setName, icon, setIcon, color, setColor, saving, handleSave }
}
