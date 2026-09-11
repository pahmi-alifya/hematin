import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'
import {
  uploadWalletChildRecords,
  downloadWalletChildRecordsFresh,
  ensureOwnerMembership,
  fetchMembershipInfo,
} from './mappers'
import { forkWalletForReclaim } from './walletReclaim'
import { applyMembershipInfo } from './walletSync'
import { useWalletStore } from '@/stores/walletStore'
import type { Wallet } from '@/types'
import type { CloudWalletRow, WalletRole } from '@/lib/supabase/types'

/**
 * Full 2-way sync yang dijalankan sekali setiap kali auth state berubah jadi
 * "logged in" (signup maupun signin) — lihat docs/planning-multi-dompet-sharing-auth.md §3.6.
 *
 * Arah UPLOAD: dompet lokal yang belum cloud-linked (`cloudWalletId` kosong) di-upload
 * penuh ke Supabase dan ditandai linked.
 * Arah DOWNLOAD: dompet cloud milik akun ini yang belum ada di device ini di-download
 * penuh ke Dexie lokal.
 *
 * Sinkronisasi berkelanjutan setelahnya (tiap CRUD, plus tarik perubahan dari member lain
 * di dompet yang di-share) ditangani `src/lib/sync/walletSync.ts` (Fase 3 §4.4).
 */
export async function syncOnLogin(userId: string): Promise<void> {
  await reclaimMismatchedWallets(userId)
  const accountHasExistingCloudWallets = await hasExistingCloudWallets(userId)
  const emptyUploadedIds = await uploadUnlinkedWallets(userId, accountHasExistingCloudWallets)
  const downloadedIds = await downloadMissingCloudWallets(userId)
  const memberDownloadedIds = await downloadMissingMemberWallets(userId)
  await ensureOwnerMembershipForLinkedWallets(userId)
  await refreshJoinedWalletRoles(userId)
  await reconcileActiveWalletAfterRestore(emptyUploadedIds, [...downloadedIds, ...memberDownloadedIds])
}

/** Akun ini sudah punya dompet cloud (dari sesi lain) atau belum sama sekali — dipakai
 * `uploadUnlinkedWallets` buat mutuskan boleh-tidaknya upload dompet lokal kosong. */
async function hasExistingCloudWallets(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('cloud_wallets')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', userId)
  if (error) {
    console.error('[accountSync] gagal cek existing cloud_wallets', error)
    return false // gagal cek -> fallback ke perilaku lama (tetap upload, aman walau berpotensi duplikat)
  }
  return (count ?? 0) > 0
}

/**
 * Kalau IndexedDB browser baru saja kepencet clear (cache/site-data) SEBELUM user login lagi,
 * `walletStore.loadWallets()` sudah kadung bikin "Dompet Utama" baru yang kosong (first-run
 * fallback biasa) dan itu jadi activeWalletId. Begitu login, dompet kosong itu ke-upload
 * sebagai dompet BARU (id beda dari yang lama), sementara dompet LAMA yang beneran isinya
 * ke-download terpisah — tapi activeWalletId tetap nempel ke yang kosong karena idnya masih
 * "ada" secara lokal. User jadi ngira semua data hilang padahal cuma nyasar ke dompet yang
 * gak aktif. Kalau pola ini kedeteksi (upload sesuatu yang kosong + ada juga yang berhasil
 * di-restore dari cloud), pindahkan activeWallet ke dompet yang di-restore.
 */
async function reconcileActiveWalletAfterRestore(emptyUploadedIds: string[], downloadedIds: string[]): Promise<void> {
  if (emptyUploadedIds.length === 0 || downloadedIds.length === 0) return
  const activeWalletId = useWalletStore.getState().activeWalletId
  if (activeWalletId && emptyUploadedIds.includes(activeWalletId)) {
    useWalletStore.getState().setActiveWallet(downloadedIds[0])
  }
}

async function isWalletEmpty(walletId: string): Promise<boolean> {
  const counts = await Promise.all([
    db.transactions.where('walletId').equals(walletId).count(),
    db.goals.where('walletId').equals(walletId).count(),
    db.debts.where('walletId').equals(walletId).count(),
    db.debtPayments.where('walletId').equals(walletId).count(),
    db.recurringTemplates.where('walletId').equals(walletId).count(),
  ])
  return counts.every((c) => c === 0)
}

