export const MAX_WALLETS = 5

export const WALLET_ICONS = [
  '👛', '💼', '🏠', '🏢', '🍽️', '🎓', '✈️', '🚗', '💰', '🎯', '🛒', '❤️',
]

export const WALLET_COLORS = [
  '#0EA5E9', // sky
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#6366F1', // indigo
]

/** Label Indonesia role dompet — dipakai di halaman Kelola Dompet & Kelola Akses. */
export const WALLET_ROLE_LABEL: Record<'owner' | 'editor' | 'viewer', string> = {
  owner: 'Pemilik',
  editor: 'Editor',
  viewer: 'Viewer',
}

/**
 * Warna semantik income/expense/saving dipakai di semua chart dashboard & laporan.
 * `emphasis` = shade lebih gelap untuk highlight "hari ini" di MonthlyChart.
 */
export const TYPE_COLORS = {
  income: { base: '#10B981', muted: '#6EE7B7', emphasis: '#059669' },
  expense: { base: '#EF4444', muted: '#FCA5A5', emphasis: '#DC2626' },
  saving: { base: '#14B8A6', muted: '#99F6E4', emphasis: '#0F766E' },
} as const

export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
}

export const SCAN_TIPS = [
  'Pastikan pencahayaan cukup',
  'Foto seluruh struk, termasuk total',
  'Hindari bayangan atau lipatan',
  'Foto tegak lurus, tidak miring',
]
