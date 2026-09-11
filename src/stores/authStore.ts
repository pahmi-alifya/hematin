'use client'

import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { syncOnLogin } from '@/lib/sync/accountSync'
import { useWalletStore } from '@/stores/walletStore'
import { loginSchema, registerCoreSchema } from '@/lib/validation/schemas'

interface AuthResult {
  success: boolean
  error?: string
}

interface AuthStore {
  user: User | null
  isGuest: boolean
  isLoading: boolean
  isSyncing: boolean

  init: () => Promise<void>
  signUp: (data: { name: string; email: string; password: string }) => Promise<AuthResult>
  signIn: (data: { email: string; password: string }) => Promise<AuthResult>
  signOut: () => Promise<void>
}

// Guard supaya sync tidak jalan dobel: dipanggil langsung (awaited) dari signIn/signUp DAN
// dari listener onAuthStateChange (untuk kasus sesi dipulihkan di tab lain) — bisa saja
// keduanya trigger untuk userId yang sama nyaris bersamaan.
let syncInFlightForUserId: string | null = null

async function runSyncAndReload(userId: string, setSyncing: (v: boolean) => void) {
  if (syncInFlightForUserId === userId) return
  syncInFlightForUserId = userId
  setSyncing(true)
  try {
    await syncOnLogin(userId)
    await useWalletStore.getState().loadWallets()
  } catch (e) {
    console.error('[authStore] sync gagal', e)
  } finally {
    setSyncing(false)
    syncInFlightForUserId = null
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isGuest: true,
  isLoading: true,
  isSyncing: false,

  init: async () => {
    // Supabase belum di-setup (belum ada .env.local) — tetap jalan sebagai Guest,
    // jangan sampai app pengguna yang belum pernah setup Supabase ikut error.
    if (!isSupabaseConfigured()) {
      set({ user: null, isGuest: true, isLoading: false })
      return
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    set({ user, isGuest: !user, isLoading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      const wasGuest = get().isGuest
      set({ user: nextUser, isGuest: !nextUser })
      if (nextUser && wasGuest) {
        runSyncAndReload(nextUser.id, (v) => set({ isSyncing: v }))
      }
    })
  },

  signUp: async ({ name, email, password }) => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Fitur akun belum tersedia — coba lagi nanti' }
    }
    const parsed = registerCoreSchema.safeParse({ name, email, password })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Data tidak valid' }
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { name: parsed.data.name } },
    })

    if (error) return { success: false, error: error.message }
    if (data.user) {
      // Await di sini (bukan cuma lewat listener onAuthStateChange) supaya caller
      // (form register) baru redirect SETELAH data lokal selesai ke-link ke cloud —
      // kalau tidak, transaksi yang dibuat user tepat setelah daftar bisa ke-skip
      // dari sync awal karena wallet-nya belum kebagian cloudWalletId.
      set({ user: data.user, isGuest: false })
      await runSyncAndReload(data.user.id, (v) => set({ isSyncing: v }))
    }
    return { success: true }
  },

  signIn: async ({ email, password }) => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Fitur akun belum tersedia — coba lagi nanti' }
    }
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Data tidak valid' }
    }
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
    if (error) return { success: false, error: 'Email atau password salah' }
    if (data.user) {
      set({ user: data.user, isGuest: false })
      await runSyncAndReload(data.user.id, (v) => set({ isSyncing: v }))
    }
    return { success: true }
  },

  signOut: async () => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, isGuest: true })
    // Dompet cloud-linked (punya sendiri ATAU hasil join) cuma boleh kelihatan selama
    // akun itu login — kalau tidak dibersihkan, tetap nongol sebagai data "Guest" padahal
    // sebenarnya milik akun yang baru saja logout.
    await useWalletStore.getState().clearAccountLinkedWallets()
  },
}))
