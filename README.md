# HEMATIN

AI daily financial assistant untuk pengguna Indonesia. Catat pemasukan & pengeluaran, scan struk via foto, dan dapatkan insight keuangan harian dari AI. Semua data tersimpan lokal di browser secara default — akun & sinkronisasi cloud bersifat opsional, hanya dibutuhkan kalau mau lanjut di device lain atau berbagi dompet dengan orang lain.

## Fitur

- **Dashboard** — ringkasan bulan ini, cash flow status, AI insight harian, grafik mini 7 hari
- **Transaksi** — input manual, scan struk (AI vision), filter tipe/kategori/urutan lewat satu tombol Filter, recurring transactions
- **Laporan** — cash flow chart 4 bulan, donut chart kategori, net worth tracker
- **Batas Pengeluaran (Goals)** — spending limits per kategori (persisten, berlaku tiap bulan), progress bar, alert otomatis di dashboard
- **Utang & Piutang** — tracking hutang/piutang, support cicilan bulanan, mark as paid
- **Recurring Transactions** — template transaksi berulang, auto-generate tiap bulan
- **Scan Struk** — foto struk → AI baca → form pre-filled otomatis
- **Multi Dompet** — buat beberapa dompet (maks 5), masing-masing dengan data & goals sendiri-sendiri
- **Akun & Sinkronisasi (opsional)** — login untuk backup dompet ke cloud & lanjut di device lain; tetap bisa dipakai penuh sebagai Guest tanpa akun
- **Sharing Dompet** — bagikan dompet ke orang lain lewat key/QR, role Owner/Editor/Viewer, log aktivitas, refresh manual/otomatis
- **PWA** — install ke homescreen, offline-first (semua data di IndexedDB)

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS v4 |
| Animasi | Framer Motion v12 |
| Database lokal | Dexie.js (IndexedDB) — sumber data utama, jalan tanpa backend |
| Backend (opsional) | Supabase (Postgres + Auth + RLS) — untuk akun & sharing dompet |
| Form & Validasi | react-hook-form + zod |
| State | Zustand v5 |
| AI | Multi-provider: Anthropic, OpenAI, Google Gemini |
| Charts | Recharts |
| QR Code | `qrcode` (generate) + BarcodeDetector API (scan) |
| PWA | @ducanh2912/next-pwa v10 |

## Setup

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

> **Catatan:** `npm run dev` menggunakan flag `--webpack` karena Next.js 16 Turbopack tidak kompatibel dengan `@ducanh2912/next-pwa`.

Tanpa langkah tambahan apa pun, app langsung bisa dipakai penuh sebagai **Guest** — semua fitur (kecuali akun & sharing) jalan murni dari IndexedDB.

## Konfigurasi AI

Buka halaman **Settings** di app → masukkan API key dari salah satu provider:

- **Anthropic** — [console.anthropic.com](https://console.anthropic.com)
- **OpenAI** — [platform.openai.com](https://platform.openai.com)
- **Google Gemini** — [aistudio.google.com](https://aistudio.google.com)

API key disimpan lokal di browser (IndexedDB), tidak dikirim ke server selain provider AI yang dipilih (lewat header request ke route handler `/api/insight` & `/api/scan`, diteruskan ke provider — tidak pernah disimpan di server).

## Setup Supabase (Opsional — untuk Akun & Sharing)

Kalau tidak butuh fitur akun/sharing, lewati bagian ini — app tetap jalan normal sebagai Guest.

1. Buat project baru di [supabase.com](https://supabase.com).
2. Salin `.env.local.example` jadi `.env.local`, isi dengan **Project URL** dan **anon key** dari Supabase Dashboard → Settings → API.
3. Jalankan file SQL berikut secara berurutan lewat Supabase SQL Editor:
   - `supabase/schema.sql` — tabel `profiles`, `cloud_wallets`, data anak (transaksi/goals/debts/dst), RLS dasar
   - `supabase/schema-fase3-sharing.sql` — tabel `wallet_members`, `activity_log`, RPC `join_wallet_by_key`/`leave_wallet`, RLS sharing lengkap
4. Restart dev server. Halaman `/login` & `/register` otomatis aktif begitu env var terisi.

File lain di folder `supabase/`:
- `fix-cloud-wallets-recursion.sql` — patch untuk project yang sudah lebih dulu jalan sebelum RLS recursion fix (tidak perlu untuk setup baru)
- `reset-data.sql` — kosongkan semua data cloud untuk testing (akun tetap ada, cuma datanya yang dihapus)

## Struktur Folder

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── transactions/         # Riwayat transaksi
│   ├── reports/              # Laporan & grafik
│   ├── goals/                # Batas pengeluaran
│   ├── debts/                # Utang & piutang
│   ├── recurring/            # Transaksi berulang
│   ├── scan/                 # Scan struk
│   ├── settings/             # Konfigurasi AI, akun, backup/restore
│   ├── wallets/               # Kelola Dompet (CRUD, reorder) + [id]/kelola-akses (sharing)
│   ├── login/, register/     # Halaman auth (opsional, scene dekoratif custom)
│   ├── profile/               # Info akun / guest
│   └── api/
│       ├── insight/          # AI insight proxy
│       ├── scan/              # Receipt scan proxy
│       └── models/            # List model per AI provider
├── components/
│   ├── layout/                # Header, BottomNav, PageWrapper
│   ├── transactions/          # Form, list, item, category picker, filter sheet
│   ├── dashboard/             # Chart & banner komponen
│   ├── reports/                # CashFlowChart, CategoryDonut
│   ├── debts/                  # Kartu & sheet cicilan/hutang-piutang
│   ├── settings/                # Section AI provider, akun, backup/restore
│   ├── auth/                    # AuthProvider, AuthLayout, AuthScene (login/register)
│   ├── wallet/                  # WalletProvider, WalletSwitcher, MemberRoleSelect, QrScanButton
│   └── ui/                      # Button, Card, Input, Badge, Toast, BottomSheet, dll
├── stores/                      # Zustand stores (transaction, wallet, auth, sharedSync, dll)
├── hooks/                       # Custom hooks — tiap page/form kompleks punya hook sendiri
├── lib/
│   ├── db.ts                    # Dexie schema (versioned migrations)
│   ├── sharing.ts                # Generate/join key, kelola member, activity log
│   ├── sync/                     # Lapis 1 (push CRUD) & Lapis 2 (refresh) ke Supabase
│   ├── supabase/                 # client/server helper, types
│   └── ...                       # ai-providers.ts, utils.ts, categories.ts, dll
└── types/                        # TypeScript types
supabase/                         # SQL schema & migration untuk fitur akun/sharing
```

## Build

```bash
npm run build
npm run start
```
