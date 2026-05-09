import type { Transaction } from '@/types'
import { getCategoryName } from '@/lib/categories'

export function exportTransactionsCSV(transactions: Transaction[], filename?: string): void {
  const headers = ['Tanggal', 'Tipe', 'Kategori', 'Merchant', 'Catatan', 'Jumlah', 'Sumber']

  const rows = [...transactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => [
      t.date,
      t.type === 'income' ? 'Pemasukan' : t.type === 'saving' ? 'Tabungan' : 'Pengeluaran',
      getCategoryName(t.category, t.type),
      t.merchant ?? '',
      t.notes ?? '',
      t.amount.toString(),
      t.source === 'scan' ? 'Scan Struk' : t.source === 'recurring' ? 'Transaksi Rutin' : 'Manual',
    ])

  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? 'hematin-transaksi.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
