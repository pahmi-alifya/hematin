'use client'

import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { Pencil } from 'lucide-react'
import { SkeletonTransactionItem } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { TransactionItem } from './TransactionItem'
import { TransactionForm } from './TransactionForm'
import { useTransactionStore } from '@/stores/transactionStore'
import { toast } from '@/components/ui/Toast'
import { formatRupiah, formatDate } from '@/lib/utils'
import { getCategoryById } from '@/lib/categories'
import type { Transaction } from '@/types'

interface TransactionListProps {
  month?: string
  onAddClick?: () => void
  search?: string
  typeFilter?: string   // 'all' | 'income' | 'expense' | 'saving'
  categoryFilter?: string
  sortBy?: string       // 'newest' | 'oldest' | 'largest' | 'smallest'
}

function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {}
  for (const t of transactions) {
    if (!groups[t.date]) groups[t.date] = []
    groups[t.date].push(t)
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

function formatGroupDate(dateStr: string): string {
  const d = parseISO(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateStr === format(today, 'yyyy-MM-dd')) return 'Hari ini'
  if (dateStr === format(yesterday, 'yyyy-MM-dd')) return 'Kemarin'
  return format(d, 'EEEE, d MMMM', { locale: id })
}

export function TransactionList({ month, onAddClick, search, typeFilter, categoryFilter, sortBy = 'newest' }: TransactionListProps) {
  const { transactions, isLoading, deleteTransaction } = useTransactionStore()
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    let result = month ? transactions.filter((t) => t.date.startsWith(month)) : transactions
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.merchant?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      )
    }
    if (typeFilter && typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter)
    }
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter)
    }
    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'oldest')   return a.createdAt - b.createdAt
      if (sortBy === 'largest')  return b.amount - a.amount
      if (sortBy === 'smallest') return a.amount - b.amount
      return b.createdAt - a.createdAt // newest (default)
    })
    return result
  }, [transactions, month, search, typeFilter, categoryFilter, sortBy])

  const grouped = useMemo(() => groupByDate(filtered), [filtered])

  async function handleDelete() {
    if (!selected) return
    setDeleting(true)
    try {
      await deleteTransaction(selected.id)
      toast('Transaksi dihapus', 'success')
      setSelected(null)
    } catch {
      toast('Gagal menghapus transaksi', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonTransactionItem key={i} />
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="Belum ada transaksi"
        description={month ? 'Belum ada transaksi bulan ini' : 'Mulai catat transaksi pertamamu'}
        action={onAddClick ? { label: '+ Tambah Transaksi', onClick: onAddClick } : undefined}
      />
    )
  }

  return (
    <>
      <div>
        {grouped.map(([date, items]) => {
          const dayIncome  = items.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
          const dayExpense = items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
          const daySaving  = items.filter((t) => t.type === 'saving').reduce((s, t) => s + t.amount, 0)
          const dayNet = dayIncome - dayExpense - daySaving

          return (
          <div key={date}>
            {/* Date Group Header */}
            <div className="px-4 py-2 bg-sky-50 dark:bg-slate-800/80 border-y border-sky-100 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                {formatGroupDate(date)}
              </span>
              <div className="flex items-center gap-1.5">
                {dayIncome > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-500">
                    +{formatRupiah(dayIncome)}
                  </span>
                )}
                {dayExpense > 0 && (
                  <span className="text-[11px] font-semibold text-rose-500">
                    -{formatRupiah(dayExpense)}
                  </span>
                )}
                {daySaving > 0 && (
                  <span className="text-[11px] font-semibold text-teal-500">
                    →{formatRupiah(daySaving)}
                  </span>
                )}
                {(dayIncome > 0 || dayExpense > 0 || daySaving > 0) && items.length > 1 && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    dayNet >= 0
                      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400'
                  }`}>
                    {dayNet >= 0 ? '+' : ''}{formatRupiah(dayNet)}
                  </span>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {items.map((t, i) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  index={i}
                  onPress={() => setSelected(t)}
                />
              ))}
            </div>
          </div>
          )
        })}
      </div>

      {/* Detail Bottom Sheet */}
      <BottomSheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detail Transaksi"
      >
        {selected && (
          <div className="px-5 pb-6 space-y-4">
            {/* Amount */}
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                {selected.type === 'income' ? 'Pemasukan' : selected.type === 'saving' ? 'Tabungan / Investasi' : 'Pengeluaran'}
              </p>
              <p className={`text-3xl font-bold ${
                selected.type === 'income' ? 'text-emerald-600 dark:text-emerald-400'
                : selected.type === 'saving' ? 'text-teal-600 dark:text-teal-400'
                : 'text-slate-800 dark:text-slate-100'
              }`}>
                {selected.type === 'income' ? '+' : selected.type === 'saving' ? '→' : '-'}{formatRupiah(selected.amount)}
              </p>
            </div>

            {/* Details */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl divide-y divide-slate-200 dark:divide-slate-700">
              {[
                { label: 'Kategori', value: getCategoryById(selected.category, selected.type)?.name ?? selected.category },
                { label: 'Toko/Keterangan', value: selected.merchant || '-' },
                { label: 'Tanggal', value: formatDate(selected.date) },
                { label: 'Catatan', value: selected.notes || '-' },
                { label: 'Cara input', value: selected.source === 'scan' ? '📷 Scan struk' : '✏️ Manual' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start px-4 py-3 gap-4">
                  <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => { setEditing(selected); setSelected(null) }}
              >
                <Pencil className="w-4 h-4 mr-1.5" /> Edit
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={deleting}
                onClick={handleDelete}
              >
                Hapus
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Edit Transaction Sheet */}
      <BottomSheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Transaksi"
      >
        {editing && (
          <TransactionForm
            editId={editing.id}
            defaultValues={{
              type: editing.type,
              amount: editing.amount,
              category: editing.category,
              merchant: editing.merchant,
              notes: editing.notes,
              date: editing.date,
              source: editing.source === 'recurring' ? 'manual' : editing.source,
            }}
            onSuccess={() => setEditing(null)}
          />
        )}
      </BottomSheet>
    </>
  )
}
