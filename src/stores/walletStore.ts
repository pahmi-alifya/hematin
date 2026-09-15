'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { generateId } from '@/lib/utils'
import { MAX_WALLETS } from '@/lib/constants'
import { pushWalletMetadata } from '@/lib/sync/walletSync'
import type { Wallet } from '@/types'

const ACTIVE_WALLET_KEY = 'hematin-active-wallet'

/** Dompet cloud-linked yang aku ikuti sebagai editor/viewer — bukan milikku, cuma dibagikan owner-nya. */
export function isSharedWithMe(wallet: Pick<Wallet, 'cloudWalletId' | 'ownerRole'>): boolean {
  return !!wallet.cloudWalletId && wallet.ownerRole !== 'owner'
}

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
  clearAccountLinkedWallets: () => Promise<void>
  cleanupAfterAccountDeletion: (transferredWalletIds: string[]) => Promise<void>

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
    // Kalau dompet ini cloud-linked, teruskan ke cloud_wallets supaya member lain
    // (via refresh Lapis 2) & device lain pemilik yang sama ikut lihat nama barunya.
    await pushWalletMetadata(id, { name })
  },

  updateWalletAppearance: async (id, icon, color) => {
    await db.wallets.update(id, { icon, color })
    set((state) => ({
      wallets: state.wallets.map((w) => (w.id === id ? { ...w, icon, color } : w)),
    }))
    await pushWalletMetadata(id, { icon, color })
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

  /**
   * Dipanggil saat logout — dompet yang cloud-linked (owned ATAU joined sebagai member)
   * cuma boleh terlihat selama akun itu login, bukan nyisa jadi data "Guest" abal-abal
   * setelah logout (Dexie tidak otomatis kosong cuma karena sesi auth berakhir). Dompet
   * lokal murni yang belum pernah di-link tetap aman, tidak ikut kehapus.
   */
  clearAccountLinkedWallets: async () => {
    const allWallets = await db.wallets.toArray()
    const linked = allWallets.filter((w) => w.cloudWalletId)

    await Promise.all(
      linked.flatMap((w) => [
        db.transactions.where('walletId').equals(w.id).delete(),
        db.goals.where('walletId').equals(w.id).delete(),
        db.insights.where('walletId').equals(w.id).delete(),
        db.debts.where('walletId').equals(w.id).delete(),
        db.debtPayments.where('walletId').equals(w.id).delete(),
        db.recurringTemplates.where('walletId').equals(w.id).delete(),
        db.wallets.delete(w.id),
      ]),
    )

    await get().loadWallets()
  },

  /**
   * Dipanggil setelah akun berhasil dihapus (src/app/api/account/delete). BEDA dari
   * `clearAccountLinkedWallets` (dipakai saat sign-out biasa, yang menghapus SEMUA wallet
   * cloud-linked tanpa pandang bulu): di sini dompet yang MASIH miliknya (tidak di-share ke
   * orang lain, dan tidak ada di `transferredWalletIds`) justru dipertahankan sebagai wallet
   * lokal biasa — sesuai keputusan "data lokal tetap ada" pas hapus akun. Yang benar-benar
   * dihapus total cuma dompet yang di-share KE dia (`isSharedWithMe`) dan dompet miliknya yang
   * baru saja ditransfer ke owner baru (sudah bukan miliknya lagi).
   */
  cleanupAfterAccountDeletion: async (transferredWalletIds) => {
    const allWallets = await db.wallets.toArray()
    const toFullyDelete = allWallets.filter(
      (w) => isSharedWithMe(w) || transferredWalletIds.includes(w.id),
    )
    const toFullyDeleteIds = new Set(toFullyDelete.map((w) => w.id))
    const toDowngrade = allWallets.filter((w) => w.cloudWalletId && !toFullyDeleteIds.has(w.id))

    await Promise.all([
      ...toFullyDelete.flatMap((w) => [
        db.transactions.where('walletId').equals(w.id).delete(),
        db.goals.where('walletId').equals(w.id).delete(),
        db.insights.where('walletId').equals(w.id).delete(),
        db.debts.where('walletId').equals(w.id).delete(),
        db.debtPayments.where('walletId').equals(w.id).delete(),
        db.recurringTemplates.where('walletId').equals(w.id).delete(),
        db.wallets.delete(w.id),
      ]),
      ...toDowngrade.map((w) =>
        db.wallets.update(w.id, { cloudWalletId: undefined, ownerRole: undefined, isShared: undefined }),
      ),
    ])

    await get().loadWallets()
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
