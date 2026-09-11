import { db } from '@/lib/db'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Transaction, Goal, Debt, DebtPayment, RecurringTemplate } from '@/types'
import type {
  CloudWalletRow,
  CloudTransactionRow,
  CloudGoalRow,
  CloudDebtRow,
  CloudDebtPaymentRow,
  CloudRecurringTemplateRow,
  WalletRole,
} from '@/lib/supabase/types'

export interface MembershipInfo {
  role: WalletRole
  name: string
  icon: string
  color: string
}

interface MembershipRow {
  role: WalletRole
  cloud_wallets: Pick<CloudWalletRow, 'name' | 'icon' | 'color'> | null
}

/**
 * Satu query gabungan: role member + nama/ikon/warna dompet saat ini, lewat join
 * wallet_members -> cloud_wallets. Dipakai refresh Lapis 2 & sync saat login untuk
 * sinkronkan `ownerRole`/metadata lokal yang bisa jadi basi (owner ubah role atau
 * rename/ganti tampilan dompet dari device lain) — sebelumnya ini 2 query terpisah
 * (fetchMemberRole + fetchWalletMetadata), digabung supaya request ke Supabase lebih
 * hemat (lihat `applyMembershipInfo` di walletSync.ts). Return null kalau row wallet_members
 * tidak ketemu — dipakai juga sebagai sinyal "sudah tidak jadi member" (revoked).
 */
export async function fetchMembershipInfo(
  supabase: SupabaseClient,
  cloudWalletId: string,
  userId: string,
): Promise<MembershipInfo | null> {
  const { data, error } = await supabase
    .from('wallet_members')
    .select('role, cloud_wallets(name, icon, color)')
    .eq('wallet_id', cloudWalletId)
    .eq('user_id', userId)
    .maybeSingle()
  const row = data as unknown as MembershipRow | null
  if (error || !row?.cloud_wallets) return null
  return { role: row.role, name: row.cloud_wallets.name, icon: row.cloud_wallets.icon, color: row.cloud_wallets.color }
}

/**
 * Pastikan owner punya row wallet_members untuk dompet ini — idempotent (aman dipanggil
 * berkali-kali, termasuk untuk dompet yang SUDAH cloud-linked). Ini yang bikin proses
 * self-healing: kalau insert wallet_members gagal di satu login (mis. migration Fase 3
 * belum jalan / RLS bermasalah saat itu), login berikutnya akan otomatis coba lagi —
 * tidak seperti cloudWalletId yang begitu ke-set, tidak pernah dicoba ulang.
 */
export async function ensureOwnerMembership(supabase: SupabaseClient, walletId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('wallet_members')
    .upsert({ wallet_id: walletId, user_id: userId, role: 'owner' }, { onConflict: 'wallet_id,user_id', ignoreDuplicates: true })
  if (error) console.error('[mappers] gagal ensure wallet_members (owner)', error)
}

// ─── Local → Cloud (dipakai saat upload/push) ───────────────────────────────

export function transactionToCloud(t: Transaction, walletId: string, userId: string) {
  return {
    id: t.id,
    wallet_id: walletId,
    type: t.type,
    amount: t.amount,
    category: t.category,
    merchant: t.merchant ?? null,
    notes: t.notes ?? null,
    date: t.date,
    source: t.source,
    recurring_id: t.recurringId ?? null,
    created_by: userId,
    updated_at: new Date().toISOString(),
  }
}

export function goalToCloud(g: Goal, walletId: string, userId: string) {
  return {
    id: g.id,
    wallet_id: walletId,
    category: g.category,
    limit_amount: g.limitAmount,
    created_by: userId,
    updated_at: new Date().toISOString(),
  }
}

export function debtToCloud(d: Debt, walletId: string, userId: string) {
  return {
    id: d.id,
    wallet_id: walletId,
    type: d.type,
    person: d.person,
    amount: d.amount,
    due_date: d.dueDate ?? null,
    description: d.description ?? null,
    status: d.status,
    paid_at: d.paidAt ?? null,
    notes: d.notes ?? null,
    is_cicilan: d.isCicilan ?? false,
    cicilan_amount: d.cicilanAmount ?? null,
    cicilan_day: d.cicilanDay ?? null,
    cicilan_start_month: d.cicilanStartMonth ?? null,
    created_by: userId,
    updated_at: new Date().toISOString(),
  }
}

