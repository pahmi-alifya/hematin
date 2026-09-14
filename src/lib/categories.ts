import type { Category } from '@/types'
import type { Language } from '@/stores/languageStore'

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Makanan', nameEn: 'Food', icon: '🍜', color: '#D97706', bgColor: '#FEF3C7' },
  { id: 'transport', name: 'Transport', nameEn: 'Transport', icon: '🚗', color: '#2563EB', bgColor: '#DBEAFE' },
  { id: 'shopping', name: 'Belanja', nameEn: 'Shopping', icon: '🛒', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'online-shop', name: 'Belanja Online', nameEn: 'Online Shopping', icon: '🛍️', color: '#9333EA', bgColor: '#F3E8FF' },
  { id: 'health', name: 'Kesehatan', nameEn: 'Health', icon: '💊', color: '#059669', bgColor: '#D1FAE5' },
  { id: 'entertainment', name: 'Hiburan', nameEn: 'Entertainment', icon: '🎮', color: '#DB2777', bgColor: '#FCE7F3' },
  { id: 'bills', name: 'Tagihan', nameEn: 'Bills', icon: '📋', color: '#DC2626', bgColor: '#FEE2E2' },
  { id: 'education', name: 'Pendidikan', nameEn: 'Education', icon: '📚', color: '#0891B2', bgColor: '#CFFAFE' },
  { id: 'housing', name: 'Rumah', nameEn: 'Housing', icon: '🏠', color: '#B45309', bgColor: '#FEF3C7' },
  { id: 'subscription', name: 'Langganan', nameEn: 'Subscription', icon: '📱', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'personal-care', name: 'Perawatan Diri', nameEn: 'Personal Care', icon: '💇', color: '#DB2777', bgColor: '#FCE7F3' },
  { id: 'pet', name: 'Hewan Peliharaan', nameEn: 'Pet', icon: '🐾', color: '#D97706', bgColor: '#FEF3C7' },
  { id: 'other', name: 'Lainnya', nameEn: 'Other', icon: '📦', color: '#64748B', bgColor: '#F1F5F9' },
]

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Gaji', nameEn: 'Salary', icon: '💰', color: '#059669', bgColor: '#D1FAE5' },
  { id: 'freelance', name: 'Freelance', nameEn: 'Freelance', icon: '💻', color: '#0891B2', bgColor: '#CFFAFE' },
  { id: 'business', name: 'Usaha', nameEn: 'Business', icon: '🏪', color: '#D97706', bgColor: '#FEF3C7' },
  { id: 'investment', name: 'Investasi', nameEn: 'Investment', icon: '📈', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'bonus', name: 'Bonus', nameEn: 'Bonus', icon: '🎁', color: '#DB2777', bgColor: '#FCE7F3' },
  { id: 'other-income', name: 'Lainnya', nameEn: 'Other', icon: '✨', color: '#64748B', bgColor: '#F1F5F9' },
]

export const SAVING_CATEGORIES: Category[] = [
  { id: 'tabungan', name: 'Tabungan', nameEn: 'Savings', icon: '🏦', color: '#0D9488', bgColor: '#CCFBF1' },
  { id: 'deposito', name: 'Deposito', nameEn: 'Deposit', icon: '💵', color: '#0891B2', bgColor: '#CFFAFE' },
  { id: 'reksa-dana', name: 'Reksa Dana', nameEn: 'Mutual Fund', icon: '📊', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'saham', name: 'Saham', nameEn: 'Stocks', icon: '📈', color: '#16A34A', bgColor: '#DCFCE7' },
  { id: 'crypto', name: 'Crypto', nameEn: 'Crypto', icon: '🪙', color: '#D97706', bgColor: '#FEF3C7' },
  { id: 'emas', name: 'Emas', nameEn: 'Gold', icon: '🥇', color: '#CA8A04', bgColor: '#FEF9C3' },
  { id: 'dana-darurat', name: 'Dana Darurat', nameEn: 'Emergency Fund', icon: '🛡️', color: '#DC2626', bgColor: '#FEE2E2' },
  { id: 'properti', name: 'Properti', nameEn: 'Property', icon: '🏠', color: '#64748B', bgColor: '#F1F5F9' },
  { id: 'other-saving', name: 'Lainnya', nameEn: 'Other', icon: '📦', color: '#64748B', bgColor: '#F1F5F9' },
]

export function getCategoryById(id: string, type: 'income' | 'expense' | 'saving'): Category | undefined {
  if (type === 'income') return INCOME_CATEGORIES.find((c) => c.id === id)
  if (type === 'saving') return SAVING_CATEGORIES.find((c) => c.id === id)
  return EXPENSE_CATEGORIES.find((c) => c.id === id)
}

/** Nama kategori sesuai bahasa aktif — pakai ini (bukan `cat.name` langsung) di semua tampilan. */
export function getCategoryLabel(category: Category | undefined | null, language: Language = 'id'): string | undefined {
  if (!category) return undefined
  return language === 'en' ? category.nameEn : category.name
}

export function getCategoryName(id: string, type: 'income' | 'expense' | 'saving', language: Language = 'id'): string {
  return getCategoryLabel(getCategoryById(id, type), language) ?? id
}

/** Kategori default yang dipilih saat user ganti tipe transaksi tanpa kategori aktif. */
export function getDefaultCategoryForType(type: 'income' | 'expense' | 'saving'): string {
  if (type === 'income') return 'salary'
  if (type === 'saving') return 'tabungan'
  return 'food'
}
