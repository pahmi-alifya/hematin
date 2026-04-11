'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { id } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
  CreditCard,
  X,
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
import {
  formatRupiah,
  parseRupiahInput,
  formatRupiahInput,
  getCurrentDate,
} from '@/lib/utils'
import type { Debt, DebtPayment } from '@/types'

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

function StatusBadge({ status, dueDate, isCicilan }: { status: Debt['status']; dueDate?: string; isCicilan?: boolean }) {
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
        <AlertCircle className="w-3 h-3" /> {isCicilan ? 'Cicilan terlambat' : 'Jatuh tempo'}
      </span>
    )
  }
  if (status === 'partial') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
        <CreditCard className="w-3 h-3" /> Dicicil
      </span>
    )
  }
  if (isCicilan) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-400 px-2 py-0.5 rounded-full">
        <CreditCard className="w-3 h-3" /> Cicilan
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

// ─── Cicilan Reminder Banner ──────────────────────────────────────────────────

function CicilanReminderBanner({
  debts,
  onPayNow,
}: {
  debts: Debt[]
  onPayNow: (debt: Debt) => void
}) {
  const [dismissed, setDismissed] = useState(false)
  const dismissKey = `hematin_cicilan_dismissed_${format(new Date(), 'yyyy-MM-dd')}`

  useEffect(() => {
    setDismissed(localStorage.getItem(dismissKey) === '1')
  }, [dismissKey])

  if (dismissed || debts.length === 0) return null

  function handleDismiss() {
    localStorage.setItem(dismissKey, '1')
    setDismissed(true)
  }

  const preview = debts
    .slice(0, 2)
    .map((d) => `${d.person} ${formatRupiah(d.cicilanAmount ?? 0)}`)
    .join(' · ')

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl px-4 py-3"
    >
      <div className="flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            {debts.length} cicilan jatuh tempo hari ini
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 truncate mt-0.5">{preview}</p>
          <button
            onClick={() => onPayNow(debts[0])}
            className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300 underline underline-offset-2"
          >
            Catat Pembayaran
          </button>
        </div>
        <button onClick={handleDismiss} className="text-amber-400 hover:text-amber-600 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function CicilanProgress({ debt, totalPaid }: { debt: Debt; totalPaid: number }) {
  const pct = Math.min(100, (totalPaid / debt.amount) * 100)
  const remaining = Math.max(0, debt.amount - totalPaid)
  const color =
    pct >= 90 ? 'bg-emerald-500' : pct >= 50 ? 'bg-green-500' : 'bg-sky-500'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>Dibayar {formatRupiah(totalPaid)}</span>
        <span>Sisa {formatRupiah(remaining)}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ─── Debt Card ────────────────────────────────────────────────────────────────

function DebtCard({
  debt,
  index,
  totalPaid,
  onMarkPaid,
  onDelete,
  onTap,
  onPayCicilan,
  onShowHistory,
}: {
  debt: Debt
  index: number
  totalPaid: number
  onMarkPaid: (debt: Debt) => void
  onDelete: (debt: Debt) => void
  onTap: (debt: Debt) => void
  onPayCicilan: (debt: Debt) => void
  onShowHistory: (debt: Debt) => void
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
            debt.type === 'hutang' ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {debt.type === 'hutang' ? '-' : '+'}{formatRupiah(debt.amount)}
          </p>
          {debt.isCicilan && debt.cicilanAmount && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Cicilan {formatRupiah(debt.cicilanAmount)}/bln
            </p>
          )}
        </div>
      </div>

      {/* Status + due date */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <StatusBadge status={debt.status} dueDate={debt.dueDate} isCicilan={debt.isCicilan} />
        {!debt.isCicilan && debt.dueDate && !isPaid && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {debt.status === 'overdue' ? dueDateLabel : `Jatuh tempo ${dueDateLabel}`}
          </span>
        )}
        {debt.isCicilan && debt.cicilanDay && !isPaid && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Tiap tgl {debt.cicilanDay}
          </span>
        )}
        {isPaid && debt.paidAt && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Lunas {format(new Date(debt.paidAt), 'd MMM yyyy', { locale: id })}
          </span>
        )}
      </div>

      {/* Progress bar for cicilan */}
      {debt.isCicilan && !isPaid && (
        <div className="mb-3">
          <CicilanProgress debt={debt} totalPaid={totalPaid} />
        </div>
      )}

      {/* Actions */}
      {!isPaid && (
        <div className="flex gap-2">
          {debt.isCicilan ? (
            <>
              <button
                onClick={() => onPayCicilan(debt)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold active:scale-95 transition-transform"
              >
                <CreditCard className="w-4 h-4" /> Bayar Cicilan
              </button>
              <button
                onClick={() => onShowHistory(debt)}
                className="w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 active:scale-95 transition-transform"
              >
                <History className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onMarkPaid(debt)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold active:scale-95 transition-transform"
            >
              <CheckCircle2 className="w-4 h-4" /> Tandai Lunas
            </button>
          )}
          <button
            onClick={() => onDelete(debt)}
            className="w-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 active:scale-95 transition-transform"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
      {isPaid && (
        <div className="flex gap-2">
          {debt.isCicilan && (
            <button
              onClick={() => onShowHistory(debt)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-slate-400 dark:text-slate-500 text-xs active:scale-95"
            >
              <History className="w-3.5 h-3.5" /> Riwayat
            </button>
          )}
          <button
            onClick={() => onDelete(debt)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-slate-400 dark:text-slate-500 text-xs active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus catatan
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ─── Debt Form ────────────────────────────────────────────────────────────────

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
  const [isCicilan, setIsCicilan] = useState(false)
  const [cicilanAmount, setCicilanAmount] = useState('')
  const [cicilanAmountRaw, setCicilanAmountRaw] = useState(0)
  const [cicilanDay, setCicilanDay] = useState(1)
  const [cicilanStartMonth, setCicilanStartMonth] = useState(
    format(new Date(), 'yyyy-MM'),
  )
  const [loading, setLoading] = useState(false)

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseRupiahInput(e.target.value)
    setAmountRaw(raw)
    setAmount(formatRupiahInput(raw))
  }

  function handleCicilanAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseRupiahInput(e.target.value)
    setCicilanAmountRaw(raw)
    setCicilanAmount(formatRupiahInput(raw))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!person.trim()) { toast('Masukkan nama orang', 'error'); return }
    if (!amountRaw || amountRaw <= 0) { toast('Masukkan nominal yang valid', 'error'); return }
    if (isCicilan && (!cicilanAmountRaw || cicilanAmountRaw <= 0)) {
      toast('Masukkan nominal cicilan per bulan', 'error'); return
    }
    setLoading(true)
    try {
      await addDebt({
        type,
        person: person.trim(),
        amount: amountRaw,
        description: description.trim() || undefined,
        dueDate: !isCicilan ? (dueDate || undefined) : undefined,
        isCicilan: isCicilan || undefined,
        cicilanAmount: isCicilan ? cicilanAmountRaw : undefined,
        cicilanDay: isCicilan ? cicilanDay : undefined,
        cicilanStartMonth: isCicilan ? cicilanStartMonth : undefined,
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

      {/* Nominal total */}
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
          Total {isCicilan ? '(keseluruhan)' : 'Nominal'}
        </label>
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

      {/* Mode pembayaran */}
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mode Pembayaran</p>
        <div className="flex gap-2">
          {[
            { value: false, label: '💵 Lunas Sekaligus' },
            { value: true, label: '📅 Cicilan Bulanan' },
          ].map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setIsCicilan(value)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isCicilan === value
                  ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cicilan fields */}
      <AnimatePresence>
        {isCicilan && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Nominal per cicilan */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Nominal per Cicilan
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={cicilanAmount}
                  onChange={handleCicilanAmountChange}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Tanggal tiap bulan */}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Jatuh Tempo Tiap Bulan (tanggal)
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {[1, 5, 10, 15, 20, 25, 28].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setCicilanDay(d)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                      cicilanDay === d
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {/* Custom tanggal */}
              <div className="mt-2">
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={cicilanDay}
                  onChange={(e) => {
                    const v = Math.min(28, Math.max(1, Number(e.target.value)))
                    setCicilanDay(v)
                  }}
                  className="w-24 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="tgl lain"
                />
                <span className="text-xs text-slate-400 ml-2">angka 1–28</span>
              </div>
            </div>

            {/* Mulai bulan */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Mulai Bulan
              </label>
              <input
                type="month"
                value={cicilanStartMonth}
                onChange={(e) => setCicilanStartMonth(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jatuh tempo (hanya untuk lunas sekaligus) */}
      {!isCicilan && (
        <Input
          label="Jatuh tempo (opsional)"
          type="date"
          value={dueDate}
          min={getCurrentDate()}
          onChange={(e) => setDueDate(e.target.value)}
        />
      )}

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
        Tandai {debt.type === 'hutang' ? 'hutang ke' : 'piutang dari'}{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{debt.person}</span> sebesar{' '}
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

// ─── Payment Sheet (Cicilan) ──────────────────────────────────────────────────

function PaymentSheet({
  debt,
  remaining,
  paidDate,
  onPaidDateChange,
  onConfirm,
  onClose,
}: {
  debt: Debt
  remaining: number
  paidDate: string
  onPaidDateChange: (v: string) => void
  onConfirm: (amount: number, notes: string) => void
  onClose: () => void
}) {
  const defaultAmount = debt.cicilanAmount ?? remaining
  const [amount, setAmount] = useState(formatRupiahInput(defaultAmount))
  const [amountRaw, setAmountRaw] = useState(defaultAmount)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseRupiahInput(e.target.value)
    setAmountRaw(raw)
    setAmount(formatRupiahInput(raw))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amountRaw || amountRaw <= 0) { toast('Masukkan nominal pembayaran', 'error'); return }
    setLoading(true)
    try {
      onConfirm(amountRaw, notes)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sisa hutang ke</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">{debt.person}</p>
        </div>
        <p className={`text-lg font-bold ${debt.type === 'hutang' ? 'text-red-500' : 'text-emerald-600'}`}>
          {formatRupiah(remaining)}
        </p>
      </div>

      {/* Nominal bayar */}
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
          Nominal Pembayaran
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={handleAmountChange}
            className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-2xl font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
        </div>
        {debt.cicilanAmount && (
          <p className="text-xs text-slate-400 mt-1">
            Cicilan normal: {formatRupiah(debt.cicilanAmount)}
          </p>
        )}
      </div>

      {/* Tanggal bayar */}
      <Input
        label="Tanggal Bayar"
        type="date"
        value={paidDate}
        max={getCurrentDate()}
        onChange={(e) => onPaidDateChange(e.target.value)}
      />

      {/* Catatan */}
      <Textarea
        label="Catatan (opsional)"
        placeholder="misal: transfer BCA, bayar tunai"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      <Button type="submit" fullWidth loading={loading} size="lg">
        Simpan Pembayaran
      </Button>
    </form>
  )
}

// ─── Payment History Sheet ────────────────────────────────────────────────────

function PaymentHistory({
  debt,
  payments,
  totalPaid,
  remaining,
  onDeletePayment,
}: {
  debt: Debt
  payments: DebtPayment[]
  totalPaid: number
  remaining: number
  onDeletePayment: (id: string) => void
}) {
  const sorted = [...payments].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="px-5 pb-6 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Sudah Dibayar</p>
          <p className="font-bold text-emerald-600 dark:text-emerald-400 text-base">{formatRupiah(totalPaid)}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Sisa</p>
          <p className={`font-bold text-base ${remaining <= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {remaining <= 0 ? 'LUNAS 🎉' : formatRupiah(remaining)}
          </p>
        </div>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-4">Belum ada pembayaran</p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {sorted.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatRupiah(p.amount)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {format(parseISO(p.paidDate), 'd MMM yyyy', { locale: id })}
                  {p.notes && ` · ${p.notes}`}
                </p>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full shrink-0">
                {p.month}
              </span>
              <button
                onClick={() => onDeletePayment(p.id)}
                className="text-red-400 hover:text-red-600 shrink-0 active:scale-90 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DebtsPage() {
  const {
    debts,
    isLoading,
    loadDebts,
    markAsPaid,
    deleteDebt,
    addPayment,
    deletePayment,
    getActiveHutang,
    getActivePiutang,
    getTotalHutang,
    getTotalPiutang,
    getPaymentsByDebt,
    getTotalPaid,
    getRemaining,
    getPendingCicilanToday,
  } = useDebtStore()

  const [activeTab, setActiveTab] = useState<'hutang' | 'piutang'>('hutang')
  const [showAdd, setShowAdd] = useState(false)
  const [showPaidSheet, setShowPaidSheet] = useState<Debt | null>(null)
  const [showDetail, setShowDetail] = useState<Debt | null>(null)
  const [showPaidList, setShowPaidList] = useState(false)
  const [showPaymentSheet, setShowPaymentSheet] = useState<Debt | null>(null)
  const [showHistory, setShowHistory] = useState<Debt | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadDebts()
  }, [loadDebts])

  const activeHutang = useMemo(() => getActiveHutang(), [debts])
  const activePiutang = useMemo(() => getActivePiutang(), [debts])
  const totalHutang = useMemo(() => getTotalHutang(), [debts])
  const totalPiutang = useMemo(() => getTotalPiutang(), [debts])
  const pendingCicilan = useMemo(() => getPendingCicilanToday(), [debts])

  const activeList = activeTab === 'hutang' ? activeHutang : activePiutang
  const paidList = useMemo(
    () => debts.filter((d) => d.type === activeTab && d.status === 'paid'),
    [debts, activeTab],
  )

  const sortedActive = useMemo(
    () =>
      [...activeList].sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1
        if (b.status === 'overdue' && a.status !== 'overdue') return 1
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return b.createdAt - a.createdAt
      }),
    [activeList],
  )

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

  const [cicilanPaidDate, setCicilanPaidDate] = useState(getCurrentDate())

  async function handlePayCicilan(amount: number, notes: string) {
    if (!showPaymentSheet) return
    try {
      const currentMonth = format(new Date(), 'yyyy-MM')
      const { isFullyPaid } = await addPayment({
        debtId: showPaymentSheet.id,
        amount,
        paidDate: cicilanPaidDate,
        month: currentMonth,
        notes: notes || undefined,
      })
      setShowPaymentSheet(null)
      if (isFullyPaid) {
        toast(`Hutang ke ${showPaymentSheet.person} LUNAS! 🎊`, 'success')
      } else {
        toast('Cicilan bulan ini berhasil dicatat', 'success')
      }
    } catch {
      toast('Gagal menyimpan pembayaran', 'error')
    }
  }

  async function handleDeletePayment(id: string) {
    try {
      await deletePayment(id)
      toast('Pembayaran dihapus', 'success')
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

          {/* Cicilan reminder banner */}
          <AnimatePresence>
            {pendingCicilan.length > 0 && (
              <CicilanReminderBanner
                debts={pendingCicilan}
                onPayNow={(d) => setShowPaymentSheet(d)}
              />
            )}
          </AnimatePresence>

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
              description={
                activeTab === 'hutang'
                  ? 'Kamu tidak punya hutang aktif saat ini'
                  : 'Tidak ada orang yang hutang ke kamu saat ini'
              }
              action={{ label: `+ Tambah ${activeTab === 'hutang' ? 'Hutang' : 'Piutang'}`, onClick: () => setShowAdd(true) }}
            />
          ) : (
            <div className="space-y-3">
              {sortedActive.map((debt, i) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  index={i}
                  totalPaid={getTotalPaid(debt.id)}
                  onMarkPaid={() => setShowPaidSheet(debt)}
                  onDelete={() => handleDelete(debt)}
                  onTap={() => setShowDetail(debt)}
                  onPayCicilan={() => setShowPaymentSheet(debt)}
                  onShowHistory={() => setShowHistory(debt)}
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
                        totalPaid={getTotalPaid(debt.id)}
                        onMarkPaid={() => {}}
                        onDelete={() => handleDelete(debt)}
                        onTap={() => setShowDetail(debt)}
                        onPayCicilan={() => {}}
                        onShowHistory={() => setShowHistory(debt)}
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

      <BottomNav />

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

      {/* Payment (Cicilan) Sheet */}
      <BottomSheet
        open={!!showPaymentSheet}
        onClose={() => setShowPaymentSheet(null)}
        title="Catat Pembayaran"
      >
        {showPaymentSheet && (
          <PaymentSheet
            debt={showPaymentSheet}
            remaining={getRemaining(showPaymentSheet.id)}
            paidDate={cicilanPaidDate}
            onPaidDateChange={setCicilanPaidDate}
            onConfirm={handlePayCicilan}
            onClose={() => setShowPaymentSheet(null)}
          />
        )}
      </BottomSheet>

      {/* History Sheet */}
      <BottomSheet
        open={!!showHistory}
        onClose={() => setShowHistory(null)}
        title={`Riwayat Pembayaran — ${showHistory?.person ?? ''}`}
      >
        {showHistory && (
          <PaymentHistory
            debt={showHistory}
            payments={getPaymentsByDebt(showHistory.id)}
            totalPaid={getTotalPaid(showHistory.id)}
            remaining={getRemaining(showHistory.id)}
            onDeletePayment={handleDeletePayment}
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
                { label: 'Mode', value: showDetail.isCicilan ? `📅 Cicilan ${formatRupiah(showDetail.cicilanAmount ?? 0)}/bln (tgl ${showDetail.cicilanDay})` : '💵 Lunas Sekaligus' },
                { label: 'Keterangan', value: showDetail.description || '-' },
                ...(!showDetail.isCicilan ? [{ label: 'Jatuh Tempo', value: showDetail.dueDate ? format(parseISO(showDetail.dueDate), 'd MMMM yyyy', { locale: id }) : 'Tidak ditentukan' }] : []),
                { label: 'Status', value: showDetail.status === 'paid' ? '✅ Lunas' : showDetail.status === 'overdue' ? '⚠️ Terlambat' : showDetail.status === 'partial' ? '📊 Dicicil' : '🕐 Aktif' },
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
              showDetail.isCicilan ? (
                <Button
                  fullWidth
                  onClick={() => { setShowPaymentSheet(showDetail); setShowDetail(null) }}
                >
                  <CreditCard className="w-4 h-4 mr-1.5" /> Bayar Cicilan
                </Button>
              ) : (
                <Button
                  fullWidth
                  onClick={() => { setShowPaidSheet(showDetail); setShowDetail(null) }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Tandai Lunas
                </Button>
              )
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