export function debtPaymentToCloud(p: DebtPayment, walletId: string, userId: string) {
  return {
    id: p.id,
    wallet_id: walletId,
    debt_id: p.debtId,
    amount: p.amount,
    paid_date: p.paidDate,
    month: p.month,
    notes: p.notes ?? null,
    created_by: userId,
  }
}

export function recurringTemplateToCloud(r: RecurringTemplate, walletId: string, userId: string) {
  return {
    id: r.id,
    wallet_id: walletId,
    type: r.type,
    amount: r.amount,
    category: r.category,
    merchant: r.merchant ?? null,
    notes: r.notes ?? null,
    recurring_day: r.recurringDay,
    is_active: r.isActive,
    last_generated_month: r.lastGeneratedMonth ?? null,
    created_by: userId,
    updated_at: new Date().toISOString(),
  }
}

// ─── Cloud → Local (dipakai saat download/fetch) ────────────────────────────

export function transactionFromCloud(t: CloudTransactionRow): Transaction {
  return {
    id: t.id,
    walletId: t.wallet_id,
    type: t.type,
    amount: t.amount,
    category: t.category,
    merchant: t.merchant ?? undefined,
    notes: t.notes ?? undefined,
    date: t.date,
    createdAt: new Date(t.created_at).getTime(),
    source: t.source,
    recurringId: t.recurring_id ?? undefined,
  }
}

export function goalFromCloud(g: CloudGoalRow): Goal {
  return {
    id: g.id,
    walletId: g.wallet_id,
    category: g.category,
    limitAmount: g.limit_amount,
    createdAt: new Date(g.created_at).getTime(),
  }
}

export function debtFromCloud(d: CloudDebtRow): Debt {
  return {
    id: d.id,
    walletId: d.wallet_id,
    type: d.type,
    person: d.person,
    amount: d.amount,
    dueDate: d.due_date ?? undefined,
    description: d.description ?? undefined,
    status: d.status,
    paidAt: d.paid_at ?? undefined,
    notes: d.notes ?? undefined,
    isCicilan: d.is_cicilan,
    cicilanAmount: d.cicilan_amount ?? undefined,
    cicilanDay: d.cicilan_day ?? undefined,
    cicilanStartMonth: d.cicilan_start_month ?? undefined,
    createdAt: new Date(d.created_at).getTime(),
  }
}

export function debtPaymentFromCloud(p: CloudDebtPaymentRow): DebtPayment {
  return {
    id: p.id,
    walletId: p.wallet_id,
    debtId: p.debt_id,
    amount: p.amount,
    paidDate: p.paid_date,
    month: p.month,
    notes: p.notes ?? undefined,
    createdAt: new Date(p.created_at).getTime(),
  }
}

export function recurringTemplateFromCloud(r: CloudRecurringTemplateRow): RecurringTemplate {
  return {
    id: r.id,
    walletId: r.wallet_id,
    type: r.type,
    amount: r.amount,
    category: r.category,
    merchant: r.merchant ?? undefined,
    notes: r.notes ?? undefined,
    recurringDay: r.recurring_day,
    isActive: r.is_active,
    lastGeneratedMonth: r.last_generated_month ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
  }
}

// ─── Komposit: upload/download semua data anak satu dompet ─────────────────

