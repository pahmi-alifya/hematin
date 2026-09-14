'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useDebtStore } from '@/stores/debtStore'
import { toast } from '@/components/ui/Toast'
import { getCurrentDate } from '@/lib/utils'
import { useTranslation } from './useTranslation'
import type { Debt } from '@/types'

/** Owns alur bayar cicilan & hapus riwayat pembayaran. */
export function useCicilanPayments(onPaid?: () => void) {
  const { addPayment, deletePayment } = useDebtStore()
  const [cicilanPaidDate, setCicilanPaidDate] = useState(getCurrentDate())
  const t = useTranslation()

  async function handlePayCicilan(debt: Debt, amount: number, notes: string) {
    try {
      const currentMonth = format(new Date(), 'yyyy-MM')
      const { isFullyPaid } = await addPayment({
        debtId: debt.id,
        amount,
        paidDate: cicilanPaidDate,
        month: currentMonth,
        notes: notes || undefined,
      })
      onPaid?.()
      if (isFullyPaid) {
        toast(t.debts.paymentToast.fullyPaid(debt.person), 'success')
      } else {
        toast(t.debts.paymentToast.success, 'success')
      }
    } catch {
      toast(t.debts.paymentToast.error, 'error')
    }
  }

  async function handleDeletePayment(id: string) {
    try {
      await deletePayment(id)
      toast(t.debts.paymentToast.deleteSuccess, 'success')
    } catch {
      toast(t.debts.paymentToast.deleteError, 'error')
    }
  }

  return { cicilanPaidDate, setCicilanPaidDate, handlePayCicilan, handleDeletePayment }
}
