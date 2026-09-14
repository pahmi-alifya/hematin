import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { id as idLocale, enUS } from 'date-fns/locale'
import type { Language } from '@/stores/languageStore'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function dateLocale(language: Language) {
  return language === 'en' ? enUS : idLocale
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
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(amount)
  if (abs >= 1_000_000_000) return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1)}M`
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toFixed(1)}jt`
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toFixed(0)}rb`
  return `${sign}Rp ${abs}`
}

export function formatDate(date: string, language: Language = 'id'): string {
  return format(parseISO(date), 'd MMM yyyy', { locale: dateLocale(language) })
}

export function formatRelativeDate(
  date: string,
  fallbackFormat = 'EEEE, d MMM',
  language: Language = 'id',
): string {
  const d = parseISO(date)
  if (isToday(d)) return language === 'en' ? 'Today' : 'Hari ini'
  if (isYesterday(d)) return language === 'en' ? 'Yesterday' : 'Kemarin'
  return format(d, fallbackFormat, { locale: dateLocale(language) })
}

export function formatMonthYear(date: string, language: Language = 'id'): string {
  return format(parseISO(date + '-01'), 'MMMM yyyy', { locale: dateLocale(language) })
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

/** Header request standar untuk memanggil route AI proxy (`/api/insight`, `/api/scan`, `/api/models`). */
export function buildAIHeaders(params: {
  provider: string
  apiKey: string
  model?: string
  language?: Language
}): Record<string, string> {
  const headers: Record<string, string> = {
    'X-AI-Provider': params.provider,
    'X-AI-Key': params.apiKey,
  }
  if (params.model) headers['X-AI-Model'] = params.model
  if (params.language) headers['X-Language'] = params.language
  return headers
}
