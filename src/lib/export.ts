import type { Transaction } from '@/types'
import { getCategoryName } from '@/lib/categories'
import type { Language } from '@/stores/languageStore'

const CSV_TEXT = {
  id: {
    headers: ['Tanggal', 'Tipe', 'Kategori', 'Merchant', 'Catatan', 'Jumlah', 'Sumber'],
    income: 'Pemasukan',
    saving: 'Tabungan',
    expense: 'Pengeluaran',
    scan: 'Scan Struk',
    recurring: 'Transaksi Rutin',
    manual: 'Manual',
    defaultFilename: 'hematin-transaksi.csv',
  },
  en: {
    headers: ['Date', 'Type', 'Category', 'Merchant', 'Notes', 'Amount', 'Source'],
    income: 'Income',
    saving: 'Saving',
    expense: 'Expense',
    scan: 'Receipt Scan',
    recurring: 'Recurring',
    manual: 'Manual',
    defaultFilename: 'hematin-transactions.csv',
  },
}

export function exportTransactionsCSV(transactions: Transaction[], filename?: string, language: Language = 'id'): void {
  const text = CSV_TEXT[language]

  const rows = [...transactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => [
      t.date,
      t.type === 'income' ? text.income : t.type === 'saving' ? text.saving : text.expense,
      getCategoryName(t.category, t.type, language),
      t.merchant ?? '',
      t.notes ?? '',
      t.amount.toString(),
      t.source === 'scan' ? text.scan : t.source === 'recurring' ? text.recurring : text.manual,
    ])

  const csv = [text.headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? text.defaultFilename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
