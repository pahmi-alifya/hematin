'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import type { Wallet } from '@/types'

/** Sinkronkan urutan dompet lokal (untuk drag-reorder optimistic) dengan store. */
export function useWalletReorder(wallets: Wallet[]) {
  const reorderWallets = useWalletStore((s) => s.reorderWallets)
  const [items, setItems] = useState<Wallet[]>(wallets)

  useEffect(() => {
    setItems(wallets)
  }, [wallets])

  const handleReorder = useCallback(
    (newOrder: Wallet[]) => {
      setItems(newOrder)
      reorderWallets(newOrder.map((w) => w.id))
    },
    [reorderWallets],
  )

  return { items, handleReorder }
}
