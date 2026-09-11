'use client'

import { useState } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { useRecurringStore } from '@/stores/recurringStore'
import { useRupiahInput } from './useRupiahInput'
import { toast } from '@/components/ui/Toast'
import { getCurrentDate } from '@/lib/utils'
import { getDefaultCategoryForType } from '@/lib/categories'
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

interface TransactionFormData {
  type: TransactionType
  amountRaw: number
  category: string
  merchant: string
  notes: string
  date: string
  isRecurring: boolean
  recurringDay: number
}

interface UseTransactionFormOptions {
  defaultValues?: DefaultValues
  initialType?: TransactionType
  editId?: string
  onSuccess?: () => void
}

function getInitialForm(defaultValues: DefaultValues | undefined, initialType: TransactionType): TransactionFormData {
  return {
    type: defaultValues?.type ?? initialType,
    amountRaw: defaultValues?.amount ?? 0,
    category: defaultValues?.category ?? '',
    merchant: defaultValues?.merchant ?? '',
    notes: defaultValues?.notes ?? '',
    date: defaultValues?.date ?? getCurrentDate(),
    isRecurring: false,
    recurringDay: new Date().getDate() <= 28 ? new Date().getDate() : 1,
  }
}

/** Owns seluruh alur tambah/edit transaksi (+ toggle bikin template rutin sekaligus): state form + submit. */
export function useTransactionForm({ defaultValues, initialType = 'expense', editId, onSuccess }: UseTransactionFormOptions) {
  const { addTransaction, updateTransaction } = useTransactionStore()
  const { addTemplate } = useRecurringStore()
  const [form, setForm] = useState<TransactionFormData>(() => getInitialForm(defaultValues, initialType))
  const [loading, setLoading] = useState(false)
  const source = defaultValues?.source ?? 'manual'

  const activeCategory = form.category || getDefaultCategoryForType(form.type)

  function setField<K extends keyof TransactionFormData>(key: K, value: TransactionFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleTypeChange(type: TransactionType) {
    setForm((f) => ({ ...f, type, category: '' }))
  }

  const amount = useRupiahInput(form.amountRaw, (raw) => setField('amountRaw', raw))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amountRaw || form.amountRaw <= 0) {
      toast('Masukkan nominal yang valid', 'error')
      return
    }

    setLoading(true)
    try {
      const data = {
        type: form.type,
        amount: form.amountRaw,
        category: activeCategory,
        merchant: form.merchant.trim() || undefined,
        notes: form.notes.trim() || undefined,
        date: form.date,
      }

      if (editId) {
        await updateTransaction(editId, data)
        toast('Transaksi berhasil diperbarui', 'success')
      } else {
        await addTransaction({ ...data, source })
        if (form.isRecurring) {
          await addTemplate({
            type: form.type,
            amount: form.amountRaw,
            category: activeCategory,
            merchant: form.merchant.trim() || undefined,
            notes: form.notes.trim() || undefined,
            recurringDay: form.recurringDay,
            isActive: true,
          })
        }
        toast('Transaksi berhasil disimpan', 'success')
      }
      onSuccess?.()
    } catch {
      toast('Gagal menyimpan transaksi', 'error')
    } finally {
      setLoading(false)
    }
  }

  return { form, setField, activeCategory, amount, handleTypeChange, handleSubmit, loading }
}
