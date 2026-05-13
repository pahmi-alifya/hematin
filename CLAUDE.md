# HEMATIN — Claude Code Instructions

AI daily financial assistant web app untuk pengguna Indonesia. No backend, no auth — semua data di browser (IndexedDB via Dexie.js).

## Commands

```bash
npm run dev      # Next.js dev dengan --webpack (wajib, lihat note di bawah)
npm run build    # Build production dengan --webpack
npm run start    # Jalankan production build
```

## Critical: Next.js 16 + PWA

Next.js 16 Turbopack **tidak kompatibel** dengan `@ducanh2912/next-pwa`. Selalu gunakan flag `--webpack`:
- `dev`: `next dev --webpack`
- `build`: `next build --webpack`

Jangan hapus flag ini.

## Tech Stack

- **Next.js 16** App Router + TypeScript
- **Tailwind CSS v4** — gunakan `@theme {}` di `globals.css`, **bukan** `tailwind.config.ts`
- **Framer Motion v12** — animasi & micro-interactions
- **Dexie.js** — IndexedDB wrapper, semua data lokal di browser
- **Zustand v5** — state management: `transactionStore`, `settingsStore`, `goalStore`, `debtStore`, `recurringStore`
- **Multi-provider AI** — `@anthropic-ai/sdk`, `openai`, `@google/generative-ai`
- **Recharts** — charts (CashFlowChart, CategoryDonut, NetWorthChart)

## Tailwind v4 Class Rules

| Salah | Benar |
|---|---|
| `flex-shrink-0` | `shrink-0` |
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `tailwind.config.ts` | `globals.css @theme {}` |

## Color Palette

```
Primary:    #0EA5E9  (Sky-500)
Background: #F0F9FF  (Sky-50)
Surface:    #FFFFFF
Border:     #BAE6FD  (Sky-200)
Dark bg:    #0B1120  (page root)
Dark card:  slate-800/60
```

## Dark Mode

- Class-based: `.dark` pada `<html>`
- Tailwind variant: `@variant dark (&:where(.dark, .dark *))` di `globals.css`
- Anti-flash script ada di `layout.tsx` `<head>`
- `suppressHydrationWarning` pada `<html>`
- Pattern dark class: `dark:bg-slate-800/60`, `dark:border-slate-700/60`, `dark:text-slate-100`

## Database (Dexie.js)

File: `src/lib/db.ts` — class `HematinDB extends Dexie`

Schema saat ini (v5):

| Table | Index |
|---|---|
| `transactions` | `id, type, category, date, createdAt` |
| `goals` | `id, category` |
| `insights` | `id, date` |
| `settings` | `id` |
| `debts` | `id, type, status, dueDate, person, createdAt` |
| `recurringTemplates` | `id, type, isActive, recurringDay, createdAt` |
| `debtPayments` | `id, debtId, month, paidDate, createdAt` |

Saat menambah kolom atau index baru: **selalu tambah versi baru** (`this.version(N).stores({...})`), jangan edit versi lama. IndexedDB tidak bisa downgrade.

## Stores (Zustand)

| File | State |
|---|---|
| `transactionStore.ts` | transactions, loadTransactions, addTransaction, updateTransaction, deleteTransaction |
| `settingsStore.ts` | AI provider/model/key, isConfigured |
| `goalStore.ts` | goals (persisten, tanpa month filter), loadGoals, setGoal, deleteGoal |
| `debtStore.ts` | debts, debtPayments, cicilan logic |
| `recurringStore.ts` | templates, auto-generate transaksi bulanan |
| `themeStore.ts` | dark/light mode, persist ke localStorage |

## Struktur Routes

```
src/app/
  page.tsx              — Dashboard
  transactions/         — Riwayat transaksi + month navigator
  reports/              — Laporan bulanan + grafik
  goals/                — Spending limits per kategori (persisten, bukan per bulan)
  debts/                — Utang & piutang + cicilan
  recurring/            — Template transaksi berulang
  scan/                 — Camera/upload + AI receipt parsing
  settings/             — Konfigurasi AI provider
  api/insight/          — Server-side AI insight proxy
  api/scan/             — Server-side receipt scan proxy (vision)
```

## Komponen Penting

### Layout
- `Header` — title + ThemeToggle
- `BottomNav` — navigasi bawah, prop `onFabClick?: () => void`
- `PageWrapper` — padding & max-width wrapper

### TransactionForm
Props: `onSuccess?`, `defaultValues?`

### UI Components
`Button`, `Card`, `Input`, `Textarea`, `Badge`, `Skeleton`, `BottomSheet`, `Toast`, `EmptyState`

Semua sudah support dark mode.

### Toast
```ts
import { toast } from '@/components/ui/Toast'
toast('Pesan sukses', 'success')
toast('Pesan error', 'error')
```

## Goals — Penting

Goals **tidak per bulan** — berlaku setiap bulan secara otomatis. Pengeluaran (`spent`) tetap dihitung per bulan berjalan. Jangan tambahkan `month` filter ke goals query.

## AI Integration

File: `src/lib/ai-providers.ts`

- User menyimpan API key sendiri di Settings (IndexedDB)
- API key dikirim dari client ke route handler (`/api/insight`, `/api/scan`) via request header
- Route handler meneruskan ke provider AI yang dipilih
- Tidak ada API key yang di-hardcode atau disimpan di server

## Konvensi Koding

- Bahasa UI: **Indonesia**
- Format currency: `formatRupiah()` dari `src/lib/utils.ts`
- Format bulan: `getCurrentMonth()` → `"2026-05"` (YYYY-MM)
- ID generation: `generateId()` dari `src/lib/utils.ts`
- Tanggal transaksi: ISO string `"YYYY-MM-DD"`
- Timestamp createdAt: `Date.now()` (milliseconds)
