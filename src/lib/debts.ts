import { format, parseISO, differenceInDays } from 'date-fns'
import { id as idLocale, enUS } from 'date-fns/locale'
import { getDictionary } from '@/lib/i18n'
import type { Language } from '@/stores/languageStore'

export function getDueDateLabel(
  dueDate?: string,
  language: Language = 'id',
): { label: string; urgent: boolean } {
  if (!dueDate) return { label: '', urgent: false }
  const t = getDictionary(language).debts
  const today = format(new Date(), 'yyyy-MM-dd')
  const diff = differenceInDays(parseISO(dueDate), parseISO(today))
  if (diff < 0) return { label: t.dueDate.daysAgo(Math.abs(diff)), urgent: true }
  if (diff === 0) return { label: t.dueDate.today, urgent: true }
  if (diff === 1) return { label: t.dueDate.tomorrow, urgent: true }
  if (diff <= 7) return { label: t.dueDate.daysLeft(diff), urgent: true }
  return {
    label: format(parseISO(dueDate), 'd MMM yyyy', { locale: language === 'en' ? enUS : idLocale }),
    urgent: false,
  }
}

/** Nilai mode pembayaran; label ditentukan oleh dictionary (`t.debts.paymentMode`) di komponen. */
export const PAYMENT_MODE_VALUES = [false, true] as const

export const CICILAN_DAY_PRESETS = [1, 5, 10, 15, 20, 25, 28]
