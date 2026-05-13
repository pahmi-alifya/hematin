# HEMATIN

AI daily financial assistant untuk pengguna Indonesia. Catat pemasukan & pengeluaran, scan struk via foto, dan dapatkan insight keuangan harian dari AI — semuanya berjalan di browser tanpa backend.

## Fitur

- **Dashboard** — ringkasan bulan ini, cash flow status, AI insight harian, grafik mini 7 hari
- **Transaksi** — input manual, scan struk (AI vision), filter bulan & kategori, recurring transactions
- **Laporan** — cash flow chart 4 bulan, donut chart kategori, net worth tracker
- **Batas Pengeluaran** — spending limits per kategori, progress bar, alert otomatis di dashboard
- **Utang & Piutang** — tracking hutang/piutang, support cicilan bulanan, mark as paid
- **Recurring Transactions** — template transaksi berulang, auto-generate tiap bulan
- **Scan Struk** — foto struk → AI baca → form pre-filled otomatis
- **PWA** — install ke homescreen, offline-first (semua data di IndexedDB)

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS v4 |
| Animasi | Framer Motion v12 |
| Database | Dexie.js (IndexedDB — no backend, no auth) |
| State | Zustand v5 |
| AI | Multi-provider: Anthropic, OpenAI, Google Gemini |
| Charts | Recharts |
| PWA | @ducanh2912/next-pwa v10 |

## Setup

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

> **Catatan:** `npm run dev` menggunakan flag `--webpack` karena Next.js 16 Turbopack tidak kompatibel dengan `@ducanh2912/next-pwa`.

## Konfigurasi AI

Buka halaman **Settings** di app → masukkan API key dari salah satu provider:

- **Anthropic** — [console.anthropic.com](https://console.anthropic.com)
- **OpenAI** — [platform.openai.com](https://platform.openai.com)
- **Google Gemini** — [aistudio.google.com](https://aistudio.google.com)

API key disimpan lokal di browser (IndexedDB), tidak dikirim ke server selain provider AI yang dipilih.

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
│   ├── settings/             # Konfigurasi AI
│   └── api/
│       ├── insight/          # AI insight proxy
│       └── scan/             # Receipt scan proxy
├── components/
│   ├── layout/               # Header, BottomNav, PageWrapper
│   ├── transactions/         # Form, list, item, category picker
│   ├── dashboard/            # Chart & banner komponen
│   ├── reports/              # CashFlowChart, CategoryDonut
│   └── ui/                   # Button, Card, Input, Badge, Toast, dll
├── stores/                   # Zustand stores
├── lib/                      # db.ts, ai-providers.ts, utils.ts, categories.ts
└── types/                    # TypeScript types
```

## Build

```bash
npm run build
npm run start
```
