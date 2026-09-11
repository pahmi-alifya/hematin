'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import { useAuthStore } from '@/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import {
  activateSharing,
  regenerateShareKey,
  setShareKeyActive,
  fetchWalletMembers,
  updateMemberRole,
  removeMember,
  fetchActivityLog,
} from '@/lib/sharing'
import { toast } from '@/components/ui/Toast'
import type { WalletMemberRow, ActivityLogRow, WalletRole } from '@/lib/supabase/types'

/** Owns seluruh data & aksi halaman Kelola Akses (key/QR, anggota, log aktivitas) — owner-only. */
export function useWalletSharing(walletId: string) {
  const wallet = useWalletStore((s) => s.wallets.find((w) => w.id === walletId))
  const userId = useAuthStore((s) => s.user?.id)

  const [shareKey, setShareKeyState] = useState<string | null>(null)
  const [shareKeyActive, setShareKeyActiveState] = useState(false)
  const [loadingKey, setLoadingKey] = useState(true)
  const [activating, setActivating] = useState(false)
  const [members, setMembers] = useState<WalletMemberRow[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [logs, setLogs] = useState<ActivityLogRow[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const loadKeyInfo = useCallback(async () => {
    if (!wallet?.cloudWalletId) {
      setShareKeyState(null)
      setShareKeyActiveState(false)
      setLoadingKey(false)
      return
    }
    setLoadingKey(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('cloud_wallets')
      .select('share_key, share_key_active')
      .eq('id', wallet.cloudWalletId)
      .maybeSingle()
    setShareKeyState((data as { share_key: string | null } | null)?.share_key ?? null)
    setShareKeyActiveState(!!(data as { share_key_active?: boolean } | null)?.share_key_active)
    setLoadingKey(false)
  }, [wallet?.cloudWalletId])

  const loadMembers = useCallback(async () => {
    if (!wallet?.cloudWalletId) return
    setLoadingMembers(true)
    setMembers(await fetchWalletMembers(wallet.cloudWalletId))
    setLoadingMembers(false)
  }, [wallet?.cloudWalletId])

  const loadLogs = useCallback(async () => {
    if (!wallet?.cloudWalletId) return
    setLoadingLogs(true)
    setLogs(await fetchActivityLog(wallet.cloudWalletId))
    setLoadingLogs(false)
  }, [wallet?.cloudWalletId])

  useEffect(() => {
    loadKeyInfo()
    loadMembers()
    loadLogs()
  }, [loadKeyInfo, loadMembers, loadLogs])

  async function handleActivate() {
    if (!wallet || !userId) return toast('Silahkan login terlebih dahulu', 'info')
    setActivating(true)
    try {
      const key = await activateSharing(wallet, userId)
      setShareKeyState(key)
      setShareKeyActiveState(true)
      toast('Sharing diaktifkan', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal mengaktifkan sharing', 'error')
    } finally {
      setActivating(false)
    }
  }

  async function handleRegenerate() {
    if (!wallet?.cloudWalletId) return
    setActivating(true)
    try {
      const key = await regenerateShareKey(wallet.cloudWalletId)
      setShareKeyState(key)
      setShareKeyActiveState(true)
      toast('Key baru berhasil dibuat', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal membuat key baru', 'error')
    } finally {
      setActivating(false)
    }
  }

  async function handleToggleActive(active: boolean) {
    if (!wallet?.cloudWalletId) return
    try {
      await setShareKeyActive(wallet.cloudWalletId, active)
      setShareKeyActiveState(active)
      toast(active ? 'Sharing diaktifkan kembali' : 'Sharing dinonaktifkan sementara', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal mengubah status', 'error')
    }
  }

  async function handleRoleChange(memberId: string, role: WalletRole) {
    try {
      await updateMemberRole(memberId, role)
      await loadMembers()
      toast('Role berhasil diubah', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal mengubah role', 'error')
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      await removeMember(memberId)
      await loadMembers()
      toast('Anggota dihapus', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal menghapus anggota', 'error')
    }
  }

  return {
    wallet,
    shareKey,
    shareKeyActive,
    loadingKey,
    activating,
    members,
    loadingMembers,
    logs,
    loadingLogs,
    handleActivate,
    handleRegenerate,
    handleToggleActive,
    handleRoleChange,
    handleRemoveMember,
  }
}
