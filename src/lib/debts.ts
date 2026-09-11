import { format, parseISO, differenceInDays } from 'date-fns'
import { id } from 'date-fns/locale'

export function getDueDateLabel(dueDate?: string): { label: string; urgent: boolean } {
  if (!dueDate) return { label: '', urgent: false }
  const today = format(new Date(), 'yyyy-MM-dd')
  const diff = differenceInDays(parseISO(dueDate), parseISO(today))
  if (diff < 0) return { label: `${Math.abs(diff)} hari lalu`, urgent: true }
  if (diff === 0) return { label: 'Hari ini!', urgent: true }
  if (diff === 1) return { label: 'Besok', urgent: true }
  if (diff <= 7) return { label: `${diff} hari lagi`, urgent: true }
  return { label: format(parseISO(dueDate), 'd MMM yyyy', { locale: id }), urgent: false }
}

export const PAYMENT_MODE_OPTIONS: { value: boolean; label: string }[] = [
  { value: false, label: '💵 Lunas Sekaligus' },
  { value: true, label: '📅 Cicilan Bulanan' },
]

export const CICILAN_DAY_PRESETS = [1, 5, 10, 15, 20, 25, 28]
