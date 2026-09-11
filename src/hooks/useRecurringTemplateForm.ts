'use client'

import { useState } from 'react'
import { useRecurringStore } from '@/stores/recurringStore'
import { useRupiahInput } from './useRupiahInput'
import { toast } from '@/components/ui/Toast'
import { getDefaultCategoryForType } from '@/lib/categories'
import type { TransactionType } from '@/lib/transactions'
import type { RecurringTemplate } from '@/types'

interface TemplateFormData {
  type: TransactionType
  amountRaw: number
  category: string
  merchant: string
  notes: string
  recurringDay: number
  isActive: boolean
}

function getInitialForm(template?: RecurringTemplate): TemplateFormData {
  return {
    type: template?.type ?? 'expense',
    amountRaw: template?.amount ?? 0,
    category: template?.category ?? '',
    merchant: template?.merchant ?? '',
    notes: template?.notes ?? '',
    recurringDay: template?.recurringDay ?? (new Date().getDate() <= 28 ? new Date().getDate() : 1),
    isActive: template?.isActive ?? true,
  }
}

/** Owns seluruh alur tambah/edit template transaksi rutin: state form + submit. */
export function useRecurringTemplateForm() {
  const { addTemplate, updateTemplate } = useRecurringStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TemplateFormData>(getInitialForm())
  const [submitting, setSubmitting] = useState(false)

  const activeCategory = form.category || getDefaultCategoryForType(form.type)

  function openAdd() {
    setEditingId(null)
    setForm(getInitialForm())
    setShowForm(true)
  }

  function openEdit(template: RecurringTemplate) {
    setEditingId(template.id)
    setForm(getInitialForm(template))
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
  }

  function handleTypeChange(type: TransactionType) {
    setForm((f) => ({ ...f, type, category: '' }))
  }

  function setField<K extends keyof TemplateFormData>(key: K, value: TemplateFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const amount = useRupiahInput(form.amountRaw, (raw) => setField('amountRaw', raw))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amountRaw || form.amountRaw <= 0) {
      toast('Masukkan nominal yang valid', 'error')
      return
    }

    setSubmitting(true)
    try {
      const data = {
        type: form.type,
        amount: form.amountRaw,
        category: activeCategory,
        merchant: form.merchant.trim() || undefined,
        notes: form.notes.trim() || undefined,
        recurringDay: form.recurringDay,
        isActive: form.isActive,
      }

      if (editingId) {
        await updateTemplate(editingId, data)
        toast('Template berhasil diperbarui', 'success')
      } else {
        await addTemplate(data)
        toast('Transaksi rutin berhasil ditambahkan', 'success')
      }
      setShowForm(false)
    } catch {
      toast('Gagal menyimpan template', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    showForm,
    openAdd,
    openEdit,
    closeForm,
    editingId,
    form,
    setField,
    activeCategory,
    amount,
    handleTypeChange,
    handleSubmit,
    submitting,
  }
}
