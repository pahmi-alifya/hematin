import { db } from '@/lib/db'
import { generateId } from '@/lib/utils'

/**
 * Dompet lokal ini cloud-linked ke `cloudWalletId` yang ternyata BUKAN milik akun yang
 * sedang login (mis. sisa data dari testing multi-akun di browser yang sama — lihat
 * `reclaimMismatchedWallets` di accountSync.ts). RLS `wallet_members_owner_write` benar
 * menolak klaim ownership untuk kasus ini (error 42501), jadi tidak ada perbaikan di sisi
 * cloud yang bisa dilakukan untuk id lama tsb.
 *
 * Satu-satunya jalan aman: lepas link cloud lama dan pindahkan seluruh data dompet ini ke
 * id lokal BARU, supaya `uploadUnlinkedWallets` bisa upload ulang sebagai dompet baru milik
 * akun yang sedang login (tanpa bentrok primary key dengan row cloud_wallets lama).
 */
export async function forkWalletForReclaim(oldId: string): Promise<string | null> {
  return db.transaction(
    'rw',
    [db.wallets, db.transactions, db.goals, db.insights, db.debts, db.debtPayments, db.recurringTemplates],
    async () => {
      const wallet = await db.wallets.get(oldId)
      if (!wallet) return null
      const newId = generateId()

      // `id` (primary key) tiap record TIDAK berubah — cuma field `walletId`-nya. Jadi cukup
      // update in-place via .modify(), jangan bulkPut+bulkDelete pakai id yang sama (itu
      // akan langsung menghapus lagi record yang baru saja dipindah).
      await db.transactions.where('walletId').equals(oldId).modify({ walletId: newId })
      await db.goals.where('walletId').equals(oldId).modify({ walletId: newId })
      await db.insights.where('walletId').equals(oldId).modify({ walletId: newId })
      await db.debts.where('walletId').equals(oldId).modify({ walletId: newId })
      await db.debtPayments.where('walletId').equals(oldId).modify({ walletId: newId })
      await db.recurringTemplates.where('walletId').equals(oldId).modify({ walletId: newId })

      await db.wallets.add({
        ...wallet,
        id: newId,
        cloudWalletId: undefined,
        ownerRole: undefined,
        isShared: false,
      })
      await db.wallets.delete(oldId)

      return newId
    },
  )
}
