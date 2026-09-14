'use client'

import { useEffect, useState } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import { toast } from '@/components/ui/Toast'
import { MAX_WALLETS, WALLET_ICONS, WALLET_COLORS } from '@/lib/constants'
import type { Wallet } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'

/** Owns state form tambah/edit dompet (nama, ikon, warna) untuk WalletFormSheet. */
export function useWalletForm(open: boolean, editing: Wallet | null, onSaved: () => void) {
  const t = useTranslation()
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
      toast(t.wallets.form.emptyNameToast, 'error')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await renameWallet(editing.id, trimmed)
        await updateWalletAppearance(editing.id, icon, color)
        toast(t.wallets.form.updatedToast, 'success')
      } else {
        if (!canCreateWallet()) {
          toast(t.wallets.list.maxWalletsToast(MAX_WALLETS), 'error')
          setSaving(false)
          return
        }
        await createWallet({ name: trimmed, icon, color })
        toast(t.wallets.form.createdToast, 'success')
      }
      onSaved()
    } catch {
      toast(t.wallets.form.saveErrorToast, 'error')
    } finally {
      setSaving(false)
    }
  }

  return { name, setName, icon, setIcon, color, setColor, saving, handleSave }
}
