'use client'

import { useState } from 'react'
import { useGoalStore } from '@/stores/goalStore'
import { useRupiahInput } from './useRupiahInput'
import { toast } from '@/components/ui/Toast'

interface EditingGoal {
  id: string
  category: string
}

/** Owns alur edit limit goal yang sudah ada. */
export function useEditGoalForm() {
  const setGoal = useGoalStore((s) => s.setGoal)
  const [editingGoal, setEditingGoal] = useState<EditingGoal | null>(null)
  const [limitRaw, setLimitRaw] = useState(0)
  const [saving, setSaving] = useState(false)
  const limit = useRupiahInput(limitRaw, setLimitRaw)

  function open(goalId: string, category: string, currentLimit: number) {
    setEditingGoal({ id: goalId, category })
    setLimitRaw(currentLimit)
  }

  function close() {
    setEditingGoal(null)
  }

  async function handleSave() {
    if (!editingGoal) return
    if (!limitRaw || limitRaw <= 0) {
      toast('Masukkan jumlah limit yang valid', 'error')
      return
    }
    setSaving(true)
    try {
      await setGoal({ category: editingGoal.category, limitAmount: limitRaw })
      toast('Limit berhasil diperbarui', 'success')
      setEditingGoal(null)
    } catch {
      toast('Gagal memperbarui limit', 'error')
    } finally {
      setSaving(false)
    }
  }

  return {
    editingGoal,
    open,
    close,
    limit,
    saving,
    handleSave,
  }
}
