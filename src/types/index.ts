export type AIProvider = 'anthropic' | 'openai' | 'gemini'

export interface Transaction {
  id: string
  type: 'income' | 'expense' | 'saving'
  amount: number
  category: string
  merchant?: string
  notes?: string
  date: string // ISO: "2026-02-26"
  createdAt: number
  source: 'manual' | 'scan' | 'recurring'
  recurringId?: string // ID template yang meng-generate transaksi ini
}

export interface RecurringTemplate {
  id: string
  type: 'income' | 'expense' | 'saving'
  amount: number
  category: string
  merchant?: string
  notes?: string
  recurringDay: number        // tanggal dalam bulan: 1–28
  isActive: boolean
  lastGeneratedMonth?: string // "2026-03" — bulan terakhir di-generate
  createdAt: number
}

export interface Goal {
  id: string
  category: string
  limitAmount: number
  month: string // "2026-02"
  createdAt: number
}

export interface InsightCache {
  id: string // "insight-2026-02-26"
  date: string
  content: string
  generatedAt: number
}

export interface AISettings {
  id: 'ai-config'
  provider: AIProvider
  model: string
  apiKey: string
  isConfigured: boolean
  updatedAt: number
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  bgColor: string
}

export interface ScannedReceipt {
  merchant: string | null
  date: string | null
  total: number | null
  category: string | null
  notes: string | null
  confidence: 'high' | 'medium' | 'low'
  error?: string
}

export interface FinancialContext {
  total_income: number
  total_expense: number
  total_saving: number
  saving_rate: number // persen dari income (0-100)
  cash_flow_status: 'positive' | 'neutral' | 'negative'
  balance: number // income - expense - saving
  top_category: string
  trend: 'increasing' | 'stable' | 'decreasing'
  income_today: number
  expense_today: number
  categories_today: string[]
  consistency_level: 'good' | 'medium' | 'low'
}

export interface Debt {
  id: string
  type: 'hutang' | 'piutang' // hutang = I owe someone, piutang = they owe me
  person: string              // nama orang
  amount: number              // dalam Rupiah
  dueDate?: string            // ISO date: "2026-03-15" (opsional)
  description?: string        // keterangan transaksi
  status: 'active' | 'paid' | 'overdue'
  createdAt: number
  paidAt?: number             // timestamp saat dilunasi
  notes?: string              // catatan saat mark as paid
}
