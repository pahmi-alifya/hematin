import type { Category } from '@/types'

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food',          name: 'Makanan',    icon: '🍜', color: '#D97706', bgColor: '#FEF3C7' },
  { id: 'transport',     name: 'Transport',  icon: '🚗', color: '#2563EB', bgColor: '#DBEAFE' },
  { id: 'shopping',      name: 'Belanja',    icon: '🛒', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'health',        name: 'Kesehatan',  icon: '💊', color: '#059669', bgColor: '#D1FAE5' },
  { id: 'entertainment', name: 'Hiburan',    icon: '🎮', color: '#DB2777', bgColor: '#FCE7F3' },
  { id: 'bills',         name: 'Tagihan',    icon: '📋', color: '#DC2626', bgColor: '#FEE2E2' },
  { id: 'education',     name: 'Pendidikan', icon: '📚', color: '#0891B2', bgColor: '#CFFAFE' },
  { id: 'other',         name: 'Lainnya',    icon: '📦', color: '#64748B', bgColor: '#F1F5F9' },
]

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary',        name: 'Gaji',       icon: '💰', color: '#059669', bgColor: '#D1FAE5' },
  { id: 'freelance',     name: 'Freelance',  icon: '💻', color: '#0891B2', bgColor: '#CFFAFE' },
  { id: 'business',      name: 'Usaha',      icon: '🏪', color: '#D97706', bgColor: '#FEF3C7' },
  { id: 'investment',    name: 'Investasi',  icon: '📈', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'bonus',         name: 'Bonus',      icon: '🎁', color: '#DB2777', bgColor: '#FCE7F3' },
  { id: 'other-income',  name: 'Lainnya',    icon: '✨', color: '#64748B', bgColor: '#F1F5F9' },
]

export function getCategoryById(id: string, type: 'income' | 'expense'): Category | undefined {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  return list.find((c) => c.id === id)
}

export function getCategoryName(id: string, type: 'income' | 'expense'): string {
  return getCategoryById(id, type)?.name ?? id
}
