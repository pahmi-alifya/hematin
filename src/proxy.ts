import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // `/api/*` dikeluarkan juga — route handler-nya pakai API key AI provider dari header,
    // bukan sesi Supabase, jadi tidak butuh refresh cookie session sama sekali.
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
