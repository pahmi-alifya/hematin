import type { ComponentType } from 'react'
import { Home, List, BarChart2, Target, CreditCard, Camera, Settings, UserCircle2 } from 'lucide-react'
import type { nav } from '@/lib/i18n/dictionaries/nav'

type NavLabelKey = keyof typeof nav.id

interface NavIconProps {
  className?: string
  strokeWidth?: number
}

interface NavItemConfig {
  href: string
  icon: ComponentType<NavIconProps>
  labelKey: NavLabelKey
}

export const NAV_LEFT_ITEMS: NavItemConfig[] = [
  { href: '/', icon: Home, labelKey: 'home' },
  { href: '/transactions', icon: List, labelKey: 'transactions' },
]

export const NAV_RIGHT_ITEMS: NavItemConfig[] = [
  { href: '/reports', icon: BarChart2, labelKey: 'reports' },
  { href: '/profile', icon: UserCircle2, labelKey: 'profile' },
]

interface FabItemConfig {
  icon: ComponentType<NavIconProps>
  labelKey: NavLabelKey
  color: string
  shadow: string
  href: string
}

/** Radial FAB menu — urutan array = urutan tampil di busur (kiri ke kanan) & animasi stagger saat dibuka. */
export const FAB_ITEMS: FabItemConfig[] = [
  { icon: Camera, labelKey: 'scan', color: '#10B981', shadow: 'rgba(16,185,129,0.45)', href: '/scan' },
  { icon: Target, labelKey: 'goals', color: '#8B5CF6', shadow: 'rgba(139,92,246,0.45)', href: '/goals' },
  { icon: CreditCard, labelKey: 'debts', color: '#F59E0B', shadow: 'rgba(245,158,11,0.45)', href: '/debts' },
  { icon: Settings, labelKey: 'settings', color: '#6366F1', shadow: 'rgba(99,102,241,0.45)', href: '/settings' },
]

// Sudut awal/akhir busur radial (derajat, dari kanan, counter-clockwise = ke atas layar) —
// item didistribusikan rata di antara keduanya sesuai jumlah fabItems yang tampil saat itu
// (lihat BottomNav.tsx), supaya tidak ada celah kalau salah satu item difilter (mis. viewer).
export const FAB_START_ANGLE = 170
export const FAB_END_ANGLE = 10

/** Radius sebaran radial FAB, dalam px. */
export const FAB_RADIUS = 82
