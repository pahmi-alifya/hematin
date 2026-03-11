'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { id } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BottomNav } from '@/components/layout/BottomNav'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDebtStore } from '@/stores/debtStore'
import { toast } from '@/components/ui/Toast'
import { formatRupiah, parseRupiahInput, formatRupiahInput, getCurrentDate } from '@/lib/utils'
import type { Debt } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDueDateLabel(dueDate?: string): { label: string; urgent: boolean } {
  if (!dueDate) return { label: '', urgent: false }
  const today = format(new Date(), 'yyyy-MM-dd')
  const diff = differenceInDays(parseISO(dueDate), parseISO(today))
  if (diff < 0) return { label: `${Math.abs(diff)} hari lalu`, urgent: true }
  if (diff === 0) return { label: 'Hari ini!', urgent: true }
  if (diff === 1) return { label: 'Besok', urgent: true }
  if (diff <= 7) return { label: `${diff} hari lagi`, urgent: true }
  return { label: format(parseISO(dueDate), 'd MMM yyyy', { locale: id }), urgent: false }
}

function StatusBadge({ status, dueDate }: { status: Debt['status']; dueDate?: string }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Lunas
      </span>
    )
  }
  if (status === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3" /> Jatuh tempo
      </span>
    )
  }
  if (dueDate) {
    const { label, urgent } = getDueDateLabel(dueDate)
    if (urgent) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" /> {label}
        </span>
      )
    }
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-400 px-2 py-0.5 rounded-full">
      Aktif
    </span>
  )
}

// ─── Debt Card ────────────────────────────────────────────────────────────────

