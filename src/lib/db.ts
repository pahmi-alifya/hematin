import Dexie, { type Table } from 'dexie'
import { generateId } from './utils'
import type { Transaction, Goal, InsightCache, AISettings, Debt, DebtPayment, RecurringTemplate, Wallet } from '@/types'

class HematinDB extends Dexie {
  transactions!: Table<Transaction>
  goals!: Table<Goal>
  insights!: Table<InsightCache>
  settings!: Table<AISettings>
  debts!: Table<Debt>
  debtPayments!: Table<DebtPayment>
  recurringTemplates!: Table<RecurringTemplate>
  wallets!: Table<Wallet>

  constructor() {
    super('hematin-db')
    this.version(1).stores({
      transactions: 'id, type, category, date, createdAt',
      goals: 'id, category, month',
      insights: 'id, date',
      settings: 'id',
    })
    // v2: tambah tabel debts
    this.version(2).stores({
      transactions: 'id, type, category, date, createdAt',
      goals: 'id, category, month',
      insights: 'id, date',
      settings: 'id',
      debts: 'id, type, status, dueDate, person, createdAt',
    })
    // v3: tambah tabel recurringTemplates
    this.version(3).stores({
      transactions: 'id, type, category, date, createdAt',
      goals: 'id, category, month',
      insights: 'id, date',
      settings: 'id',
      debts: 'id, type, status, dueDate, person, createdAt',
      recurringTemplates: 'id, type, isActive, recurringDay, createdAt',
    })
    // v4: tambah tabel debtPayments untuk fitur cicilan
    this.version(4).stores({
      transactions: 'id, type, category, date, createdAt',
      goals: 'id, category, month',
      insights: 'id, date',
      settings: 'id',
      debts: 'id, type, status, dueDate, person, createdAt',
      recurringTemplates: 'id, type, isActive, recurringDay, createdAt',
      debtPayments: 'id, debtId, month, paidDate, createdAt',
    })
    // v5: goals jadi persisten per kategori (tanpa month index)
    this.version(5).stores({
      transactions: 'id, type, category, date, createdAt',
      goals: 'id, category',
      insights: 'id, date',
      settings: 'id',
      debts: 'id, type, status, dueDate, person, createdAt',
      recurringTemplates: 'id, type, isActive, recurringDay, createdAt',
      debtPayments: 'id, debtId, month, paidDate, createdAt',
    })
    // v6: multi-dompet — tambah tabel wallets + walletId index ke semua tabel data
    this.version(6).stores({
      transactions: 'id, type, category, date, createdAt, walletId',
      goals: 'id, category, walletId',
      insights: 'id, date, walletId',
      settings: 'id', // TETAP global — AI settings bukan per-dompet
      debts: 'id, type, status, dueDate, person, createdAt, walletId',
      recurringTemplates: 'id, type, isActive, recurringDay, createdAt, walletId',
      debtPayments: 'id, debtId, month, paidDate, createdAt, walletId',
      wallets: 'id, isDefault, order',
    }).upgrade(async (tx) => {
      // Migrasi: buat "Dompet Utama" lalu backfill walletId ke semua record lama
      const defaultWalletId = generateId()
      const defaultWallet: Wallet = {
        id: defaultWalletId,
        name: 'Dompet Utama',
        icon: '👛',
        color: '#0EA5E9',
        isDefault: true,
        createdAt: Date.now(),
        order: 0,
      }
      await tx.table('wallets').add(defaultWallet)

      for (const table of [
        'transactions',
        'goals',
        'insights',
        'debts',
        'recurringTemplates',
        'debtPayments',
      ]) {
        await tx.table(table).toCollection().modify((record: { walletId?: string }) => {
          record.walletId = defaultWalletId
        })
      }
    })
  }
}

export const db = new HematinDB()
