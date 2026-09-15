// Definisi manual tipe tabel Supabase yang dipakai HEMATIN (bukan hasil `supabase gen types`
// - cukup untuk type-safety dasar di client/server helper & sync engine).
// Kalau nanti generate types resmi dari Supabase CLI, file ini bisa diganti.

export interface ProfileRow {
  id: string
  name: string
  created_at: string
}

export interface CloudWalletRow {
  id: string
  owner_id: string
  name: string
  icon: string
  color: string
  share_key: string | null
  share_key_active: boolean
  created_at: string
}

export interface CloudTransactionRow {
  id: string
  wallet_id: string
  type: 'income' | 'expense' | 'saving'
  amount: number
  category: string
  merchant: string | null
  notes: string | null
  date: string
  source: 'manual' | 'scan' | 'recurring'
  recurring_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface CloudGoalRow {
  id: string
  wallet_id: string
  category: string
  limit_amount: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface CloudDebtRow {
  id: string
  wallet_id: string
  type: 'hutang' | 'piutang'
  person: string
  amount: number
  due_date: string | null
  description: string | null
  status: 'active' | 'paid' | 'overdue' | 'partial'
  paid_at: number | null
  notes: string | null
  is_cicilan: boolean
  cicilan_amount: number | null
  cicilan_day: number | null
  cicilan_start_month: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface CloudDebtPaymentRow {
  id: string
  wallet_id: string
  debt_id: string
  amount: number
  paid_date: string
  month: string
  notes: string | null
  created_by: string
  created_at: string
}

export interface CloudRecurringTemplateRow {
  id: string
  wallet_id: string
  type: 'income' | 'expense' | 'saving'
  amount: number
  category: string
  merchant: string | null
  notes: string | null
  recurring_day: number
  is_active: boolean
  last_generated_month: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type WalletRole = 'owner' | 'editor' | 'viewer'

export interface WalletMemberRow {
  id: string
  wallet_id: string
  user_id: string
  role: WalletRole
  joined_at: string
  // Diisi lewat join manual di query (profiles!inner(name)), bukan kolom asli tabel ini.
  profiles?: { name: string } | null
}

export interface ActivityLogRow {
  id: string
  wallet_id: string
  actor_id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  description: string
  created_at: string
  profiles?: { name: string } | null
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow>; Update: Partial<ProfileRow> }
      cloud_wallets: { Row: CloudWalletRow; Insert: Partial<CloudWalletRow>; Update: Partial<CloudWalletRow> }
      cloud_transactions: { Row: CloudTransactionRow; Insert: Partial<CloudTransactionRow>; Update: Partial<CloudTransactionRow> }
      cloud_goals: { Row: CloudGoalRow; Insert: Partial<CloudGoalRow>; Update: Partial<CloudGoalRow> }
      cloud_debts: { Row: CloudDebtRow; Insert: Partial<CloudDebtRow>; Update: Partial<CloudDebtRow> }
      cloud_debt_payments: { Row: CloudDebtPaymentRow; Insert: Partial<CloudDebtPaymentRow>; Update: Partial<CloudDebtPaymentRow> }
      cloud_recurring_templates: { Row: CloudRecurringTemplateRow; Insert: Partial<CloudRecurringTemplateRow>; Update: Partial<CloudRecurringTemplateRow> }
      wallet_members: { Row: WalletMemberRow; Insert: Partial<WalletMemberRow>; Update: Partial<WalletMemberRow> }
      activity_log: { Row: ActivityLogRow; Insert: Partial<ActivityLogRow>; Update: Partial<ActivityLogRow> }
    }
  }
}
