'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { generateId } from '@/lib/utils'
import { MAX_WALLETS } from '@/lib/constants'
import type { Wallet } from '@/types'

const ACTIVE_WALLET_KEY = 'hematin-active-wallet'

function readStoredActiveId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_WALLET_KEY)
}

function persistActiveId(id: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACTIVE_WALLET_KEY, id)
}

interface WalletStore {
  wallets: Wallet[]
  activeWalletId: string | null
  isLoading: boolean

  loadWallets: () => Promise<void>
  setActiveWallet: (id: string) => void
  createWallet: (data: { name: string; icon: string; color: string }) => Promise<void>
  renameWallet: (id: string, name: string) => Promise<void>
  updateWalletAppearance: (id: string, icon: string, color: string) => Promise<void>
  deleteWallet: (id: string) => Promise<void>
  reorderWallets: (orderedIds: string[]) => Promise<void>

  getActiveWallet: () => Wallet | undefined
  canCreateWallet: () => boolean
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallets: [],
  activeWalletId: readStoredActiveId(),
  isLoading: false,

  loadWallets: async () => {
    set({ isLoading: true })
    try {
      let wallets = await db.wallets.orderBy('order').toArray()

      // First-run: instalasi baru tanpa riwayat versi lama, .upgrade() tidak jalan
      if (wallets.length === 0) {
        const defaultWallet: Wallet = {
          id: generateId(),
          name: 'Dompet Utama',
          icon: '👛',
          color: '#0EA5E9',
          isDefault: true,
          createdAt: Date.now(),
          order: 0,
        }
        await db.wallets.add(defaultWallet)
        wallets = [defaultWallet]
      }

      const stored = get().activeWalletId
      const stillExists = stored && wallets.some((w) => w.id === stored)
      const activeWalletId = stillExists
        ? stored
        : (wallets.find((w) => w.isDefault) ?? wallets[0]).id

      if (activeWalletId !== stored) persistActiveId(activeWalletId)

      set({ wallets, activeWalletId, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setActiveWallet: (id) => {
    if (id === get().activeWalletId) return
    persistActiveId(id)
    set({ activeWalletId: id })
  },

  createWallet: async ({ name, icon, color }) => {
    if (!get().canCreateWallet()) return
    const wallet: Wallet = {
      id: generateId(),
      name,
      icon,
      color,
      isDefault: false,
      createdAt: Date.now(),
      order: get().wallets.length,
    }
    await db.wallets.add(wallet)
    set((state) => ({ wallets: [...state.wallets, wallet] }))
    get().setActiveWallet(wallet.id)
  },

  renameWallet: async (id, name) => {
    await db.wallets.update(id, { name })
    set((state) => ({
      wallets: state.wallets.map((w) => (w.id === id ? { ...w, name } : w)),
    }))
  },

  updateWalletAppearance: async (id, icon, color) => {
    await db.wallets.update(id, { icon, color })
    set((state) => ({
      wallets: state.wallets.map((w) => (w.id === id ? { ...w, icon, color } : w)),
    }))
  },

  deleteWallet: async (id) => {
    const { wallets, activeWalletId } = get()
    if (wallets.length <= 1) return // minimal 1 dompet harus selalu ada

    await Promise.all([
      db.transactions.where('walletId').equals(id).delete(),
      db.goals.where('walletId').equals(id).delete(),
      db.insights.where('walletId').equals(id).delete(),
      db.debts.where('walletId').equals(id).delete(),
      db.debtPayments.where('walletId').equals(id).delete(),
      db.recurringTemplates.where('walletId').equals(id).delete(),
      db.wallets.delete(id),
    ])

    const remaining = wallets.filter((w) => w.id !== id)
    set({ wallets: remaining })

    if (activeWalletId === id) {
      const fallback = remaining.find((w) => w.isDefault) ?? remaining[0]
      get().setActiveWallet(fallback.id)
    }
  },

  reorderWallets: async (orderedIds) => {
    const { wallets } = get()
    const reordered = orderedIds
      .map((id, index) => {
        const wallet = wallets.find((w) => w.id === id)
        return wallet ? { ...wallet, order: index } : null
      })
      .filter((w): w is Wallet => w !== null)

    set({ wallets: reordered })
    await Promise.all(reordered.map((w) => db.wallets.update(w.id, { order: w.order })))
  },

  getActiveWallet: () => get().wallets.find((w) => w.id === get().activeWalletId),

  canCreateWallet: () => get().wallets.length < MAX_WALLETS,
}))
