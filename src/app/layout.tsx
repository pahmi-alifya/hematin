import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ui/ThemeToggle";
import { InstallBanner } from "@/components/ui/InstallBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const APP_NAME = "HEMATIN";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hematin.vercel.app";

const APP_DESCRIPTION =
  "Catat pengeluaran & pemasukan harian, scan struk belanja dengan AI, dan dapatkan insight keuangan otomatis. Gratis, tanpa akun — data aman di perangkatmu.";

const APP_TITLE = "HEMATIN — Aplikasi Catatan Keuangan Harian Berbasis AI";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_TITLE,
    template: "%s | HEMATIN",
  },
  description: APP_DESCRIPTION,
  keywords: [
    // brand
    "hematin",
    "hematin app",
    "hematin keuangan",
    // primary intent
    "aplikasi catatan keuangan harian",
    "aplikasi pencatat pengeluaran harian",
    "catat pengeluaran harian",
    "catat pemasukan dan pengeluaran",
    "pencatat transaksi harian",
    "lacak pengeluaran harian",
    // AI angle
    "asisten keuangan AI",
    "insight keuangan AI",
    "scan struk belanja otomatis",
    "scan struk AI",
    // category & audience
    "aplikasi keuangan pribadi Indonesia",
    "aplikasi budgeting Indonesia",
    "manajemen keuangan harian",
    "keuangan pribadi gratis",
    "aplikasi keuangan tanpa login",
    "catatan keuangan offline",
    "cash flow harian",
    "laporan keuangan bulanan",
  ],
  verification: { google: "ad5ddca25974693b" },
  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  category: "finance",
  icons: {
    icon: [{ url: "/icons/logo.png", type: "image/png" }],
    shortcut: "/icons/logo.png",
    apple: "/icons/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: APP_NAME,
    url: APP_URL,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/icons/logo.png",
        width: 600,
        height: 600,
        alt: "HEMATIN — Aplikasi Catatan Keuangan Harian Berbasis AI",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: ["/icons/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
  alternates: {
    canonical: APP_URL,
    languages: { "id-ID": APP_URL },
  },
};

export const viewport: Viewport = {
  themeColor: "#0EA5E9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/logo.png" />
        {/* Anti-flash: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('hematin-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: APP_NAME,
              alternateName: ["Hematin App", "Hematin Keuangan"],
              url: APP_URL,
              description: APP_DESCRIPTION,
              applicationCategory: "FinanceApplication",
              applicationSubCategory: "Personal Finance",
              operatingSystem: "Web, Android, iOS",
              browserRequirements: "Requires JavaScript",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "IDR",
                availability: "https://schema.org/InStock",
              },
              inLanguage: "id-ID",
              isAccessibleForFree: true,
              author: {
                "@type": "Organization",
                name: APP_NAME,
                url: APP_URL,
              },
              featureList: [
                "Catat pemasukan dan pengeluaran harian",
                "Scan struk belanja otomatis dengan AI vision",
                "Insight keuangan harian berbasis AI",
                "Laporan keuangan bulanan otomatis",
                "Grafik cash flow dan kategori pengeluaran",
                "Pengelolaan batas anggaran per kategori",
                "Tidak perlu akun atau login",
                "Data tersimpan aman di perangkat (offline-first)",
                "Tersedia sebagai Progressive Web App (PWA)",
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased bg-sky-50 dark:bg-[#0B1120]">
        <ThemeProvider />
        <ToastProvider />
        {children}
        <InstallBanner />
        <Analytics />
      </body>
    </html>
  );
}
