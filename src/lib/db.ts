import Dexie, { type Table } from 'dexie'
import type { Transaction, Goal, InsightCache, AISettings, Debt, DebtPayment, RecurringTemplate } from '@/types'

class HematinDB extends Dexie {
  transactions!: Table<Transaction>
  goals!: Table<Goal>
  insights!: Table<InsightCache>
  settings!: Table<AISettings>
  debts!: Table<Debt>
  debtPayments!: Table<DebtPayment>
  recurringTemplates!: Table<RecurringTemplate>

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
  }
}

export const db = new HematinDB()
