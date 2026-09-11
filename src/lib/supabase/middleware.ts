import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // Supabase belum di-setup (Fase 2 belum full-wired) — jangan sampai app pengguna Guest
  // ikut error hanya karena proxy ini jalan di setiap request.
  if (!url || !anonKey) return response

  // Next.js App Router nge-prefetch tiap <Link> yang keliatan di viewport (BottomNav selalu
  // ada 4) — prefetch tidak butuh sesi ter-refresh (bukan navigasi beneran), jadi skip biar
  // tidak nambah request auth.getUser() percuma tiap kali link masuk viewport.
  if (request.headers.get('next-router-prefetch')) return response

  // Guest murni (belum pernah login sama sekali) tidak punya cookie sesi Supabase — cek dulu
  // sebelum bikin request auth.getUser() yang pasti kosong. Ini yang paling sering kena:
  // mayoritas pengguna HEMATIN adalah Guest (login opsional), jadi tanpa guard ini SETIAP
  // request/prefetch dari pengguna Guest tetap nembak Supabase tanpa hasil.
  const hasSupabaseCookie = request.cookies.getAll().some((c) => c.name.includes('-auth-token'))
  if (!hasSupabaseCookie) return response

  return updateSessionWithSupabase(request, url, anonKey)
}

async function updateSessionWithSupabase(
  request: NextRequest,
  url: string,
  anonKey: string,
): Promise<NextResponse> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // Refresh session kalau expired — wajib dipanggil supaya cookie session ter-update
  await supabase.auth.getUser()

  return response
}
