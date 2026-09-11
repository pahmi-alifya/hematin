import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'
import { useWalletStore } from '@/stores/walletStore'
import { uploadWalletChildRecords, downloadWalletChildRecordsFresh, ensureOwnerMembership } from '@/lib/sync/mappers'
import type { Wallet } from '@/types'
import type { WalletMemberRow, ActivityLogRow, WalletRole } from '@/lib/supabase/types'

const MAX_KEY_GEN_ATTEMPTS = 5

/** Pastikan dompet ini sudah cloud-linked (upload snapshot kalau belum pernah). */
async function ensureCloudLinked(wallet: Wallet, userId: string): Promise<string> {
  const supabase = createClient()

  if (wallet.cloudWalletId) {
    // Sudah linked dari sebelumnya — tetap pastikan row wallet_members owner ada
    // (self-heal kalau gagal di attempt sebelumnya, lihat accountSync.ts).
    await ensureOwnerMembership(supabase, wallet.cloudWalletId, userId)
    return wallet.cloudWalletId
  }

  const { error } = await supabase.from('cloud_wallets').insert({
    id: wallet.id,
    owner_id: userId,
    name: wallet.name,
    icon: wallet.icon,
    color: wallet.color,
  })
  if (error) throw new Error('Gagal menyiapkan dompet untuk sharing')

  await ensureOwnerMembership(supabase, wallet.id, userId)
  await uploadWalletChildRecords(supabase, wallet.id, wallet.id, userId)

  await db.wallets.update(wallet.id, { cloudWalletId: wallet.id, ownerRole: 'owner' })
  return wallet.id
}

async function generateUniqueShareKey(cloudWalletId: string): Promise<string> {
  const supabase = createClient()
  for (let attempt = 0; attempt < MAX_KEY_GEN_ATTEMPTS; attempt++) {
    const key = crypto.randomUUID()
    const { error } = await supabase
      .from('cloud_wallets')
      .update({ share_key: key, share_key_active: true })
      .eq('id', cloudWalletId)
    if (!error) return key
    // unique_violation (23505) -> key sudah dipakai wallet lain, coba lagi
    if (error.code !== '23505') throw new Error('Gagal membuat share key')
  }
  throw new Error('Gagal membuat share key unik, coba lagi')
}

/** Aktifkan sharing untuk sebuah dompet: link ke cloud kalau belum, lalu generate share key. */
export async function activateSharing(wallet: Wallet, userId: string): Promise<string> {
  const cloudWalletId = await ensureCloudLinked(wallet, userId)
  const key = await generateUniqueShareKey(cloudWalletId)
  await db.wallets.update(wallet.id, { isShared: true })
  await useWalletStore.getState().loadWallets()
  return key
}

/** Key lama langsung tidak bisa dipakai join baru; member yang sudah join tetap punya akses. */
export async function regenerateShareKey(cloudWalletId: string): Promise<string> {
  return generateUniqueShareKey(cloudWalletId)
}

export async function setShareKeyActive(cloudWalletId: string, active: boolean): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('cloud_wallets').update({ share_key_active: active }).eq('id', cloudWalletId)
  if (error) throw new Error('Gagal mengubah status sharing')
}

interface JoinResult {
  success: boolean
  error?: string
}

/** Satu-satunya jalur join — panggil RPC (validasi share_key di server), lalu download data awal. */
export async function joinWalletByKey(shareKey: string): Promise<JoinResult> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('join_wallet_by_key', { p_share_key: shareKey })

  if (error || !data || data.length === 0) {
    return { success: false, error: error?.message ?? 'Key tidak valid' }
  }

  const row = data[0] as {
    wallet_id: string
    wallet_name: string
    wallet_icon: string
    wallet_color: string
    member_role: WalletRole
  }

  const existing = await db.wallets.get(row.wallet_id)
  if (existing) return { success: true } // sudah pernah join & data ada lokal

  const localWallets = await db.wallets.toArray()
  const wallet: Wallet = {
    id: row.wallet_id,
    name: row.wallet_name,
    icon: row.wallet_icon,
    color: row.wallet_color,
    isDefault: false,
    createdAt: Date.now(),
    order: localWallets.length,
    cloudWalletId: row.wallet_id,
    ownerRole: row.member_role,
    isShared: true,
  }
  await db.wallets.add(wallet)
  await downloadWalletChildRecordsFresh(supabase, row.wallet_id)
  await useWalletStore.getState().loadWallets()

  return { success: true }
}

export async function fetchWalletMembers(cloudWalletId: string): Promise<WalletMemberRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('wallet_members')
    .select('*, profiles(name)')
    .eq('wallet_id', cloudWalletId)
    .order('joined_at', { ascending: true })
  if (error) {
    console.error('[sharing] gagal fetch members', error)
    return []
  }
  return (data ?? []) as WalletMemberRow[]
}

export async function updateMemberRole(memberId: string, role: WalletRole): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('wallet_members').update({ role }).eq('id', memberId)
  if (error) throw new Error('Gagal mengubah role')
}

export async function removeMember(memberId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('wallet_members').delete().eq('id', memberId)
  if (error) throw new Error('Gagal menghapus anggota')
}

/**
 * Member (editor/viewer) keluar dari dompet yang di-share — lewat RPC security definer
 * karena RLS `wallet_members_owner_write` cuma izinkan OWNER yang insert/update/delete baris
 * wallet_members, member tidak bisa hapus baris membership-nya sendiri langsung dari client.
 */
export async function leaveWallet(cloudWalletId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('leave_wallet', { p_wallet_id: cloudWalletId })
  if (error) throw new Error(error.message || 'Gagal keluar dari dompet')
}

/**
 * OWNER hapus dompet dari cloud sepenuhnya — cascade FK ke wallet_members, activity_log,
 * dan semua 5 tabel data anak (semua `references cloud_wallets(id) on delete cascade`),
 * jadi anggota lain otomatis kehilangan akses juga. RLS `cloud_wallets_owner_all` sudah
 * izinkan owner delete langsung, tidak perlu RPC.
 */
export async function deleteCloudWallet(cloudWalletId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('cloud_wallets').delete().eq('id', cloudWalletId)
  if (error) throw new Error('Gagal menghapus dompet dari cloud')
}

export async function fetchActivityLog(cloudWalletId: string): Promise<ActivityLogRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('activity_log')
    .select('*, profiles(name)')
    .eq('wallet_id', cloudWalletId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    console.error('[sharing] gagal fetch activity log', error)
    return []
  }
  return (data ?? []) as ActivityLogRow[]
}

export async function logActivity(
  cloudWalletId: string,
  actorId: string,
  action: string,
  description: string,
  entityType?: string,
  entityId?: string,
): Promise<void> {
  const supabase = createClient()
  await supabase.from('activity_log').insert({
    wallet_id: cloudWalletId,
    actor_id: actorId,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    description,
  })
}
