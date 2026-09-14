import type { Step } from "react-joyride";
import {
  Sparkles,
  Wallet,
  PlusCircle,
  Zap,
  CalendarDays,
  Target,
  CreditCard,
  RefreshCw,
  BarChart2,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";

export interface TourStepConfig extends Step {
  /** Halaman yang harus aktif saat step ini ditampilkan — TourController akan navigasi ke sini dulu kalau perlu. */
  route: string;
  icon: LucideIcon;
}

export const TOUR_STEPS: TourStepConfig[] = [
  {
    route: "/",
    target: "body",
    placement: "center",
    icon: Sparkles,
    title: "Selamat datang di HEMATIN 👋",
    content:
      "Yuk kenalan singkat sama fitur-fitur utama HEMATIN sebelum mulai mencatat keuangan harianmu.",
  },
  {
    route: "/",
    target: '[data-tour="wallet-switcher"]',
    icon: Wallet,
    title: "Dompet Aktif",
    content:
      "Semua data (transaksi, Goals, utang) mengikuti dompet yang aktif. Kalau kamu punya lebih dari satu dompet, ganti di sini.",
  },
  {
    route: "/",
    target: '[data-tour="quick-add-transaction"]',
    icon: PlusCircle,
    title: "Catat Transaksi",
    content: "Cara tercepat mencatat pemasukan atau pengeluaran harianmu.",
  },
  {
    route: "/",
    target: '[data-tour="fab-toggle"]',
    icon: Zap,
    title: "Menu Aksi Cepat",
    content:
      "Tombol ini selalu ada di halaman manapun — buka untuk Scan struk, atur Goals, catat Utang, atau ke Pengaturan AI.",
  },
  {
    route: "/transactions",
    target: '[data-tour="month-navigator"]',
    icon: CalendarDays,
    title: "Riwayat per Bulan",
    content: "Geser panah kiri/kanan untuk melihat riwayat transaksi di bulan sebelumnya.",
  },
  {
    route: "/goals",
    target: '[data-tour="goal-add-button"]',
    icon: Target,
    title: "Batas Pengeluaran (Goals)",
    content:
      "Atur batas pengeluaran per kategori. Batas ini berlaku otomatis setiap bulan, tidak perlu diatur ulang.",
  },
  {
    route: "/debts",
    target: '[data-tour="debt-tabs"]',
    icon: CreditCard,
    title: "Utang & Piutang",
    content:
      "Catat utang, piutang, sampai cicilan bertahap di sini — lengkap dengan riwayat pembayarannya.",
  },
  {
    route: "/recurring",
    target: '[data-tour="recurring-info"]',
    icon: RefreshCw,
    title: "Transaksi Berulang",
    content:
      "Buat template untuk transaksi rutin seperti gaji atau tagihan bulanan — akan muncul sebagai pengingat tiap bulan.",
  },
  {
    route: "/reports",
    target: '[data-tour="cashflow-chart"]',
    icon: BarChart2,
    title: "Laporan Keuangan",
    content: "Lihat ringkasan cash flow dan tren keuangan bulananmu di sini.",
  },
  {
    route: "/profile",
    target: '[data-tour="manage-wallet-link"]',
    icon: Wallet,
    title: "Kelola Dompet",
    content: "Buat dompet baru atau bagikan dompet ke orang lain dari sini.",
  },
  {
    route: "/profile",
    target: '[data-tour="tour-replay-button"]',
    placement: "top",
    icon: PartyPopper,
    title: "Tutorial Selesai! 🎉",
    content:
      "Kamu bisa mengulang tutorial ini kapan saja lewat tombol ini, atau cek FAQ di bawah untuk panduan lebih lengkap.",
  },
];
