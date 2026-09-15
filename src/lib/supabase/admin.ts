import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// PERINGATAN: client ini pakai service_role key — bypass SEMUA RLS. Hanya boleh
// diimpor dari route handler server (`src/app/api/**/route.ts`), TIDAK PERNAH dari
// komponen client atau kode yang bisa ikut ter-bundle ke browser. Jangan tambahkan
// `'use client'` di file manapun yang mengimpor ini.

export function isAdminSupabaseConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
}

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
