'use client'

import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { DayPicker } from '@/components/ui/DayPicker'
import { CategoryPicker } from './CategoryPicker'
import { useTransactionForm } from '@/hooks/useTransactionForm'
import { TRANSACTION_TYPE_TOGGLE } from '@/lib/transactions'
import { cn } from '@/lib/utils'
import type { TransactionType } from '@/lib/transactions'

interface DefaultValues {
  type?: TransactionType
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
  initialType?: TransactionType
  defaultValues?: DefaultValues
  editId?: string // jika diisi, mode edit (update) bukan tambah baru
}

export function TransactionForm({ onSuccess, onClose, initialType = 'expense', defaultValues, editId }: TransactionFormProps) {
  const { form, setField, activeCategory, amount, handleTypeChange, handleSubmit, loading } = useTransactionForm({
    defaultValues,
    initialType,
    editId,
    onSuccess: () => {
      onSuccess?.()
      onClose?.()
    },
  })

  return (
    <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-5">
      {/* Type Toggle */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
        {TRANSACTION_TYPE_TOGGLE.map((t) => (
          <motion.button
            key={t.value}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => handleTypeChange(t.value)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              form.type === t.value
                ? `bg-white dark:bg-slate-700 ${t.activeClass} shadow-sm`
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.label}
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
            value={amount.display}
            onChange={amount.onChange}
            className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-2xl font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Category */}
      <CategoryPicker type={form.type} selected={activeCategory} onSelect={(c) => setField('category', c)} />

      {/* Merchant */}
      <Input
        label="Nama toko / keterangan"
        placeholder={form.type === 'income' ? 'misal: PT. Maju Jaya' : form.type === 'saving' ? 'misal: BCA, Bibit, Pluang' : 'misal: Indomaret, Warteg Bu Sari'}
        value={form.merchant}
        onChange={(e) => setField('merchant', e.target.value)}
      />

      {/* Date */}
      <Input
        label="Tanggal"
        type="date"
        value={form.date}
        onChange={(e) => setField('date', e.target.value)}
      />

      {/* Notes */}
      <Textarea
        label="Catatan (opsional)"
        placeholder="Tambahkan catatan..."
        value={form.notes}
        onChange={(e) => setField('notes', e.target.value)}
        rows={2}
      />

      {/* Recurring Toggle — hanya tampil di mode tambah (bukan edit) */}
      {!editId && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setField('isRecurring', !form.isRecurring)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all',
              form.isRecurring
                ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-600'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
            )}
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className={cn('w-4 h-4', form.isRecurring ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400')} />
              <span className={cn('text-sm font-semibold', form.isRecurring ? 'text-sky-700 dark:text-sky-300' : 'text-slate-600 dark:text-slate-400')}>
                Ulangi setiap bulan
              </span>
            </div>
            <div className={cn('w-10 h-6 rounded-full transition-all flex items-center px-0.5', form.isRecurring ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-600')}>
              <motion.div
                animate={{ x: form.isRecurring ? 16 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white shadow-sm"
              />
            </div>
          </button>

          {form.isRecurring && (
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
                <DayPicker value={form.recurringDay} onChange={(d) => setField('recurringDay', d)} />
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