/**
 * Dompet yang di-join lewat share key (`ownerRole` viewer/editor) bisa saja rolenya, atau
 * nama/ikon/warnanya, sudah diubah owner dari device lain — tanpa ini, member harus nunggu
 * refresh Lapis 2 (interval otomatis / tombol manual) baru kepakai. Disamakan juga di sini
 * biar langsung benar begitu login, bukan cuma pas dompetnya lagi aktif dibuka.
 */
async function refreshJoinedWalletRoles(userId: string): Promise<void> {
  const supabase = createClient()
  const localWallets = await db.wallets.toArray()
  const joined = localWallets.filter((w) => w.cloudWalletId && w.ownerRole && w.ownerRole !== 'owner')
  for (const wallet of joined) {
    const info = await fetchMembershipInfo(supabase, wallet.cloudWalletId!, userId)
    if (info) await applyMembershipInfo(wallet, info)
  }
}

/**
 * Dompet lokal browser ini bisa saja cloud-linked ke akun LAIN dari sesi testing
 * sebelumnya (device/browser yang sama, akun berbeda) — RLS `wallet_members_owner_write`
 * akan menolak (42501) kalau kita coba klaim ownership untuk akun yang salah, dan itu
 * benar, bukan bug di RLS-nya. Di sini kita verifikasi dulu owner_id sebelum mencoba:
 * kalau bukan milik akun yang sedang login, lepas link lama & pindahkan datanya ke id
 * lokal baru (lihat walletReclaim.ts) supaya `uploadUnlinkedWallets` di bawah bisa upload
 * ulang sebagai dompet baru milik akun ini.
 */
async function reclaimMismatchedWallets(userId: string): Promise<void> {
  const supabase = createClient()
  const localWallets = await db.wallets.toArray()
  const ownedLinked = localWallets.filter((w) => w.cloudWalletId && w.ownerRole === 'owner')

  for (const wallet of ownedLinked) {
    const { data, error } = await supabase
      .from('cloud_wallets')
      .select('owner_id')
      .eq('id', wallet.cloudWalletId!)
      .maybeSingle()

    if (error) {
      console.error('[accountSync] gagal verifikasi ownership dompet', wallet.id, error)
      continue // transient error — coba lagi login berikutnya, jangan reclaim
    }
    if (data?.owner_id === userId) continue // ownership valid, tidak perlu reclaim

    console.warn('[accountSync] dompet', wallet.id, 'cloud-linked ke akun lain — reclaim sebagai dompet baru')
    await forkWalletForReclaim(wallet.id)
  }
}

/**
 * Self-heal: dompet yang SUDAH cloud-linked (dari login sebelumnya) tapi gagal dapat
 * row wallet_members-nya (mis. migration Fase 3 belum jalan waktu itu) akan dicoba lagi
 * di sini setiap login — bukan cuma sekali saat pertama kali link seperti di
 * `uploadUnlinkedWallets`.
 */
async function ensureOwnerMembershipForLinkedWallets(userId: string): Promise<void> {
  const supabase = createClient()
  const localWallets = await db.wallets.toArray()
  const ownedLinked = localWallets.filter((w) => w.cloudWalletId && w.ownerRole === 'owner')
  for (const wallet of ownedLinked) {
    await ensureOwnerMembership(supabase, wallet.cloudWalletId!, userId)
  }
}

async function uploadUnlinkedWallets(userId: string, accountHasExistingCloudWallets: boolean): Promise<string[]> {
  const supabase = createClient()
  const localWallets = await db.wallets.toArray()
  const unlinked = localWallets.filter((w) => !w.cloudWalletId)
  const emptyUploadedIds: string[] = []

  for (const wallet of unlinked) {
    const wasEmpty = await isWalletEmpty(wallet.id)

    if (wasEmpty && accountHasExistingCloudWallets) {
      // Dompet lokal kosong ini hampir pasti cuma "Dompet Utama" bawaan first-run (abis
      // clear cache / incognito / guest baru) — akun ini SUDAH punya dompet asli di cloud,
      // jadi jangan upload jadi dompet duplikat baru yang kosong (kalau tidak, tiap kali
      // orang coba guest->login lagi bakal numpuk "Dompet Utama" kosong tanpa henti).
      // Buang lokal, biar download di bawah yang jadi sumber kebenaran.
      await db.wallets.delete(wallet.id)
      continue
    }

    const { error: walletErr } = await supabase.from('cloud_wallets').insert({
      id: wallet.id,
      owner_id: userId,
      name: wallet.name,
      icon: wallet.icon,
      color: wallet.color,
    })
    if (walletErr) {
      console.error('[accountSync] gagal upload dompet', wallet.id, walletErr)
      continue
    }

    // Owner otomatis jadi member pertama dengan role 'owner' — dibutuhkan RLS Fase 3
    // (§4) untuk membedakan owner/editor/viewer, meski dompet ini belum di-share.
    // Idempotent (upsert) — kalau gagal sekali, login berikutnya otomatis coba lagi karena
    // fungsi ini dipanggil terlepas dari status cloudWalletId (lihat juga sharing.ts).
    await ensureOwnerMembership(supabase, wallet.id, userId)

    await uploadWalletChildRecords(supabase, wallet.id, wallet.id, userId)

    await db.wallets.update(wallet.id, {
      cloudWalletId: wallet.id,
      ownerRole: 'owner',
      isShared: false,
    })

    if (wasEmpty) emptyUploadedIds.push(wallet.id)
  }

  return emptyUploadedIds
}

