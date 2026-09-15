import { createClient } from '@/lib/supabase/client'
import { useWalletStore } from '@/stores/walletStore'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/components/ui/Toast'
import { formatRupiah } from '@/lib/utils'
import { logActivity } from '@/lib/sharing'
import {
  refreshWalletChildRecords,
  transactionToCloud,
  goalToCloud,
  debtToCloud,
  debtPaymentToCloud,
  recurringTemplateToCloud,
  fetchMembershipInfo,
  type MembershipInfo,
} from './mappers'
import { db } from '@/lib/db'
import type { Transaction, Goal, Debt, DebtPayment, RecurringTemplate, Wallet } from '@/types'

type CloudTable =
  | 'cloud_transactions'
  | 'cloud_goals'
  | 'cloud_debts'
  | 'cloud_debt_payments'
  | 'cloud_recurring_templates'

interface CloudContext {
  cloudWalletId: string
  userId: string
  isShared: boolean
}

function getCloudContext(walletId: string): CloudContext | null {
  const wallet = useWalletStore.getState().wallets.find((w) => w.id === walletId)
  const userId = useAuthStore.getState().user?.id
  if (!wallet?.cloudWalletId || !userId) return null
  return { cloudWalletId: wallet.cloudWalletId, userId, isShared: !!wallet.isShared }
}

async function pushUpsert(table: CloudTable, row: Record<string, unknown>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from(table).upsert(row)
  if (error) console.error(`[walletSync] push upsert ${table} gagal`, error)
}

async function pushDelete(table: CloudTable, id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) console.error(`[walletSync] push delete ${table} gagal`, error)
}

/** Catat ke activity_log HANYA kalau dompetnya benar-benar shared - hindari noise untuk dompet solo. */
function logIfShared(ctx: CloudContext, action: string, description: string, entityType: string, entityId: string) {
  if (!ctx.isShared) return
  logActivity(ctx.cloudWalletId, ctx.userId, action, description, entityType, entityId).catch(() => { })
}

/**
 * Push rename/ganti ikon-warna dompet ke cloud_wallets - dipanggil dari walletStore
 * setiap kali owner rename/ganti tampilan dompet yang sudah cloud-linked. RLS
 * `cloud_wallets_owner_all` akan menolak diam-diam (silent no-op di sisi data, cuma
 * ke-log di sini) kalau yang coba edit bukan owner - UI sendiri sudah sembunyikan
 * tombol edit untuk member non-owner (lihat wallets/page.tsx), ini cuma jaga-jaga kedua.
 */
export async function pushWalletMetadata(
  walletId: string,
  data: { name?: string; icon?: string; color?: string },
): Promise<void> {
  const ctx = getCloudContext(walletId)
  if (!ctx) return
  const supabase = createClient()
  const { error } = await supabase.from('cloud_wallets').update(data).eq('id', ctx.cloudWalletId)
  if (error) console.error('[walletSync] push wallet metadata gagal', error)
}

// ─── Lapis 1 - Backup sync ───────────────────────────────────────────────────
// Dipanggil dari store existing (transactionStore dst) setiap CRUD, TAPI cuma efektif
// kalau dompetnya sudah cloud-linked (getCloudContext return non-null) - dompet Guest
// murni lokal tidak pernah menyentuh fungsi-fungsi ini secara berarti.

export async function pushTransaction(walletId: string, t: Transaction): Promise<void> {
  const ctx = getCloudContext(walletId)
  if (!ctx) return
  await pushUpsert('cloud_transactions', transactionToCloud(t, ctx.cloudWalletId, ctx.userId))
  logIfShared(ctx, 'save_transaction', `mencatat transaksi ${formatRupiah(t.amount)} - ${t.category}`, 'transaction', t.id)
}
export async function pushTransactionDelete(walletId: string, id: string): Promise<void> {
  const ctx = getCloudContext(walletId)
  if (!ctx) return
  await pushDelete('cloud_transactions', id)
  logIfShared(ctx, 'delete_transaction', 'menghapus transaksi', 'transaction', id)
}

export async function pushGoal(walletId: string, g: Goal): Promise<void> {
  const ctx = getCloudContext(walletId)
  if (!ctx) return
  await pushUpsert('cloud_goals', goalToCloud(g, ctx.cloudWalletId, ctx.userId))
  logIfShared(ctx, 'save_goal', `mengatur limit ${g.category}: ${formatRupiah(g.limitAmount)}`, 'goal', g.id)
}
export async function pushGoalDelete(walletId: string, id: string): Promise<void> {
  const ctx = getCloudContext(walletId)
  if (!ctx) return
  await pushDelete('cloud_goals', id)
  logIfShared(ctx, 'delete_goal', 'menghapus batas kategori', 'goal', id)
}

export async function pushDebt(walletId: string, d: Debt): Promise<void> {
  const ctx = getCloudContext(walletId)
  if (!ctx) return
  await pushUpsert('cloud_debts', debtToCloud(d, ctx.cloudWalletId, ctx.userId))
  logIfShared(
    ctx,
    'save_debt',
    `mencatat ${d.type === 'hutang' ? 'hutang ke' : 'piutang dari'} ${d.person}: ${formatRupiah(d.amount)}`,
    'debt',
    d.id,
  )
}
export async function pushDebtDelete(walletId: string, id: string): Promise<void> {
  const ctx = getCloudContext(walletId)
  if (!ctx) return
  await pushDelete('cloud_debts', id)
  logIfShared(ctx, 'delete_debt', 'menghapus catatan utang/piutang', 'debt', id)
}

