import { createBrowserClient } from '@supabase/ssr'

// Catatan: tidak pakai generic <Database> di sini — struktur Database manual di
// ./types.ts tidak persis cocok dengan constraint generic supabase-js v2 (butuh
// `supabase gen types` untuk match sempurna). Type-safety tetap dijaga lewat cast
// eksplisit ke Row interface di ./types.ts pada tiap pemanggilan .from(...).

export function isSupabaseConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
