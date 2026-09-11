'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { formatRupiah } from '@/lib/utils'
import type { Debt } from '@/types'

export function MarkPaidSheet({
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
