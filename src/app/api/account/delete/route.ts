import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminSupabaseConfigured } from '@/lib/supabase/admin'

interface TransferPair {
  walletId: string
  newOwnerId: string
}

/**
 * Hapus akun permanen. Urutan WAJIB: transfer kepemilikan dompet shared dulu (kalau ada),
 * baru auth.admin.deleteUser() - kalau ada transfer yang gagal, langsung return error
 * SEBELUM deleteUser dipanggil (fail-safe: akun tidak boleh terhapus separuh-jalan).
 */
export async function POST(req: NextRequest) {
  if (!isAdminSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Server belum dikonfigurasi untuk hapus akun (SUPABASE_SERVICE_ROLE_KEY kosong)' },
      { status: 500 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Sesi tidak valid, silakan login ulang' }, { status: 401 })
  }

  let body: { transfers?: TransferPair[] }
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  const transfers = Array.isArray(body.transfers) ? body.transfers : []

  const admin = createAdminClient()

  for (const transfer of transfers) {
    if (!transfer?.walletId || !transfer?.newOwnerId) continue

    const { error } = await admin.rpc('transfer_wallet_ownership', {
      p_wallet_id: transfer.walletId,
      p_caller_id: user.id,
      p_new_owner_id: transfer.newOwnerId,
    })

    if (error) {
      return NextResponse.json(
        { error: `Gagal transfer kepemilikan dompet: ${error.message}` },
        { status: 400 },
      )
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
