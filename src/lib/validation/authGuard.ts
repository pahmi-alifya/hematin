import { EMAIL_PREFIX_BLOCKLIST, EMAIL_PREFIX_HEURISTIC, RESTRICTED_WORDS_ID } from './blocklist'

// Predikat murni dipakai oleh registerSchema (src/lib/validation/schemas.ts)

// 1. Fungsi pembersih dasar (tanpa mengubah angka)
function cleanText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diakritik
}

// 2. Fungsi khusus leetspeak
function applyLeetspeak(input: string): string {
  return input.replace(/[013457]/g, (d) =>
    ({ '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't' }[d]!)
  )
}

export function isEmailPrefixBlocked(email: string): boolean {
  const [prefix = ''] = email.split('@')

  const cleanedPrefix = cleanText(prefix)
  const leetspeakPrefix = applyLeetspeak(cleanedPrefix)

  // Cek heuristic DENGAN angka asli (misal: "test123")
  if (EMAIL_PREFIX_HEURISTIC.test(cleanedPrefix)) return true

  // Cek blocklist dengan versi huruf asli maupun yang sudah di-leetspeak
  return EMAIL_PREFIX_BLOCKLIST.includes(cleanedPrefix) ||
    EMAIL_PREFIX_BLOCKLIST.includes(leetspeakPrefix)
}

export function containsRestrictedWord(text: string): boolean {
  const cleaned = cleanText(text)
  const normalized = applyLeetspeak(cleaned)

  return RESTRICTED_WORDS_ID.some((word) => {
    // Untuk kata-kata pendek (<= 4 huruf, misal: asu, tai), gunakan Exact/Word Boundary Regex
    // untuk menghindari false positive seperti "Basuki" atau "Fasilitas".
    if (word.length <= 4) {
      // \b mencocokkan batas kata (spasi, titik, dll)
      const regex = new RegExp(`\\b${word}\\b`, 'i')
      return regex.test(normalized) || regex.test(cleaned)
    }

    // Untuk kata panjang (misal: bajingan, kontol), .includes() biasanya aman 
    // meskipun tergabung di dalam string (misal: "dasarbajingankamu")
    return normalized.includes(word) || cleaned.includes(word)
  })
}