interface WalletMembershipRow {
  wallet_id: string
  role: WalletRole
  cloud_wallets: Pick<CloudWalletRow, 'id' | 'name' | 'icon' | 'color' | 'created_at'> | null
}

/**
 * Dompet yang di-JOIN lewat share key (viewer/editor, bukan owner) sebelumnya cuma bisa
 * muncul lagi di device kalau di-join ulang pakai key-nya — tidak ada cara buat "nemuin
 * lagi" dompet yang membership-nya sudah ada tapi cache lokalnya hilang (device baru, abis
 * clear cache, dst), beda dengan dompet milik sendiri yang otomatis ke-download ulang lewat
 * `downloadMissingCloudWallets`. Di sini disamakan: query wallet_members milik user ini
 * (role apa saja selain owner), lalu download tiap dompet yang belum ada lokal.
 */
async function downloadMissingMemberWallets(userId: string): Promise<string[]> {
  const supabase = createClient()
  const { data: memberships, error } = await supabase
    .from('wallet_members')
    .select('wallet_id, role, cloud_wallets(id, name, icon, color, created_at)')
    .eq('user_id', userId)
    .neq('role', 'owner')

  if (error || !memberships) {
    if (error) console.error('[accountSync] gagal fetch wallet_members (membership)', error)
    return []
  }

  const localWallets = await db.wallets.toArray()
  const localCloudIds = new Set(localWallets.map((w) => w.cloudWalletId).filter(Boolean))
  let nextOrder = localWallets.length
  const downloadedIds: string[] = []

  for (const m of memberships as unknown as WalletMembershipRow[]) {
    const cw = m.cloud_wallets
    if (!cw || localCloudIds.has(cw.id)) continue

    const wallet: Wallet = {
      id: cw.id,
      name: cw.name,
      icon: cw.icon,
      color: cw.color,
      isDefault: false,
      createdAt: new Date(cw.created_at).getTime(),
      order: nextOrder++,
      cloudWalletId: cw.id,
      ownerRole: m.role,
      isShared: true,
    }
    await db.wallets.add(wallet)
    await downloadWalletChildRecordsFresh(supabase, cw.id)
    downloadedIds.push(wallet.id)
  }

  return downloadedIds
}

async function downloadMissingCloudWallets(userId: string): Promise<string[]> {
  const supabase = createClient()
  const { data: cloudWallets, error } = await supabase
    .from('cloud_wallets')
    .select('*')
    .eq('owner_id', userId)

  if (error || !cloudWallets) {
    if (error) console.error('[accountSync] gagal fetch cloud_wallets', error)
    return []
  }

  const localWallets = await db.wallets.toArray()
  const localCloudIds = new Set(localWallets.map((w) => w.cloudWalletId).filter(Boolean))
  let nextOrder = localWallets.length
  const downloadedIds: string[] = []

  for (const cw of cloudWallets as CloudWalletRow[]) {
    if (localCloudIds.has(cw.id)) continue

    const wallet: Wallet = {
      id: cw.id,
      name: cw.name,
      icon: cw.icon,
      color: cw.color,
      isDefault: false,
      createdAt: new Date(cw.created_at).getTime(),
      order: nextOrder++,
      cloudWalletId: cw.id,
      ownerRole: 'owner',
      isShared: false,
    }
    await db.wallets.add(wallet)
    await downloadWalletChildRecordsFresh(supabase, cw.id)
    downloadedIds.push(wallet.id)
  }

  return downloadedIds
}