/** Upload seluruh transactions/goals/debts/debtPayments/recurringTemplates satu dompet lokal ke cloud. */
export async function uploadWalletChildRecords(
  supabase: SupabaseClient,
  localWalletId: string,
  cloudWalletId: string,
  userId: string,
): Promise<void> {
  const [transactions, goals, debts, debtPayments, recurringTemplates] = await Promise.all([
    db.transactions.where('walletId').equals(localWalletId).toArray(),
    db.goals.where('walletId').equals(localWalletId).toArray(),
    db.debts.where('walletId').equals(localWalletId).toArray(),
    db.debtPayments.where('walletId').equals(localWalletId).toArray(),
    db.recurringTemplates.where('walletId').equals(localWalletId).toArray(),
  ])

  if (transactions.length) {
    const { error } = await supabase
      .from('cloud_transactions')
      .insert(transactions.map((t) => transactionToCloud(t, cloudWalletId, userId)))
    if (error) console.error('[mappers] upload cloud_transactions gagal', error)
  }
  if (goals.length) {
    const { error } = await supabase.from('cloud_goals').insert(goals.map((g) => goalToCloud(g, cloudWalletId, userId)))
    if (error) console.error('[mappers] upload cloud_goals gagal', error)
  }
  if (debts.length) {
    const { error } = await supabase.from('cloud_debts').insert(debts.map((d) => debtToCloud(d, cloudWalletId, userId)))
    if (error) console.error('[mappers] upload cloud_debts gagal', error)
  }
  if (debtPayments.length) {
    const { error } = await supabase
      .from('cloud_debt_payments')
      .insert(debtPayments.map((p) => debtPaymentToCloud(p, cloudWalletId, userId)))
    if (error) console.error('[mappers] upload cloud_debt_payments gagal', error)
  }
  if (recurringTemplates.length) {
    const { error } = await supabase
      .from('cloud_recurring_templates')
      .insert(recurringTemplates.map((r) => recurringTemplateToCloud(r, cloudWalletId, userId)))
    if (error) console.error('[mappers] upload cloud_recurring_templates gagal', error)
  }
}

/** Download data satu dompet cloud ke Dexie — dipakai saat dompet ini BELUM ADA sama sekali secara lokal. */
export async function downloadWalletChildRecordsFresh(supabase: SupabaseClient, cloudWalletId: string): Promise<void> {
  const [
    { data: transactions },
    { data: goals },
    { data: debts },
    { data: debtPayments },
    { data: recurringTemplates },
  ] = await Promise.all([
    supabase.from('cloud_transactions').select('*').eq('wallet_id', cloudWalletId),
    supabase.from('cloud_goals').select('*').eq('wallet_id', cloudWalletId),
    supabase.from('cloud_debts').select('*').eq('wallet_id', cloudWalletId),
    supabase.from('cloud_debt_payments').select('*').eq('wallet_id', cloudWalletId),
    supabase.from('cloud_recurring_templates').select('*').eq('wallet_id', cloudWalletId),
  ])

  if (transactions?.length) await db.transactions.bulkAdd((transactions as CloudTransactionRow[]).map(transactionFromCloud))
  if (goals?.length) await db.goals.bulkAdd((goals as CloudGoalRow[]).map(goalFromCloud))
  if (debts?.length) await db.debts.bulkAdd((debts as CloudDebtRow[]).map(debtFromCloud))
  if (debtPayments?.length) await db.debtPayments.bulkAdd((debtPayments as CloudDebtPaymentRow[]).map(debtPaymentFromCloud))
  if (recurringTemplates?.length) {
    await db.recurringTemplates.bulkAdd((recurringTemplates as CloudRecurringTemplateRow[]).map(recurringTemplateFromCloud))
  }
}

/**
 * Refresh data satu dompet yang SUDAH ADA secara lokal — hapus semua record lama wallet ini
 * lalu ganti dengan snapshot terbaru dari cloud (full-replace, bukan incremental). Dipakai
 * sync engine Lapis 2 (collaboration sync) untuk menarik perubahan dari member lain.
 */
export async function refreshWalletChildRecords(
  supabase: SupabaseClient,
  localWalletId: string,
  cloudWalletId: string,
): Promise<void> {
  await Promise.all([
    db.transactions.where('walletId').equals(localWalletId).delete(),
    db.goals.where('walletId').equals(localWalletId).delete(),
    db.debts.where('walletId').equals(localWalletId).delete(),
    db.debtPayments.where('walletId').equals(localWalletId).delete(),
    db.recurringTemplates.where('walletId').equals(localWalletId).delete(),
  ])
  await downloadWalletChildRecordsFresh(supabase, cloudWalletId)
}