export async function pushDebtPayment(walletId: string, p: DebtPayment): Promise<void> {
  const ctx = getCloudContext(walletId)
  if (!ctx) return
  await pushUpsert('cloud_debt_payments', debtPaymentToCloud(p, ctx.cloudWalletId, ctx.userId))
  logIfShared(ctx, 'save_payment', `mencatat pembayaran cicilan ${formatRupiah(p.amount)}`, 'debt_payment', p.id)
}
export async function pushDebtPaymentDelete(walletId: string, id: string): Promise<void> {
  const ctx = getCloudContext(walletId)
  if (!ctx) return
  await pushDelete('cloud_debt_payments', id)
  logIfShared(ctx, 'delete_payment', 'menghapus riwayat pembayaran', 'debt_payment', id)
}

export async function pushRecurringTemplate(walletId: string, r: RecurringTemplate): Promise<void> {
  const ctx = getCloudContext(walletId)
  if (!ctx) return
  await pushUpsert('cloud_recurring_templates', recurringTemplateToCloud(r, ctx.cloudWalletId, ctx.userId))
  logIfShared(ctx, 'save_recurring', `mengatur template rutin ${formatRupiah(r.amount)}/bulan`, 'recurring_template', r.id)
}
export async function pushRecurringTemplateDelete(walletId: string, id: string): Promise<void> {
  const ctx = getCloudContext(walletId)
  if (!ctx) return
  await pushDelete('cloud_recurring_templates', id)
  logIfShared(ctx, 'delete_recurring', 'menghapus template rutin', 'recurring_template', id)
}

// ─── Lapis 2 - Collaboration sync ────────────────────────────────────────────
// Hanya berarti untuk dompet isShared===true (ada member lain) - dipanggil dari tombol
// refresh manual + auto-interval di komponen aktif (lihat useSharedWalletSync).

/**
 * Tarik ulang seluruh data dompet dari cloud (full-replace). Kalau row wallet_members-nya
 * sendiri tidak ketemu lagi (RLS block atau row dihapus SAAT SEDANG LOGIN), berarti akses
 * sudah dicabut owner - cache lokal dompet ini dihapus otomatis.
 *
 * PENTING: revocation cuma bisa disimpulkan kalau user memang sedang login. Query lewat
 * client yang belum login juga akan diblok RLS (auth.uid() null) - itu bukan tanda dicabut,
 * cuma "belum tau statusnya". Interval auto-refresh di WalletProvider tetap jalan walau user
 * baru logout (state dompetnya tidak ikut ke-reset), jadi tanpa guard ini efek logout salah
 * kesimpulan jadi "dicabut" dan hapus cache lokal yang sebenarnya masih valid.
 */
export async function refreshSharedWallet(walletId: string): Promise<{ revoked: boolean }> {
  const wallet = useWalletStore.getState().wallets.find((w) => w.id === walletId)
  if (!wallet?.cloudWalletId) return { revoked: false }

  const userId = useAuthStore.getState().user?.id
  if (!userId) return { revoked: false } // belum/tidak login - tidak bisa nentuin status akses

  const supabase = createClient()
  // 1 request gabungan (role + nama/ikon/warna dompet, lihat fetchMembershipInfo) -
  // sebelumnya ini 3 request terpisah (cek cloud_wallets, fetch role, fetch metadata).
  // null berarti baris wallet_members user ini sudah tidak ada = akses dicabut.
  const info = await fetchMembershipInfo(supabase, wallet.cloudWalletId, userId)

  if (!info) {
    await handleRevoked(walletId, wallet.name)
    return { revoked: true }
  }

  await applyMembershipInfo(wallet, info)
  // Reload supaya `ownerRole`/nama-ikon-warna yang baru disinkronkan langsung kepakai di
  // store in-memory (mis. gating canEdit, WalletSwitcher) - bukan cuma tersimpan di Dexie
  // tapi UI belum tau.
  await useWalletStore.getState().loadWallets()

  await refreshWalletChildRecords(supabase, wallet.id, wallet.cloudWalletId)
  return { revoked: false }
}

async function handleRevoked(walletId: string, walletName: string): Promise<void> {
  await useWalletStore.getState().deleteWallet(walletId)
  toast(`Akses ke dompet "${walletName}" telah dicabut oleh pemilik`, 'error')
}

/**
 * Terapkan role + nama/ikon/warna terbaru dari `fetchMembershipInfo` ke Dexie lokal -
 * owner bisa promote/demote role ATAU rename/ganti tampilan dompet kapan saja, member lain
 * tidak pernah tahu lewat Lapis 1 (cuma push CRUD data anak, bukan metadata dompet itu
 * sendiri). Dipanggil tiap refresh Lapis 2 (manual + auto-interval) dan tiap login untuk
 * dompet yang di-join (lihat accountSync.ts).
 */
export async function applyMembershipInfo(wallet: Wallet, info: MembershipInfo): Promise<void> {
  const updates: Partial<Wallet> = {}
  if (wallet.ownerRole !== 'owner' && info.role !== wallet.ownerRole) updates.ownerRole = info.role
  if (info.name !== wallet.name) updates.name = info.name
  if (info.icon !== wallet.icon) updates.icon = info.icon
  if (info.color !== wallet.color) updates.color = info.color
  if (Object.keys(updates).length > 0) await db.wallets.update(wallet.id, updates)
}
