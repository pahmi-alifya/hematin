'use client'

import { useState } from 'react'
import { useGoalStore } from '@/stores/goalStore'
import { useRupiahInput } from './useRupiahInput'
import { toast } from '@/components/ui/Toast'
import { EXPENSE_CATEGORIES } from '@/lib/categories'
import type { Goal } from '@/types'

/** Owns alur tambah batas pengeluaran kategori baru (kategori yang belum ada goal-nya). */
export function useAddGoalForm(goals: Goal[]) {
  const setGoal = useGoalStore((s) => s.setGoal)
  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !goals.some((g) => g.category === c.id))

  const [show, setShow] = useState(false)
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id)
  const [limitRaw, setLimitRaw] = useState(0)
  const [saving, setSaving] = useState(false)
  const limit = useRupiahInput(limitRaw, setLimitRaw)

  function open() {
    setCategory(availableCategories[0]?.id ?? EXPENSE_CATEGORIES[0].id)
    setShow(true)
  }

  function close() {
    setShow(false)
  }

  async function handleSave() {
    if (!limitRaw || limitRaw <= 0) {
      toast('Masukkan jumlah limit yang valid', 'error')
      return
    }
    setSaving(true)
    try {
      await setGoal({ category, limitAmount: limitRaw })
      toast('Limit berhasil disimpan', 'success')
      setShow(false)
      setLimitRaw(0)
      setCategory(availableCategories[0]?.id ?? EXPENSE_CATEGORIES[0].id)
    } catch {
      toast('Gagal menyimpan limit', 'error')
    } finally {
      setSaving(false)
    }
  }

  return {
    availableCategories,
    show,
    open,
    close,
    category,
    setCategory,
    limit,
    saving,
    handleSave,
  }
}
