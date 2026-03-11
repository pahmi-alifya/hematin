import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { ThemeProvider } from '@/components/ui/ThemeToggle'
import { InstallBanner } from '@/components/ui/InstallBanner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const APP_DESCRIPTION =
  'Catat cash flow harianmu, scan struk belanja, dan dapatkan insight AI yang empatik. Data tersimpan aman di perangkatmu, gratis.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://hematin.app'),
  title: {
    default: 'HEMATIN — Asisten Keuangan Harian Berbasis AI',
    template: '%s | HEMATIN',
  },
  description: APP_DESCRIPTION,
  keywords: [
    'aplikasi keuangan pribadi',
    'catat pengeluaran harian',
    'cash flow harian',
    'scan struk belanja',
    'asisten keuangan AI',
    'aplikasi budgeting indonesia',
    'pencatatan keuangan gratis',
  ],
  authors: [{ name: 'HEMATIN' }],
  creator: 'HEMATIN',
  icons: {
    icon: [{ url: '/icons/logo.png', type: 'image/png' }],
    shortcut: '/icons/logo.png',
    apple: '/icons/logo.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'HEMATIN',
    title: 'HEMATIN — Asisten Keuangan Harian Berbasis AI',
    description: APP_DESCRIPTION,
    images: [{ url: '/icons/logo.png', width: 600, height: 600, alt: 'HEMATIN Logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'HEMATIN — Asisten Keuangan Harian Berbasis AI',
    description: APP_DESCRIPTION,
    images: ['/icons/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HEMATIN',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#0EA5E9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/logo.png" />
        {/* Anti-flash: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('hematin-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased bg-sky-50 dark:bg-[#0B1120]">
        <ThemeProvider />
        <ToastProvider />
        {children}
        <InstallBanner />
      </body>
    </html>
  )
}
