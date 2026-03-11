import Dexie, { type Table } from 'dexie'
import type { Transaction, Goal, InsightCache, AISettings, Debt, RecurringTemplate } from '@/types'

class HematinDB extends Dexie {
  transactions!: Table<Transaction>
  goals!: Table<Goal>
  insights!: Table<InsightCache>
  settings!: Table<AISettings>
  debts!: Table<Debt>
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
  }
}

export const db = new HematinDB()
