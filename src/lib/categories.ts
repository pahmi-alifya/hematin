import type { Category } from '@/types'

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Makanan', icon: '🍜', color: '#D97706', bgColor: '#FEF3C7' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#2563EB', bgColor: '#DBEAFE' },
  { id: 'shopping', name: 'Belanja', icon: '🛒', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'health', name: 'Kesehatan', icon: '💊', color: '#059669', bgColor: '#D1FAE5' },
  { id: 'entertainment', name: 'Hiburan', icon: '🎮', color: '#DB2777', bgColor: '#FCE7F3' },
  { id: 'bills', name: 'Tagihan', icon: '📋', color: '#DC2626', bgColor: '#FEE2E2' },
  { id: 'education', name: 'Pendidikan', icon: '📚', color: '#0891B2', bgColor: '#CFFAFE' },
  { id: 'other', name: 'Lainnya', icon: '📦', color: '#64748B', bgColor: '#F1F5F9' },
]

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Gaji', icon: '💰', color: '#059669', bgColor: '#D1FAE5' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#0891B2', bgColor: '#CFFAFE' },
  { id: 'business', name: 'Usaha', icon: '🏪', color: '#D97706', bgColor: '#FEF3C7' },
  { id: 'investment', name: 'Investasi', icon: '📈', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'bonus', name: 'Bonus', icon: '🎁', color: '#DB2777', bgColor: '#FCE7F3' },
  { id: 'other-income', name: 'Lainnya', icon: '✨', color: '#64748B', bgColor: '#F1F5F9' },
]

export const SAVING_CATEGORIES: Category[] = [
  { id: 'tabungan', name: 'Tabungan', icon: '🏦', color: '#0D9488', bgColor: '#CCFBF1' },
  { id: 'deposito', name: 'Deposito', icon: '💵', color: '#0891B2', bgColor: '#CFFAFE' },
  { id: 'reksa-dana', name: 'Reksa Dana', icon: '📊', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'saham', name: 'Saham', icon: '📈', color: '#16A34A', bgColor: '#DCFCE7' },
  { id: 'crypto', name: 'Crypto', icon: '🪙', color: '#D97706', bgColor: '#FEF3C7' },
  { id: 'emas', name: 'Emas', icon: '🥇', color: '#CA8A04', bgColor: '#FEF9C3' },
  { id: 'dana-darurat', name: 'Dana Darurat', icon: '🛡️', color: '#DC2626', bgColor: '#FEE2E2' },
  { id: 'properti', name: 'Properti', icon: '🏠', color: '#64748B', bgColor: '#F1F5F9' },
  { id: 'other-saving', name: 'Lainnya', icon: '📦', color: '#64748B', bgColor: '#F1F5F9' },
]

export function getCategoryById(id: string, type: 'income' | 'expense' | 'saving'): Category | undefined {
  if (type === 'income') return INCOME_CATEGORIES.find((c) => c.id === id)
  if (type === 'saving') return SAVING_CATEGORIES.find((c) => c.id === id)
  return EXPENSE_CATEGORIES.find((c) => c.id === id)
}

export function getCategoryName(id: string, type: 'income' | 'expense' | 'saving'): string {
  return getCategoryById(id, type)?.name ?? id
}
