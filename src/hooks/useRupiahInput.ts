'use client'

import { formatRupiahInput, parseRupiahInput } from '@/lib/utils'

/**
 * Field nominal Rupiah terkontrol - `raw` & `onRawChange` datang dari state manapun
 * (standalone atau bagian dari object form yang lebih besar), hook ini hanya mengurus
 * parsing input mentah dan format tampilan agar tidak ditulis ulang di tiap form.
 */
export function useRupiahInput(raw: number, onRawChange: (raw: number) => void) {
  const display = raw ? formatRupiahInput(raw) : ''

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    onRawChange(parseRupiahInput(e.target.value))
  }

  return { display, onChange }
}
