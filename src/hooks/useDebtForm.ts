'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useDebtStore } from '@/stores/debtStore'
import { useRupiahInput } from './useRupiahInput'
import { toast } from '@/components/ui/Toast'
import { useTranslation } from './useTranslation'

/** Owns seluruh state form tambah hutang/piutang (termasuk field cicilan) + submit. */
export function useDebtForm(defaultType: 'hutang' | 'piutang', onSuccess: () => void) {
  const { addDebt } = useDebtStore()
  const [type, setType] = useState<'hutang' | 'piutang'>(defaultType)
  const [person, setPerson] = useState('')
  const [amountRaw, setAmountRaw] = useState(0)
  const amount = useRupiahInput(amountRaw, setAmountRaw)
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isCicilan, setIsCicilan] = useState(false)
  const [cicilanAmountRaw, setCicilanAmountRaw] = useState(0)
  const cicilanAmount = useRupiahInput(cicilanAmountRaw, setCicilanAmountRaw)
  const [cicilanDay, setCicilanDay] = useState(1)
  const [cicilanStartMonth, setCicilanStartMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(false)
  const t = useTranslation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!person.trim()) {
      toast(t.debts.formToast.nameRequired, 'error')
      return
    }
    if (!amountRaw || amountRaw <= 0) {
      toast(t.debts.formToast.amountRequired, 'error')
      return
    }
    if (isCicilan && (!cicilanAmountRaw || cicilanAmountRaw <= 0)) {
      toast(t.debts.formToast.cicilanAmountRequired, 'error')
      return
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
      toast(t.debts.formToast.success(type), 'success')
      onSuccess()
    } catch {
      toast(t.debts.formToast.error, 'error')
    } finally {
      setLoading(false)
    }
  }

  return {
    type,
    setType,
    person,
    setPerson,
    amount,
    description,
    setDescription,
    dueDate,
    setDueDate,
    isCicilan,
    setIsCicilan,
    cicilanAmount,
    cicilanDay,
    setCicilanDay,
    cicilanStartMonth,
    setCicilanStartMonth,
    loading,
    handleSubmit,
  }
}
