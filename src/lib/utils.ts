import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRupiahShort(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`
  return `Rp ${amount}`
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'd MMM yyyy', { locale: id })
}

export function formatRelativeDate(date: string): string {
  const d = parseISO(date)
  if (isToday(d)) return 'Hari ini'
  if (isYesterday(d)) return 'Kemarin'
  return format(d, 'EEEE, d MMM', { locale: id })
}

export function formatMonthYear(date: string): string {
  return format(parseISO(date + '-01'), 'MMMM yyyy', { locale: id })
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export function getCurrentDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function maskApiKey(key: string): string {
  if (!key || key.length <= 8) return '••••••••'
  const visible = key.substring(0, 8)
  const masked = '•'.repeat(Math.min(key.length - 12, 24))
  const end = key.substring(key.length - 4)
  return `${visible}${masked}${end}`
}

export function parseRupiahInput(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '')
  return parseInt(cleaned, 10) || 0
}

export function formatRupiahInput(value: number): string {
  if (!value) return ''
  return new Intl.NumberFormat('id-ID').format(value)
}
