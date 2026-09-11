'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { formatRupiah, getCurrentDate } from '@/lib/utils'
import { useRupiahInput } from '@/hooks/useRupiahInput'
import type { Debt } from '@/types'

export function PaymentSheet({
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
  const [amountRaw, setAmountRaw] = useState(defaultAmount)
  const amount = useRupiahInput(amountRaw, setAmountRaw)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amountRaw || amountRaw <= 0) {
      toast('Masukkan nominal pembayaran', 'error')
      return
    }
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
            value={amount.display}
            onChange={amount.onChange}
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
