'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, Trash2, ChevronDown } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BottomNav } from '@/components/layout/BottomNav'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from '@/components/ui/Toast'
import { useGoalStore } from '@/stores/goalStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { EXPENSE_CATEGORIES } from '@/lib/categories'
import { formatRupiah, formatRupiahInput, parseRupiahInput, getCurrentMonth } from '@/lib/utils'

interface GoalCardProps {
  category: string
  limit: number
  spent: number
  goalId: string
  onDelete: (id: string) => void
}

function GoalCard({ category, limit, spent, goalId, onDelete }: GoalCardProps) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.id === category)
  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const remaining = limit - spent
  const isOver = spent > limit

  const barColor = isOver
    ? 'bg-red-500'
    : percentage >= 80
    ? 'bg-amber-400'
    : 'bg-sky-500'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: cat?.bgColor ?? '#F1F5F9' }}
          >
            {cat?.icon ?? '📦'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{cat?.name ?? category}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Limit {formatRupiah(limit)}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(goalId)}
          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          Terpakai <span className="font-semibold text-slate-700 dark:text-slate-200">{formatRupiah(spent)}</span>
        </span>
        <span className={isOver ? 'text-red-500 font-semibold' : 'text-slate-500'}>
          {isOver
            ? `Lebih ${formatRupiah(Math.abs(remaining))}`
            : `Sisa ${formatRupiah(remaining)}`}
        </span>
      </div>
    </motion.div>
  )
}

export default function GoalsPage() {
  const { goals, isLoading, loadGoals, setGoal, deleteGoal } = useGoalStore()
  const { transactions, loadTransactions } = useTransactionStore()
  const [showAdd, setShowAdd] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0].id)
  const [limitInput, setLimitInput] = useState('')
  const [saving, setSaving] = useState(false)

  const currentMonth = getCurrentMonth()

  useEffect(() => {
    loadGoals()
    loadTransactions()
  }, [loadGoals, loadTransactions])

  const monthGoals = useMemo(
    () => goals.filter((g) => g.month === currentMonth),
    [goals, currentMonth]
  )

  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach((t) => {
        map[t.category] = (map[t.category] ?? 0) + t.amount
      })
    return map
  }, [transactions, currentMonth])

  // Categories without a goal set yet
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (c) => !monthGoals.some((g) => g.category === c.id)
  )

  async function handleSave() {
    const amount = parseRupiahInput(limitInput)
    if (!amount || amount <= 0) {
      toast('Masukkan jumlah limit yang valid', 'error')
      return
    }
    setSaving(true)
    try {
      await setGoal({ category: selectedCategory, limitAmount: amount })
      toast('Limit berhasil disimpan', 'success')
      setShowAdd(false)
      setLimitInput('')
      setSelectedCategory(availableCategories[0]?.id ?? EXPENSE_CATEGORIES[0].id)
    } catch {
      toast('Gagal menyimpan limit', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteGoal(id)
    toast('Limit dihapus', 'success')
  }

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title="Batas Pengeluaran" />

      <PageWrapper>
        <div className="pb-28 space-y-4">
          {/* Header info */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                <Target className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Atur Batas Pengeluaran</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pantau dan kendalikan pengeluaran per kategori</p>
              </div>
            </div>
          </div>

          {/* Add button */}
          {availableCategories.length > 0 && (
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setSelectedCategory(availableCategories[0].id)
                setShowAdd(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Batas Kategori
            </Button>
          )}

          {/* Goal cards */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 h-28 animate-pulse" />
              ))}
            </div>
          ) : monthGoals.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="Belum ada batas"
              description="Atur batas pengeluaran per kategori untuk kontrol lebih baik"
            />
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {monthGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goalId={goal.id}
                    category={goal.category}
                    limit={goal.limitAmount}
                    spent={spentByCategory[goal.category] ?? 0}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </PageWrapper>

      <BottomNav />

      {/* Add Goal Sheet */}
      <BottomSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Tambah Batas Pengeluaran"
      >
        <div className="px-5 pb-6 space-y-4">
          {/* Category Picker */}
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Kategori</p>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-400 focus:bg-white dark:focus:bg-slate-700 transition-colors"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Batas Jumlah</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={limitInput}
                onChange={(e) => setLimitInput(formatRupiahInput(parseRupiahInput(e.target.value)))}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-sky-400 focus:bg-white dark:focus:bg-slate-700 transition-colors"
              />
            </div>
          </div>

          <Button variant="primary" fullWidth loading={saving} onClick={handleSave}>
            Simpan Batas
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
