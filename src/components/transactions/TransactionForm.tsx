'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { CategoryPicker } from './CategoryPicker'
import { useTransactionStore } from '@/stores/transactionStore'
import { useRecurringStore } from '@/stores/recurringStore'
import { toast } from '@/components/ui/Toast'
import { formatRupiahInput, parseRupiahInput, getCurrentDate } from '@/lib/utils'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories'
import { cn } from '@/lib/utils'

interface DefaultValues {
  type?: 'income' | 'expense'
  amount?: number
  category?: string
  merchant?: string
  date?: string
  notes?: string
  source?: 'manual' | 'scan'
}

interface TransactionFormProps {
  onSuccess?: () => void
  /** @deprecated use onSuccess */
  onClose?: () => void
  initialType?: 'income' | 'expense'
  defaultValues?: DefaultValues
  editId?: string // jika diisi, mode edit (update) bukan tambah baru
}

// Pill picker untuk tanggal berulang (1–28)
function DayPicker({ value, onChange }: { value: number; onChange: (day: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
        <motion.button
          key={day}
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => onChange(day)}
          className={cn(
            'w-9 h-9 rounded-xl text-sm font-semibold transition-all',
            value === day
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
          )}
        >
          {day}
        </motion.button>
      ))}
    </div>
  )
}

export function TransactionForm({ onSuccess, onClose, initialType = 'expense', defaultValues, editId }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(defaultValues?.type ?? initialType)
  const [amount, setAmount] = useState(defaultValues?.amount ? formatRupiahInput(defaultValues.amount) : '')
  const [amountRaw, setAmountRaw] = useState(defaultValues?.amount ?? 0)
  const [category, setCategory] = useState(defaultValues?.category ?? '')
  const [merchant, setMerchant] = useState(defaultValues?.merchant ?? '')
  const [notes, setNotes] = useState(defaultValues?.notes ?? '')
  const [date, setDate] = useState(defaultValues?.date ?? getCurrentDate())
  const [loading, setLoading] = useState(false)
  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDay, setRecurringDay] = useState(new Date().getDate() <= 28 ? new Date().getDate() : 1)
  const source = defaultValues?.source ?? 'manual'

  const { addTransaction, updateTransaction } = useTransactionStore()
  const { addTemplate } = useRecurringStore()

  const defaultCategory = type === 'expense'
    ? EXPENSE_CATEGORIES[0].id
    : INCOME_CATEGORIES[0].id

  const activeCategory = category || defaultCategory

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseRupiahInput(e.target.value)
    setAmountRaw(raw)
    setAmount(formatRupiahInput(raw))
  }

  function handleTypeChange(newType: 'income' | 'expense') {
    setType(newType)
    setCategory('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amountRaw || amountRaw <= 0) {
      toast('Masukkan nominal yang valid', 'error')
      return
    }

    setLoading(true)
    try {
      if (editId) {
        await updateTransaction(editId, {
          type,
          amount: amountRaw,
          category: activeCategory,
          merchant: merchant.trim() || undefined,
          notes: notes.trim() || undefined,
          date,
        })
        toast('Transaksi berhasil diperbarui', 'success')
      } else {
        await addTransaction({
          type,
          amount: amountRaw,
          category: activeCategory,
          merchant: merchant.trim() || undefined,
          notes: notes.trim() || undefined,
          date,
          source,
        })
        // Jika ada toggle recurring, buat template juga
        if (isRecurring) {
          await addTemplate({
            type,
            amount: amountRaw,
            category: activeCategory,
            merchant: merchant.trim() || undefined,
            notes: notes.trim() || undefined,
            recurringDay,
            isActive: true,
          })
        }
        toast('Transaksi berhasil disimpan', 'success')
      }
      onSuccess?.()
      onClose?.()
    } catch {
      toast('Gagal menyimpan transaksi', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-5">
      {/* Type Toggle */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
        {(['expense', 'income'] as const).map((t) => (
          <motion.button
            key={t}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => handleTypeChange(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              type === t
                ? t === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t === 'expense' ? '💸 Pengeluaran' : '💰 Pemasukan'}
          </motion.button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Nominal</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={handleAmountChange}
            className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-2xl font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Category */}
      <CategoryPicker type={type} selected={activeCategory} onSelect={setCategory} />

      {/* Merchant */}
      <Input
        label="Nama toko / keterangan"
        placeholder={type === 'income' ? 'misal: PT. Maju Jaya' : 'misal: Indomaret, Warteg Bu Sari'}
        value={merchant}
        onChange={(e) => setMerchant(e.target.value)}
      />

      {/* Date */}
      <Input
        label="Tanggal"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Notes */}
      <Textarea
        label="Catatan (opsional)"
        placeholder="Tambahkan catatan..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      {/* Recurring Toggle — hanya tampil di mode tambah (bukan edit) */}
      {!editId && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all',
              isRecurring
                ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-600'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
            )}
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className={cn('w-4 h-4', isRecurring ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400')} />
              <span className={cn('text-sm font-semibold', isRecurring ? 'text-sky-700 dark:text-sky-300' : 'text-slate-600 dark:text-slate-400')}>
                Ulangi setiap bulan
              </span>
            </div>
            <div className={cn('w-10 h-6 rounded-full transition-all flex items-center px-0.5', isRecurring ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-600')}>
              <motion.div
                animate={{ x: isRecurring ? 16 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white shadow-sm"
              />
            </div>
          </button>

          {isRecurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-1 space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ulangi setiap tanggal
                </p>
                <DayPicker value={recurringDay} onChange={setRecurringDay} />
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Template akan ditambahkan ke daftar Transaksi Rutin
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Submit */}
      <Button type="submit" fullWidth loading={loading} size="lg">
        {editId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
      </Button>
    </form>
  )
}
