'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { formatRupiah } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
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
  const t = useTranslation()
  return (
    <div className="px-5 pb-6 space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {t.debts.markPaidSheet.confirmPrefix(debt.type)}{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{debt.person}</span>{' '}
        {t.debts.markPaidSheet.confirmMiddle}{' '}
        <span className="font-bold text-red-500">{formatRupiah(debt.amount)}</span>{' '}
        {t.debts.markPaidSheet.confirmSuffix}
      </p>
      <Textarea
        label={t.debts.markPaidSheet.notesLabel}
        placeholder={t.debts.markPaidSheet.notesPlaceholder}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />
      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={onClose}>{t.common.cancel}</Button>
        <Button fullWidth onClick={() => onConfirm(notes)}>
          {t.debts.markPaidSheet.confirmButton}
        </Button>
      </div>
    </div>
  )
}
