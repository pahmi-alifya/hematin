import { db } from '@/lib/db'
import type { Transaction, Goal, Debt, RecurringTemplate } from '@/types'

const BACKUP_VERSION = 1
const APP_VERSION = '1.0.0'

export interface HematinBackup {
  version: number
  appVersion: string
  exportedAt: string
  data: {
    transactions: Transaction[]
    goals: Goal[]
    debts: Debt[]
    recurringTemplates: RecurringTemplate[]
  }
}

export interface ImportPreview {
  transactions: number
  goals: number
  debts: number
  recurringTemplates: number
}

export type ImportMode = 'merge' | 'replace'

// ─── Export ─────────────────────────────────────────────────────────────────

export async function exportData(): Promise<HematinBackup> {
  const [transactions, goals, debts, recurringTemplates] = await Promise.all([
    db.transactions.toArray(),
    db.goals.toArray(),
    db.debts.toArray(),
    db.recurringTemplates.toArray(),
  ])

  return {
    version: BACKUP_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data: { transactions, goals, debts, recurringTemplates },
  }
}

export async function downloadBackup(): Promise<void> {
  const backup = await exportData()
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const date = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `hematin-backup-${date}.json`
  a.click()

  URL.revokeObjectURL(url)
}

// ─── Validate ────────────────────────────────────────────────────────────────

export function validateBackupFile(parsed: unknown): HematinBackup {
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('File tidak valid: bukan objek JSON')
  }

  const obj = parsed as Record<string, unknown>

  if (typeof obj.version !== 'number') {
    throw new Error('File tidak valid: field "version" tidak ditemukan')
  }
  if (typeof obj.exportedAt !== 'string') {
    throw new Error('File tidak valid: field "exportedAt" tidak ditemukan')
  }
  if (typeof obj.data !== 'object' || obj.data === null) {
    throw new Error('File tidak valid: field "data" tidak ditemukan')
  }

  const data = obj.data as Record<string, unknown>

  if (!Array.isArray(data.transactions)) {
    throw new Error('File tidak valid: "data.transactions" harus berupa array')
  }
  if (!Array.isArray(data.goals)) {
    throw new Error('File tidak valid: "data.goals" harus berupa array')
  }
  if (!Array.isArray(data.debts)) {
    throw new Error('File tidak valid: "data.debts" harus berupa array')
  }
  if (!Array.isArray(data.recurringTemplates)) {
    throw new Error('File tidak valid: "data.recurringTemplates" harus berupa array')
  }

  return parsed as HematinBackup
}

export function getImportPreview(backup: HematinBackup): ImportPreview {
  return {
    transactions: backup.data.transactions.length,
    goals: backup.data.goals.length,
    debts: backup.data.debts.length,
    recurringTemplates: backup.data.recurringTemplates.length,
  }
}

// ─── Import ──────────────────────────────────────────────────────────────────

export async function importData(
  backup: HematinBackup,
  mode: ImportMode,
): Promise<void> {
  const { transactions, goals, debts, recurringTemplates } = backup.data

  if (mode === 'replace') {
    await Promise.all([
      db.transactions.clear(),
      db.goals.clear(),
      db.debts.clear(),
      db.recurringTemplates.clear(),
    ])

    await Promise.all([
      db.transactions.bulkAdd(transactions),
      db.goals.bulkAdd(goals),
      db.debts.bulkAdd(debts),
      db.recurringTemplates.bulkAdd(recurringTemplates),
    ])
  } else {
    // merge — skip existing IDs
    const [existingTxIds, existingGoalIds, existingDebtIds, existingRecurIds] =
      await Promise.all([
        db.transactions.toCollection().primaryKeys(),
        db.goals.toCollection().primaryKeys(),
        db.debts.toCollection().primaryKeys(),
        db.recurringTemplates.toCollection().primaryKeys(),
      ])

    const txIdSet = new Set(existingTxIds as string[])
    const goalIdSet = new Set(existingGoalIds as string[])
    const debtIdSet = new Set(existingDebtIds as string[])
    const recurIdSet = new Set(existingRecurIds as string[])

    await Promise.all([
      db.transactions.bulkAdd(transactions.filter((r) => !txIdSet.has(r.id))),
      db.goals.bulkAdd(goals.filter((r) => !goalIdSet.has(r.id))),
      db.debts.bulkAdd(debts.filter((r) => !debtIdSet.has(r.id))),
      db.recurringTemplates.bulkAdd(
        recurringTemplates.filter((r) => !recurIdSet.has(r.id)),
      ),
    ])
  }
}

// ─── Parse file ──────────────────────────────────────────────────────────────

export function parseBackupFile(file: File): Promise<HematinBackup> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      reject(new Error('File harus berformat .json'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string)
        const backup = validateBackupFile(parsed)
        resolve(backup)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsText(file)
  })
}
