'use client'

import { useEffect, useState } from 'react'

/** `true` kalau OS/browser user minta animasi diminimalkan (aksesibilitas). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mql.matches)

    function handleChange(e: MediaQueryListEvent) {
      setReduced(e.matches)
    }
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return reduced
}