function DebtCard({
  debt,
  index,
  onMarkPaid,
  onDelete,
  onTap,
}: {
  debt: Debt
  index: number
  onMarkPaid: (debt: Debt) => void
  onDelete: (debt: Debt) => void
  onTap: (debt: Debt) => void
}) {
  const isPaid = debt.status === 'paid'
  const isOverdue = debt.status === 'overdue'
  const { label: dueDateLabel } = debt.dueDate ? getDueDateLabel(debt.dueDate) : { label: '' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border p-4 transition-all ${
        isOverdue
          ? 'border-red-200 dark:border-red-800/60 bg-red-50/40 dark:bg-red-900/10'
          : isPaid
          ? 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 opacity-60'
          : 'border-sky-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/60'
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <button onClick={() => onTap(debt)} className="flex-1 text-left">
          <p className={`font-bold text-base ${isPaid ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {debt.person}
          </p>
          {debt.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {debt.description}
            </p>
          )}
        </button>
        <div className="text-right shrink-0">
          <p className={`text-lg font-bold ${
            debt.type === 'hutang'
              ? 'text-red-500 dark:text-red-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {debt.type === 'hutang' ? '-' : '+'}{formatRupiah(debt.amount)}
          </p>
        </div>
      </div>

      {/* Status + due date */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <StatusBadge status={debt.status} dueDate={debt.dueDate} />
        {debt.dueDate && !isPaid && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {debt.status === 'overdue' ? dueDateLabel : `Jatuh tempo ${dueDateLabel}`}
          </span>
        )}
        {isPaid && debt.paidAt && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Lunas {format(new Date(debt.paidAt), 'd MMM yyyy', { locale: id })}
          </span>
        )}
      </div>

      {/* Actions */}
      {!isPaid && (
        <div className="flex gap-2">
          <button
            onClick={() => onMarkPaid(debt)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            <CheckCircle2 className="w-4 h-4" /> Tandai Lunas
          </button>
          <button
            onClick={() => onDelete(debt)}
            className="w-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 active:scale-95 transition-transform"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
      {isPaid && (
        <button
          onClick={() => onDelete(debt)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-slate-400 dark:text-slate-500 text-xs active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" /> Hapus catatan
        </button>
      )}
    </motion.div>
  )
}

// ─── Add/Edit Form ────────────────────────────────────────────────────────────

function DebtForm({
  defaultType,
  onSuccess,
}: {
  defaultType: 'hutang' | 'piutang'
  onSuccess: () => void
}) {
  const { addDebt } = useDebtStore()
  const [type, setType] = useState<'hutang' | 'piutang'>(defaultType)
  const [person, setPerson] = useState('')
  const [amount, setAmount] = useState('')
  const [amountRaw, setAmountRaw] = useState(0)
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseRupiahInput(e.target.value)
    setAmountRaw(raw)
    setAmount(formatRupiahInput(raw))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!person.trim()) { toast('Masukkan nama orang', 'error'); return }
    if (!amountRaw || amountRaw <= 0) { toast('Masukkan nominal yang valid', 'error'); return }
    setLoading(true)
    try {
      await addDebt({
        type,
        person: person.trim(),
        amount: amountRaw,
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
      })
      toast(type === 'hutang' ? 'Hutang berhasil dicatat' : 'Piutang berhasil dicatat', 'success')
      onSuccess()
    } catch {
      toast('Gagal menyimpan catatan', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
        {(['hutang', 'piutang'] as const).map((t) => (
          <motion.button
            key={t}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              type === t
                ? t === 'hutang'
                  ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t === 'hutang' ? '🔴 Hutang' : '🟢 Piutang'}
          </motion.button>
        ))}
      </div>

      {/* Nama */}
      <Input
        label={type === 'hutang' ? 'Nama orang yang kamu hutangi' : 'Nama orang yang berhutang ke kamu'}
        placeholder="misal: Budi, Mama, Kantor"
        value={person}
        onChange={(e) => setPerson(e.target.value)}
      />

      {/* Nominal */}
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Nominal</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={handleAmountChange}
            className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-2xl font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Keterangan */}
      <Textarea
        label="Keterangan (opsional)"
        placeholder="misal: bayar makan bareng, titip belanja"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />

      {/* Jatuh tempo */}
      <Input
        label="Jatuh tempo (opsional)"
        type="date"
        value={dueDate}
        min={getCurrentDate()}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <Button type="submit" fullWidth loading={loading} size="lg">
        Simpan Catatan
      </Button>
    </form>
  )
}

// ─── Mark As Paid Confirm Sheet ───────────────────────────────────────────────

function MarkPaidSheet({
  debt,
  onConfirm,
  onClose,
}: {
  debt: Debt
  onConfirm: (notes: string) => void
  onClose: () => void
}) {
  const [notes, setNotes] = useState('')
  return (
    <div className="px-5 pb-6 space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Tandai hutang ke <span className="font-semibold text-slate-800 dark:text-slate-200">{debt.person}</span> sebesar{' '}
        <span className="font-bold text-red-500">{formatRupiah(debt.amount)}</span> sudah lunas?
      </p>
      <Textarea
        label="Catatan (opsional)"
        placeholder="misal: sudah transfer BCA"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />
      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={onClose}>Batal</Button>
        <Button fullWidth onClick={() => onConfirm(notes)}>
          Ya, Sudah Lunas ✓
        </Button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DebtsPage() {
  const { debts, isLoading, loadDebts, markAsPaid, deleteDebt, getActiveHutang, getActivePiutang, getTotalHutang, getTotalPiutang } = useDebtStore()
  const [activeTab, setActiveTab] = useState<'hutang' | 'piutang'>('hutang')
  const [showAdd, setShowAdd] = useState(false)
  const [showPaidSheet, setShowPaidSheet] = useState<Debt | null>(null)
  const [showDetail, setShowDetail] = useState<Debt | null>(null)
  const [showPaidList, setShowPaidList] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadDebts()
  }, [loadDebts])

  const activeHutang = useMemo(() => getActiveHutang(), [debts])
  const activePiutang = useMemo(() => getActivePiutang(), [debts])
  const totalHutang = useMemo(() => getTotalHutang(), [debts])
  const totalPiutang = useMemo(() => getTotalPiutang(), [debts])

  const activeList = activeTab === 'hutang' ? activeHutang : activePiutang
  const paidList = useMemo(
    () => debts.filter((d) => d.type === activeTab && d.status === 'paid'),
    [debts, activeTab],
  )

  // Overdue items first, then by due date, then by createdAt
  const sortedActive = useMemo(() => [...activeList].sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1
    if (b.status === 'overdue' && a.status !== 'overdue') return 1
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return b.createdAt - a.createdAt
  }), [activeList])

  async function handleMarkPaid(notes: string) {
    if (!showPaidSheet) return
    try {
      await markAsPaid(showPaidSheet.id, notes)
      toast('Alhamdulillah, hutang lunas! 🎉', 'success')
      setShowPaidSheet(null)
    } catch {
      toast('Gagal memperbarui', 'error')
    }
  }

  async function handleDelete(debt: Debt) {
    try {
      await deleteDebt(debt.id)
      toast('Catatan dihapus', 'success')
      setShowDetail(null)
    } catch {
      toast('Gagal menghapus', 'error')
    }
  }

  if (!mounted) return null

  const overdueCount = activeHutang.filter((d) => d.status === 'overdue').length

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title="Utang & Piutang" />

      <PageWrapper>
        <div className="space-y-4 pb-28">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-red-100 dark:border-red-900/40 shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Hutangku</p>
              <p className="text-xl font-bold text-red-500 dark:text-red-400">{formatRupiah(totalHutang)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{activeHutang.length} catatan aktif</p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Piutangku</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(totalPiutang)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{activePiutang.length} catatan aktif</p>
            </div>
          </div>

          {/* Overdue warning */}
          <AnimatePresence>
            {overdueCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 rounded-2xl px-4 py-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  {overdueCount} hutang sudah melewati jatuh tempo!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab toggle */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            {(['hutang', 'piutang'] as const).map((t) => (
              <motion.button
                key={t}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === t
                    ? 'bg-white dark:bg-slate-700 shadow-sm ' + (t === 'hutang' ? 'text-red-500' : 'text-emerald-600')
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t === 'hutang' ? `🔴 Hutangku (${activeHutang.length})` : `🟢 Piutangku (${activePiutang.length})`}
              </motion.button>
            ))}
          </div>

          {/* Active list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ))}
            </div>
          ) : sortedActive.length === 0 ? (
            <EmptyState
              icon={activeTab === 'hutang' ? '🎉' : '💸'}
              title={activeTab === 'hutang' ? 'Tidak ada hutang' : 'Tidak ada piutang'}
              description={activeTab === 'hutang' ? 'Kamu tidak punya hutang aktif saat ini' : 'Tidak ada orang yang hutang ke kamu saat ini'}
              action={{ label: `+ Tambah ${activeTab === 'hutang' ? 'Hutang' : 'Piutang'}`, onClick: () => setShowAdd(true) }}
            />
          ) : (
            <div className="space-y-3">
              {sortedActive.map((debt, i) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  index={i}
                  onMarkPaid={() => setShowPaidSheet(debt)}
                  onDelete={() => handleDelete(debt)}
                  onTap={() => setShowDetail(debt)}
                />
              ))}
            </div>
          )}

          {/* Paid list (collapsible) */}
          {paidList.length > 0 && (
            <div>
              <button
                onClick={() => setShowPaidList((v) => !v)}
                className="w-full flex items-center justify-between px-1 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400"
              >
                <span>Sudah Lunas ({paidList.length})</span>
                {showPaidList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence>
                {showPaidList && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {paidList.map((debt, i) => (
                      <DebtCard
                        key={debt.id}
                        debt={debt}
                        index={i}
                        onMarkPaid={() => {}}
                        onDelete={() => handleDelete(debt)}
                        onTap={() => setShowDetail(debt)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Add button (when list not empty) */}
          {sortedActive.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Tambah {activeTab === 'hutang' ? 'Hutang' : 'Piutang'}
            </motion.button>
          )}
        </div>
      </PageWrapper>

      <BottomNav onFabClick={() => setShowAdd(true)} />

      {/* Add Debt Sheet */}
      <BottomSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title={`Catat ${activeTab === 'hutang' ? 'Hutang' : 'Piutang'}`}
      >
        <DebtForm defaultType={activeTab} onSuccess={() => setShowAdd(false)} />
      </BottomSheet>

      {/* Mark as Paid Sheet */}
      <BottomSheet
        open={!!showPaidSheet}
        onClose={() => setShowPaidSheet(null)}
        title="Tandai Lunas"
      >
        {showPaidSheet && (
          <MarkPaidSheet
            debt={showPaidSheet}
            onConfirm={handleMarkPaid}
            onClose={() => setShowPaidSheet(null)}
          />
        )}
      </BottomSheet>

      {/* Detail Sheet */}
      <BottomSheet
        open={!!showDetail}
        onClose={() => setShowDetail(null)}
        title="Detail Catatan"
      >
        {showDetail && (
          <div className="px-5 pb-6 space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                {showDetail.type === 'hutang' ? 'Hutang ke' : 'Piutang dari'} {showDetail.person}
              </p>
              <p className={`text-3xl font-bold ${showDetail.type === 'hutang' ? 'text-red-500' : 'text-emerald-600'}`}>
                {formatRupiah(showDetail.amount)}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl divide-y divide-slate-200 dark:divide-slate-700">
              {[
                { label: 'Jenis', value: showDetail.type === 'hutang' ? '🔴 Hutang' : '🟢 Piutang' },
                { label: 'Keterangan', value: showDetail.description || '-' },
                { label: 'Jatuh Tempo', value: showDetail.dueDate ? format(parseISO(showDetail.dueDate), 'd MMMM yyyy', { locale: id }) : 'Tidak ditentukan' },
                { label: 'Status', value: showDetail.status === 'paid' ? '✅ Lunas' : showDetail.status === 'overdue' ? '⚠️ Melewati jatuh tempo' : '🕐 Aktif' },
                ...(showDetail.notes ? [{ label: 'Catatan Lunas', value: showDetail.notes }] : []),
                { label: 'Dicatat', value: format(new Date(showDetail.createdAt), 'd MMM yyyy', { locale: id }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start px-4 py-3 gap-4">
                  <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-right">{value}</span>
                </div>
              ))}
            </div>
            {showDetail.status !== 'paid' && (
              <Button
                fullWidth
                onClick={() => { setShowPaidSheet(showDetail); setShowDetail(null) }}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Tandai Lunas
              </Button>
            )}
            <Button variant="danger" fullWidth onClick={() => handleDelete(showDetail)}>
              <Trash2 className="w-4 h-4 mr-1.5" /> Hapus Catatan
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
