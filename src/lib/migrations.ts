import { db } from './db'

/**
 * Migrasikan transaksi lama yang tercatat sebagai expense dengan kategori 'savings'
 * ke tipe 'saving' dengan kategori 'tabungan'.
 *
 * Berjalan satu kali saja — flag disimpan di localStorage.
 */
export async function migrateSavingsFromExpense(): Promise<void> {
  const FLAG = 'hematin_migration_saving_v1'
  if (typeof window === 'undefined') return
  if (localStorage.getItem(FLAG)) return

  try {
    await db.transactions
      .where({ type: 'expense', category: 'savings' })
      .modify({ type: 'saving', category: 'tabungan' })

    localStorage.setItem(FLAG, '1')
  } catch (err) {
    console.error('[migration] migrateSavingsFromExpense gagal:', err)
    // Tidak set flag — akan retry di load berikutnya
  }
}
