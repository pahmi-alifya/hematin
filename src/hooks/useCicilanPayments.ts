'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useDebtStore } from '@/stores/debtStore'
import { toast } from '@/components/ui/Toast'
import { getCurrentDate } from '@/lib/utils'
import type { Debt } from '@/types'

/** Owns alur bayar cicilan & hapus riwayat pembayaran. */
export function useCicilanPayments(onPaid?: () => void) {
  const { addPayment, deletePayment } = useDebtStore()
  const [cicilanPaidDate, setCicilanPaidDate] = useState(getCurrentDate())

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
        toast(`Hutang ke ${debt.person} LUNAS! 🎊`, 'success')
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

  return { cicilanPaidDate, setCicilanPaidDate, handlePayCicilan, handleDeletePayment }
}
