# HEMATIN — Planning Dokumen
> AI Daily Financial Assistant untuk pengguna Indonesia

---

## Daftar Isi
1. [Visi & Misi](#1-visi--misi)
2. [Tech Stack](#2-tech-stack)
3. [Fitur & Scope MVP](#3-fitur--scope-mvp)
4. [Arsitektur & Struktur Folder](#4-arsitektur--struktur-folder)
5. [Database Schema (IndexedDB)](#5-database-schema-indexeddb)
6. [AI Integration](#6-ai-integration)
7. [UI/UX Design System](#7-uiux-design-system)
8. [Halaman & Komponen](#8-halaman--komponen)
9. [User Flow](#9-user-flow)
10. [PWA Configuration](#10-pwa-configuration)
11. [Roadmap Pengembangan](#12-roadmap-pengembangan)
13. [SEO Strategy](#13-seo-strategy)
14. [Monetization Roadmap](#14-monetization-roadmap)
15. [Fitur Utang Piutang](#15-fitur-utang-piutang)
16. [Cloud Storage Migration Plan](#16-cloud-storage-migration-plan)
17. [Fitur Recurring Transactions](#17-fitur-recurring-transactions)
18. [Tipe Transaksi: Saving (Tabungan & Investasi)](#18-tipe-transaksi-saving-tabungan--investasi)

---

## 1. Visi & Misi

### Visi
HEMATIN hadir sebagai teman keuangan harian yang membantu pengguna membuat keputusan kecil yang lebih baik setiap hari — bukan sebagai akuntan atau financial advisor.

### Misi
- Membuat pencatatan keuangan semudah dan secepat mungkin
- Memberikan insight AI yang empatik, bukan menghakimi
- Membantu pengguna memahami pola pengeluaran mereka
- Mengurangi stres finansial dengan pendekatan yang supportif

### Prinsip Desain
- **Simple over complex** — fitur yang sedikit tapi sangat berguna
- **Mobile-first** — mayoritas input dilakukan dari HP
- **Frictionless** — input transaksi harus bisa dalam < 10 detik
- **Trustworthy** — desain harus terasa aman dan meyakinkan

---

## 2. Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Framework | Next.js 14+ (App Router) | Full-stack, SSR/CSR fleksibel, routing modern |
| Language | TypeScript | Type safety, lebih mudah maintain |
| Styling | Tailwind CSS v4 | Utility-first, konsisten, cepat |
| Animation | Framer Motion | Smooth transition & micro-interaction |
| Database | Dexie.js (IndexedDB wrapper) | Ergonomis, offline-first, tanpa server |
| State | Zustand | Ringan, simple, cocok untuk client state |
| Charts | Recharts | Composable, ringan, support responsive |
| AI (Multi-provider) | Anthropic SDK + OpenAI SDK + Fetch | User bawa API key sendiri, pilih provider & model |
| Icons | Lucide React | Clean, konsisten, tree-shakeable |
| Fonts | Inter + Plus Jakarta Sans | Modern, readable, profesional |
| Date | date-fns | Ringan, tree-shakeable |
| Validation | Zod | Schema validation untuk form & API |
| Image Compress | browser-image-compression | Kompres foto struk sebelum kirim ke API |
| PWA | next-pwa | Install ke homescreen, offline support |

---

## 3. Fitur & Scope MVP

### Core Features

#### 📊 Dashboard
- Ringkasan bulan ini: total income, total expense, saldo estimasi
- Status cash flow: **Aman** / **Waspada** / **Perlu Hati-hati**
- AI Insight harian (auto-generate saat buka dashboard)
- Grafik mini: pemasukan vs pengeluaran 7 hari terakhir
- Quick actions: tombol tambah transaksi, scan struk

#### ➕ Input Transaksi
- **Manual Input**: form sederhana (nominal, kategori, tanggal, catatan)
- **Scan Struk (Receipt Scanner)**:
  - Ambil foto via kamera (mobile-native)
  - Upload gambar dari galeri / file manager
  - Preview gambar + konfirmasi
  - AI baca struk → form pre-filled otomatis
  - User bisa edit sebelum simpan
- **Quick Input**: bottom sheet tap-to-add yang muncul dari tombol floating

#### 📋 Riwayat Transaksi
- List semua transaksi dengan filter bulan
- Filter per kategori
- Search by nama / catatan
- Swipe-to-delete (mobile gesture)
- Tap untuk edit detail

#### 📈 Laporan & Analitik
- Grafik cash flow bulanan (bar chart)
- Breakdown pengeluaran per kategori (donut chart)
- Tren pengeluaran: naik / stabil / turun
- Perbandingan bulan ini vs bulan lalu

#### 🎯 Goals
- Set target pengeluaran per kategori (budget)
- Progress bar per kategori
- Notifikasi (UI) jika mendekati atau melebihi budget

#### ⚙️ Settings & Konfigurasi AI
- Input API Key (disimpan lokal di IndexedDB, tidak pernah dikirim ke server kami)
- Pilih AI Provider: Anthropic / OpenAI / Google Gemini
- Pilih model sesuai provider yang dipilih
- Tombol "Test Koneksi" untuk validasi API key
- Info: "API key kamu aman, hanya tersimpan di perangkat ini"
- Reset / hapus API key

#### 📲 PWA (Progressive Web App)
- Bisa diinstall ke homescreen (Android & iOS)
- Bisa dibuka fullscreen seperti app native
- Offline mode: input transaksi tetap bisa walau tidak ada internet
- Theme color biru langit di status bar

### Fitur yang TIDAK ada di MVP
- Auth / Login (no backend)
- Multi-user / sharing
- Export PDF/Excel (post-MVP)
- Push notification (post-MVP)
- Sync cloud (post-MVP)

---

## 4. Arsitektur & Struktur Folder

```
hematin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (font, theme, provider)
│   │   ├── page.tsx                  # Dashboard (/)
│   │   ├── transactions/
│   │   │   ├── page.tsx              # Riwayat transaksi
│   │   │   └── new/
│   │   │       └── page.tsx          # Form tambah transaksi
│   │   ├── scan/
│   │   │   └── page.tsx              # Receipt scanner
│   │   ├── reports/
│   │   │   └── page.tsx              # Laporan & grafik
│   │   ├── goals/
│   │   │   └── page.tsx              # Goals & budget
│   │   ├── settings/
│   │   │   └── page.tsx              # Pengaturan AI (provider, model, API key)
│   │   └── api/
│   │       ├── insight/
│   │       │   └── route.ts          # Endpoint: AI daily insight (pakai key dari request)
│   │       └── scan/
│   │           └── route.ts          # Endpoint: AI receipt scanner (pakai key dari request)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx         # Navigasi bawah (mobile)
│   │   │   ├── Header.tsx            # Header per halaman
│   │   │   └── PageWrapper.tsx       # Wrapper dengan padding & safe area
│   │   │
│   │   ├── dashboard/
│   │   │   ├── SummaryCard.tsx       # Card income/expense/balance
│   │   │   ├── CashFlowStatus.tsx    # Badge status (Aman/Waspada/dll)
│   │   │   ├── AIInsightCard.tsx     # Card AI insight harian
│   │   │   ├── MiniChart.tsx         # Grafik 7 hari mini
│   │   │   └── QuickActions.tsx      # Tombol quick add
│   │   │
│   │   ├── transactions/
│   │   │   ├── TransactionList.tsx   # List transaksi
│   │   │   ├── TransactionItem.tsx   # Item satu transaksi
│   │   │   ├── TransactionForm.tsx   # Form manual input
│   │   │   ├── CategoryPicker.tsx    # Pilih kategori
│   │   │   └── FilterBar.tsx         # Filter bulan/kategori
│   │   │
│   │   ├── scanner/
│   │   │   ├── ReceiptScanner.tsx    # Kamera + upload interface
│   │   │   ├── ReceiptPreview.tsx    # Preview foto + button scan
│   │   │   ├── ReceiptConfirm.tsx    # Form konfirmasi hasil scan
│   │   │   └── ScanLoading.tsx       # Loading state saat AI baca
│   │   │
│   │   ├── reports/
│   │   │   ├── CashFlowChart.tsx     # Bar chart bulanan
│   │   │   ├── CategoryDonut.tsx     # Donut chart kategori
│   │   │   └── TrendBadge.tsx        # Badge tren naik/turun
│   │   │
│   │   ├── goals/
│   │   │   ├── GoalCard.tsx          # Card satu goal/budget
│   │   │   ├── GoalForm.tsx          # Form tambah goal
│   │   │   └── ProgressBar.tsx       # Progress visual
│   │   │
│   │   ├── settings/
│   │   │   ├── AIProviderPicker.tsx  # Pilih provider (Anthropic/OpenAI/Gemini)
│   │   │   ├── ModelPicker.tsx       # Pilih model sesuai provider
│   │   │   ├── APIKeyInput.tsx       # Input API key dengan toggle show/hide
│   │   │   └── ConnectionTest.tsx    # Tombol test + hasil validasi
│   │   │
│   │   └── ui/                       # Reusable UI primitives
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── BottomSheet.tsx
│   │       ├── Badge.tsx
│   │       ├── Skeleton.tsx          # Loading skeleton
│   │       ├── EmptyState.tsx
│   │       └── Toast.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                     # Dexie.js setup & queries
│   │   ├── ai-insight.ts             # AI insight: dispatch ke provider yang dipilih
│   │   ├── ai-scanner.ts             # AI scanner: dispatch ke provider yang dipilih
│   │   ├── ai-providers.ts           # Konfigurasi provider: models, endpoints, format
│   │   ├── calculations.ts           # Hitung income, expense, balance
│   │   ├── categories.ts             # Daftar kategori & icon
│   │   └── utils.ts                  # Format currency, date, dll
│   │
│   ├── stores/
│   │   ├── transactionStore.ts       # Zustand: state transaksi
│   │   ├── settingsStore.ts          # Zustand: state AI config (provider, model, key)
│   │   └── insightStore.ts           # Zustand: state AI insight (cache)
│   │
│   └── types/
│       └── index.ts                  # TypeScript types & interfaces
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service Worker (generate by next-pwa)
│   └── icons/                        # App icons: 192x192, 512x512, maskable
│
├── PLANNING.md                       # Dokumen ini
├── .env.local                        # (kosong — API key disimpan di IndexedDB user)
├── next.config.ts                    # Include next-pwa config
├── tailwind.config.ts
└── package.json
```

---

## 5. Database Schema (IndexedDB)

### Tabel: `transactions`

```typescript
interface Transaction {
  id: string               // UUID
  type: 'income' | 'expense'
  amount: number           // dalam Rupiah (integer)
  category: string         // e.g. "Makanan", "Transport"
  merchant?: string        // nama toko (dari scan struk)
  notes?: string           // catatan tambahan
  date: string             // ISO date: "2026-02-26"
  createdAt: number        // timestamp
  source: 'manual' | 'scan'  // cara input
  receiptImage?: string    // base64 atau blob URL (opsional)
}
```

### Tabel: `goals`

```typescript
interface Goal {
  id: string
  category: string         // kategori yang di-budget
  limitAmount: number      // batas pengeluaran per bulan
  month: string            // "2026-02" (year-month)
  createdAt: number
}
```

### Tabel: `insights`

```typescript
interface InsightCache {
  id: string               // "insight-2026-02-26" (per hari)
  date: string             // tanggal
  content: string          // teks hasil AI
  generatedAt: number      // timestamp
}
```

### Tabel: `settings`

```typescript
interface AISettings {
  id: 'ai-config'          // selalu satu record
  provider: 'anthropic' | 'openai' | 'gemini'
  model: string            // e.g. "claude-sonnet-4-6", "gpt-4o", "gemini-1.5-pro"
  apiKey: string           // API key user (tersimpan lokal, TIDAK dikirim ke server kita)
  isConfigured: boolean    // sudah setup atau belum
  updatedAt: number
}
```

> **Keamanan API Key:**
> API key disimpan di IndexedDB browser pengguna sendiri.
> Key dikirim langsung dari browser ke API provider (Anthropic/OpenAI/Gemini) melalui server-side proxy route.
> Server HEMATIN tidak menyimpan atau merekam API key apapun.

---

## 6. AI Integration

### 6.1 Provider yang Didukung

| Provider | Models yang Tersedia |
|----------|---------------------|
| **Anthropic** | claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5 |
| **OpenAI** | gpt-4o, gpt-4o-mini, gpt-4-turbo |
| **Google Gemini** | gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash |

> Catatan: Scan struk (vision) membutuhkan model yang support multimodal.
> Semua model di atas mendukung vision/image input.

---

### 6.2 Arsitektur AI Flow

```
User buka app (belum setup AI)
        ↓
Tampilkan banner: "Setup AI untuk mengaktifkan insight"
        ↓
User ke Settings → input API Key → pilih Provider → pilih Model
        ↓
Tap [Test Koneksi] → validasi key dengan request kecil
        ↓
Sukses → simpan ke IndexedDB → AI aktif

─────────────────────────────────────────

Request AI (insight / scan):
  1. Baca settings dari IndexedDB (provider + model + apiKey)
  2. Kirim ke API route (/api/insight atau /api/scan)
     dengan header: X-AI-Provider, X-AI-Model, X-AI-Key
  3. Server route dispatch ke provider yang sesuai
  4. Return hasil ke client
```

**File: `src/lib/ai-providers.ts`**
```typescript
// Konfigurasi semua provider
export const AI_PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Recommended)', vision: true },
      { id: 'claude-opus-4-6',   name: 'Claude Opus 4.6 (Paling cerdas)', vision: true },
      { id: 'claude-haiku-4-5',  name: 'Claude Haiku 4.5 (Paling cepat)', vision: true },
    ],
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-api03-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o',      name: 'GPT-4o (Recommended)', vision: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Lebih hemat)', vision: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', vision: true },
    ],
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  gemini: {
    name: 'Google Gemini',
    models: [
      { id: 'gemini-1.5-pro',   name: 'Gemini 1.5 Pro (Recommended)', vision: true },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Lebih cepat)', vision: true },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Terbaru)', vision: true },
    ],
    keyPrefix: 'AIza',
    keyPlaceholder: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
}
```

---

### 6.3 API Routes (Server-side Proxy)

**Kenapa pakai server proxy, bukan langsung dari browser?**
- Lebih aman: key tidak terekspos di network tab browser secara langsung
- Bisa tambah rate limiting atau validasi di masa depan
- CORS tidak jadi masalah

**File: `src/app/api/insight/route.ts`**
```typescript
// POST /api/insight
// Headers: X-AI-Provider, X-AI-Model, X-AI-Key
// Body: { financialData: FinancialContext }
//
// Dispatch berdasarkan provider:
// - anthropic → @anthropic-ai/sdk
// - openai    → openai SDK
// - gemini    → @google/generative-ai SDK
//
// Return: { insight: string } atau stream
```

**File: `src/app/api/scan/route.ts`**
```typescript
// POST /api/scan
// Headers: X-AI-Provider, X-AI-Model, X-AI-Key
// Body: { image: string } (base64)
//
// Return: { merchant, date, total, category, notes, confidence }
```

---

### 6.4 Daily Insight

**Trigger:** Setiap kali dashboard dibuka, cek cache insight hari ini.
- Ada → tampilkan dari cache (IndexedDB)
- Belum ada & AI sudah dikonfigurasi → generate baru → simpan cache
- AI belum dikonfigurasi → tampilkan banner setup

**Data yang dikirim ke AI:**

```typescript
{
  total_income: number,
  total_expense: number,
  cash_flow_status: 'positive' | 'neutral' | 'negative',
  balance: number,
  top_category: string,
  trend: 'increasing' | 'stable' | 'decreasing',
  income_today: number,
  expense_today: number,
  categories_today: string[],
  consistency_level: 'good' | 'medium' | 'low'
}
```

**Output:** Teks insight format HEMATIN (📌💡✅🔮🌱), max 120 kata

---

### 6.5 Receipt Scanner (Struk OCR)

**Flow:**
1. User upload/foto struk
2. Kompres gambar (max 1MB) dengan `browser-image-compression`
3. Convert ke base64 → kirim ke `/api/scan`
4. AI baca gambar, ekstrak data
5. Return JSON → pre-fill form konfirmasi

**Prompt Vision (sama untuk semua provider):**
```
Kamu adalah asisten pembaca struk belanja Indonesia.
Baca gambar struk ini dan ekstrak informasi berikut.

Kembalikan HANYA JSON:
{
  "merchant": "nama toko",
  "date": "YYYY-MM-DD",
  "total": 45000,
  "category": "Makanan|Transport|Belanja|Kesehatan|Hiburan|Tagihan|Pendidikan|Lainnya",
  "notes": "ringkasan item (max 50 karakter)",
  "confidence": "high|medium|low"
}

Jika field tidak terbaca, isi null.
Jika bukan struk, kembalikan { "error": "Bukan struk" }.
```

---

### 6.6 Halaman Settings AI

```
┌─────────────────────────────────────┐
│  ← Pengaturan AI                    │
├─────────────────────────────────────┤
│                                     │
│  🤖 Konfigurasi AI HEMATIN          │
│                                     │
│  API key kamu aman — hanya          │
│  tersimpan di perangkat ini.        │
│                                     │
│  ── Pilih Provider ──               │
│  ┌──────────┐ ┌───────┐ ┌────────┐  │
│  │Anthropic │ │OpenAI │ │Gemini  │  │  ← Pill selector
│  │ (active) │ │       │ │        │  │
│  └──────────┘ └───────┘ └────────┘  │
│                                     │
│  ── Pilih Model ──                  │
│  [Claude Sonnet 4.6 (Recommended)▼] │
│                                     │
│  ── API Key ──                      │
│  [sk-ant-api03-...          👁️ ]    │
│  Dapatkan API key di [console.      │
│  anthropic.com] →                   │
│                                     │
│  [     Test Koneksi     ]           │
│  ✅ Koneksi berhasil!               │
│                                     │
│  [     Simpan Pengaturan   ]        │
│                                     │
│  ── Berbahaya ──                    │
│  [  Hapus API Key  ]  (merah)       │
│                                     │
└─────────────────────────────────────┘
```

---

## 7. UI/UX Design System

### 7.1 Color Palette

```
Primary:        #0EA5E9  (Sky-500)    — warna utama brand (biru langit)
Primary Light:  #38BDF8  (Sky-400)    — gradient, highlight
Primary Dark:   #0284C7  (Sky-600)    — hover state, pressed
Primary Subtle: #E0F2FE  (Sky-100)    — background badge, chip
Primary Ghost:  #F0F9FF  (Sky-50)     — hover ghost button

Accent:      #10B981  (Emerald-500)  — income, positif, sukses
Danger:      #EF4444  (Red-500)      — expense, negatif, warning
Warning:     #F59E0B  (Amber-500)    — waspada, perhatian

Background:  #F0F9FF  (Sky-50)       — halaman utama (nuansa langit tipis)
Surface:     #FFFFFF                  — card, modal
Surface Alt: #F1F5F9  (Slate-100)    — input, secondary card

Text Primary:   #0C1A25  (custom)    — hampir hitam, sedikit biru
Text Secondary: #64748B  (Slate-500)
Text Muted:     #94A3B8  (Slate-400)

Border:      #BAE6FD  (Sky-200)      — border tipis berwarna langit
Border Alt:  #E2E8F0  (Slate-200)    — border netral
```

**Penggunaan Gradient:**
```
Hero Card:   linear-gradient(135deg, #0EA5E9 0%, #38BDF8 50%, #7DD3FC 100%)
Header BG:   linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)
FAB Button:  linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)
```

### 7.2 Typography

```
Font Heading:  Plus Jakarta Sans  — bold, modern
Font Body:     Inter              — bersih, readable

Scale:
  xs:    12px  — label kecil, badge
  sm:    14px  — body secondary, caption
  base:  16px  — body utama
  lg:    18px  — subheading
  xl:    20px  — heading section
  2xl:   24px  — heading halaman
  3xl:   30px  — angka besar (nominal)
  4xl:   36px  — hero nominal di dashboard
```

### 7.3 Spacing & Radius

```
Spacing: 4px base unit (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)

Border Radius:
  sm:   8px   — button kecil, badge
  md:   12px  — card, input
  lg:   16px  — modal, bottom sheet
  xl:   20px  — card besar
  full: 9999px — pill badge, avatar
```

### 7.4 Shadow

```
sm:   0 1px 3px rgba(0,0,0,0.06)          — card subtle
md:   0 4px 12px rgba(0,0,0,0.08)         — card hover, dropdown
lg:   0 8px 24px rgba(0,0,0,0.10)         — modal, bottom sheet
glow: 0 0 20px rgba(14,165,233,0.20)      — primary element focus (sky blue)
sky:  0 4px 24px rgba(14,165,233,0.15)    — hero card, FAB button
```

### 7.5 Animation & Motion

```
Duration:
  fast:    150ms  — hover, badge
  normal:  250ms  — slide, fade
  slow:    400ms  — page transition, modal

Easing:
  default:    cubic-bezier(0.4, 0, 0.2, 1)  — smooth
  bounce:     cubic-bezier(0.34, 1.56, 0.64, 1)  — bottom sheet up
  decelerate: cubic-bezier(0, 0, 0.2, 1)    — masuk layar
  accelerate: cubic-bezier(0.4, 0, 1, 1)    — keluar layar

Motion Principles:
  - Page masuk: slide up + fade in (250ms)
  - Card muncul: fade in + scale 0.97→1 (200ms)
  - Bottom sheet: slide up dengan bounce (400ms)
  - Modal: fade backdrop + scale in card (250ms)
  - Number update: animate angka (spring)
  - Skeleton: shimmer kiri ke kanan
  - Tombol: scale 0.97 saat press (100ms)
```

### 7.6 Komponen UI

#### Card
```
- Background: white
- Padding: 20px
- Border radius: 16px
- Shadow: sm (default), md (hover)
- Transition: shadow 200ms
```

#### Button
```
Primary:   bg-sky-500, text-white, hover:bg-sky-600
Secondary: bg-slate-100, text-slate-700, hover:bg-slate-200
Danger:    bg-red-50, text-red-600, hover:bg-red-100
Ghost:     bg-transparent, text-sky-600, hover:bg-sky-50

Size:
  sm:  height 36px, px-3, text-sm
  md:  height 44px, px-4, text-base  ← default (touch-friendly)
  lg:  height 52px, px-6, text-lg

Active state: scale(0.97) transform
Loading state: spinner icon + disabled
```

#### Bottom Navigation
```
- Fixed bottom, height: 64px + safe area
- Background: white dengan top border sky-100
- 4 tab: Dashboard, Transaksi, Laporan, Goals
- Active: icon + label berwarna sky-500, indicator dot sky-500
- Inactive: icon + label slate-400
- Floating action button (+): gradient sky-500→sky-600, shadow sky glow
```

#### Bottom Sheet
```
- Muncul dari bawah dengan spring animation
- Backdrop blur + overlay
- Drag handle di atas
- Bisa di-dismiss dengan swipe down atau tap backdrop
```

---

## 8. Halaman & Komponen

### 8.1 Dashboard (`/`)

```
┌─────────────────────────────────────┐
│  HEMATIN          Feb 2026    [⚙️]   │  ← Header
├─────────────────────────────────────┤
│  Hai! 👋 Berikut kondisi keuanganmu  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Saldo Estimasi             │    │
│  │  Rp 2.450.000               │    │  ← Hero Card
│  │  🟢 Kondisi Aman             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌──────────┐  ┌──────────────┐     │
│  │ Pemasukan│  │ Pengeluaran  │     │  ← Summary Cards
│  │ Rp 5 Jt  │  │ Rp 2.5 Jt   │     │
│  └──────────┘  └──────────────┘     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 📊 7 Hari Terakhir          │    │  ← Mini Chart
│  │ [bar chart mini]            │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🤖 HEMATIN bilang:          │    │  ← AI Insight Card
│  │ 📌 Kondisi Hari Ini         │    │
│  │ ...                         │    │
│  │ [Baca Selengkapnya]         │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌──────┐  ┌─────────────────┐      │
│  │ ✏️ +  │  │ 📷 Scan Struk   │      │  ← Quick Actions
│  └──────┘  └─────────────────┘      │
├─────────────────────────────────────┤
│  [🏠] [📋] [📈] [🎯]                 │  ← Bottom Nav
└─────────────────────────────────────┘
```

### 8.2 Receipt Scanner (`/scan`)

```
┌─────────────────────────────────────┐
│  ← Scan Struk                       │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │   [Area preview kamera /    │    │
│  │    foto yang sudah dipilih] │    │
│  │                             │    │
│  │   Pastikan struk terlihat   │    │
│  │   jelas dan tidak buram     │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌────────────┐ ┌────────────────┐  │
│  │ 📁 Upload  │ │ 📷 Kamera      │  │
│  └────────────┘ └────────────────┘  │
│                                     │
│  ── atau ──                         │
│                                     │
│  [     Baca Struk Sekarang     ]    │  ← disabled jika belum ada foto
│                                     │
│  ─────── Loading State ─────────    │
│  ⏳ HEMATIN sedang membaca struk... │
│  [progress indicator]               │
│                                     │
├─────────────────────────────────────┤
│  [🏠] [📋] [📈] [🎯]                 │
└─────────────────────────────────────┘
```

### 8.3 Konfirmasi Scan

```
┌─────────────────────────────────────┐
│  ← Konfirmasi Transaksi             │
├─────────────────────────────────────┤
│                                     │
│  ✅ Struk berhasil dibaca!           │
│                                     │
│  [Thumbnail foto struk kecil]       │
│                                     │
│  Cek dan sesuaikan jika perlu:      │
│                                     │
│  Tipe          [Pengeluaran ▼]      │
│  Merchant      [Indomaret       ]   │
│  Jumlah        [Rp 45.000       ]   │
│  Kategori      [🛒 Belanja       ▼] │
│  Tanggal       [26 Feb 2026     ]   │
│  Catatan       [Minyak, Sabun...   ]│
│                                     │
│  [     Simpan Transaksi       ]     │
│  [     Input Ulang            ]     │
│                                     │
└─────────────────────────────────────┘
```

### 8.4 Riwayat Transaksi (`/transactions`)

```
┌─────────────────────────────────────┐
│  Transaksi          [🔍] [Filter]   │
├─────────────────────────────────────┤
│  [Feb 2026 ▼]  [Semua Kategori ▼]  │
├─────────────────────────────────────┤
│  Hari ini, 26 Feb                   │
│  ┌─────────────────────────────┐    │
│  │ 🛒  Indomaret               │    │
│  │     Belanja · 10:30         │    │
│  │                  -Rp 45.000 │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 🍜  Warteg Bu Sari          │    │
│  │     Makanan · 13:00         │    │
│  │                  -Rp 18.000 │    │
│  └─────────────────────────────┘    │
│                                     │
│  Kemarin, 25 Feb                    │
│  ┌─────────────────────────────┐    │
│  │ 💰  Gaji                    │    │
│  │     Pemasukan · 09:00       │    │
│  │               +Rp 5.000.000 │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  [🏠] [📋] [📈] [🎯]         [  +] │
└─────────────────────────────────────┘
```

### 8.5 Laporan (`/reports`)

```
┌─────────────────────────────────────┐
│  Laporan Keuangan                   │
├─────────────────────────────────────┤
│  [Feb 2026 ▼]                       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Cash Flow Bulanan           │    │
│  │ [Bar Chart: income vs exp]  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Pengeluaran per Kategori    │    │
│  │ [Donut Chart]               │    │
│  │ 🛒 Belanja      35% Rp 875rb│    │
│  │ 🍜 Makanan      28% Rp 700rb│    │
│  │ 🚗 Transport    15% Rp 375rb│    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Tren vs Bulan Lalu          │    │
│  │ Pengeluaran ↑ 12%           │    │
│  │ Pemasukan   → sama          │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  [🏠] [📋] [📈] [🎯]                 │
└─────────────────────────────────────┘
```

---

## 9. User Flow

### Flow A: Input Manual
```
Tap [+] di dashboard / bottom nav
    → Bottom sheet muncul (slide up)
    → Pilih: Pengeluaran / Pemasukan
    → Isi: nominal, kategori, tanggal, catatan
    → Tap [Simpan]
    → Bottom sheet tutup, toast sukses
    → Dashboard update otomatis
```

### Flow B: Scan Struk
```
Tap [📷 Scan Struk] di dashboard
    → Navigasi ke /scan
    → Pilih: [Upload Foto] atau [Kamera]
        → Upload: file picker terbuka
        → Kamera: kamera native HP terbuka
    → Preview foto muncul
    → Tap [Baca Struk Sekarang]
    → Loading: "HEMATIN sedang membaca struk..."
    → Sukses: navigasi ke form konfirmasi (pre-filled)
        → Edit jika perlu
        → Tap [Simpan Transaksi]
        → Toast sukses, balik ke dashboard
    → Gagal: pesan error + opsi input manual
```

### Flow C: Lihat AI Insight
```
Buka dashboard
    → Cek cache insight hari ini
        → Ada: tampilkan langsung
        → Belum ada: loading skeleton → fetch → tampilkan
    → Tap [Baca Selengkapnya]
    → Bottom sheet / modal muncul dengan insight lengkap
```

---

## 10. PWA Configuration

### 10.1 next-pwa Setup

**Install:**
```bash
npm install next-pwa
npm install --save-dev @types/next-pwa
```

**File: `next.config.ts`**
```typescript
import withPWA from 'next-pwa'

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Cache strategy: stale-while-revalidate untuk assets
  // Network-first untuk API routes
})

export default nextConfig
```

### 10.2 Web App Manifest

**File: `public/manifest.json`**
```json
{
  "name": "HEMATIN",
  "short_name": "HEMATIN",
  "description": "AI Daily Financial Assistant",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0EA5E9",
  "background_color": "#F0F9FF",
  "categories": ["finance", "productivity"],
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### 10.3 Meta Tags PWA di `layout.tsx`

```tsx
// Untuk iOS Safari install support
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="HEMATIN" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />

// Theme color
<meta name="theme-color" content="#0EA5E9" />
<link rel="manifest" href="/manifest.json" />
```

### 10.4 Offline Strategy

| Halaman / Resource | Strategy |
|--------------------|----------|
| Halaman utama (Dashboard, Transaksi, dll) | Cache First (shell) |
| Data transaksi | IndexedDB — always available offline |
| AI Insight (cached hari ini) | IndexedDB — available offline |
| API routes (`/api/insight`, `/api/scan`) | Network Only — butuh internet |
| Font, icon, static assets | Cache First |

**UX Offline:**
- Input transaksi manual → tetap bisa (IndexedDB)
- Lihat riwayat & laporan → tetap bisa (IndexedDB)
- AI Insight → tampilkan insight yang sudah di-cache
- Scan struk → tampilkan pesan "Butuh koneksi internet"

### 10.5 Install Prompt

```tsx
// Komponen: src/components/ui/InstallBanner.tsx
// Muncul sekali setelah user pakai app > 3x buka
// "Install HEMATIN ke homescreen untuk pengalaman terbaik"
// [Install Sekarang] [Nanti saja]
// Gunakan beforeinstallprompt event
```

---

## 12. Roadmap Pengembangan

> Detail langkah-langkah coding dari awal hingga selesai. Setiap phase menghasilkan sesuatu yang bisa dijalankan.

---

### Phase 1 — Foundation
**Goal:** Project berjalan, bisa input & simpan transaksi ke IndexedDB

#### Step 1.1 — Init Project
```bash
npx create-next-app@latest hematin \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*"

cd hematin
npm install dexie zustand framer-motion recharts \
  lucide-react date-fns zod browser-image-compression \
  @anthropic-ai/sdk openai @google/generative-ai \
  next-pwa
npm install --save-dev @types/next-pwa
```

#### Step 1.2 — Konfigurasi Tailwind, Font & PWA
- Setup `tailwind.config.ts` dengan custom color `sky` sebagai primary
- Tambah font Plus Jakarta Sans + Inter via `next/font/google`
- Buat CSS variables untuk design tokens di `globals.css`
- Setup `next.config.ts` dengan `withPWA`

#### Step 1.3 — Types & Constants
**File: `src/types/index.ts`**
```typescript
// Transaction, Goal, InsightCache, AISettings, Category types
// AIProvider: 'anthropic' | 'openai' | 'gemini'
```
**File: `src/lib/categories.ts`**
```typescript
// Daftar 8 kategori: Makanan, Transport, Belanja,
// Kesehatan, Hiburan, Tagihan, Pendidikan, Lainnya
// Masing-masing dengan: name, icon (emoji), color
```
**File: `src/lib/ai-providers.ts`**
```typescript
// AI_PROVIDERS config: provider list, models, key format
// getModelsForProvider(provider) → Model[]
// isVisionCapable(provider, model) → boolean
```

#### Step 1.4 — Setup Database (Dexie)
**File: `src/lib/db.ts`**
- Definisikan schema IndexedDB
- Tabel: `transactions`, `goals`, `insights`, `settings`
- Export instance `db` yang dipakai di seluruh app

#### Step 1.5 — Setup State (Zustand)
**File: `src/stores/transactionStore.ts`**
- State: `transactions[]`, `isLoading`
- Actions: `addTransaction`, `deleteTransaction`, `updateTransaction`, `loadTransactions`
- Semua action sync dengan IndexedDB

**File: `src/stores/settingsStore.ts`**
- State: `aiSettings: AISettings | null`, `isConfigured: boolean`
- Actions: `saveSettings`, `loadSettings`, `clearSettings`
- Sync dengan IndexedDB tabel `settings`

#### Step 1.6 — Komponen UI Dasar
**File: `src/components/ui/`**

| File | Deskripsi |
|------|-----------|
| `Button.tsx` | variant: primary, secondary, ghost, danger |
| `Card.tsx` | wrapper dengan shadow & radius |
| `Input.tsx` | text input dengan label & error state |
| `Badge.tsx` | pill badge dengan warna dinamis |
| `Skeleton.tsx` | loading placeholder shimmer |
| `EmptyState.tsx` | ilustrasi + teks saat data kosong |
| `Toast.tsx` | notifikasi sukses/error (top atau bottom) |
| `BottomSheet.tsx` | modal dari bawah dengan drag gesture |

#### Step 1.7 — Layout & Navigasi
**File: `src/components/layout/`**

| File | Deskripsi |
|------|-----------|
| `BottomNav.tsx` | navigasi 4 tab di bawah + FAB button |
| `Header.tsx` | header halaman dengan title & actions |
| `PageWrapper.tsx` | wrapper dengan padding + safe area bottom |

**File: `src/app/layout.tsx`**
- Pasang font, bottom nav, page wrapper
- Buat provider untuk Zustand

#### Step 1.8 — Form Input Transaksi
**File: `src/components/transactions/TransactionForm.tsx`**
- Toggle: Pengeluaran / Pemasukan
- Input: nominal (format Rupiah otomatis)
- Picker: kategori (grid icon)
- Input: tanggal (default hari ini)
- Textarea: catatan (opsional)
- Validasi dengan Zod sebelum submit

**File: `src/components/transactions/CategoryPicker.tsx`**
- Grid 4 kolom kategori
- Tap untuk pilih, highlight active

#### Step 1.9 — Halaman Riwayat Transaksi
**File: `src/app/transactions/page.tsx`**
- List transaksi dari Zustand store
- Grup berdasarkan tanggal (Hari ini, Kemarin, dst)
- Setiap item: icon kategori, nama, nominal (merah/hijau)
- Tap untuk edit, long press / swipe untuk hapus

---

### Phase 2 — Dashboard & Charts
**Goal:** Dashboard informatif dengan visualisasi data cash flow

#### Step 2.1 — Utility Kalkulasi
**File: `src/lib/calculations.ts`**
```typescript
// getTotalIncome(transactions, month)
// getTotalExpense(transactions, month)
// getBalance(transactions)
// getCashFlowStatus(income, expense) → 'aman'|'waspada'|'perlu-hati-hati'
// getTopCategory(transactions, month)
// getSpendingTrend(transactions) → 'increasing'|'stable'|'decreasing'
// getLast7DaysData(transactions) → array untuk chart
// getConsistencyLevel(transactions) → 'good'|'medium'|'low'
// compareWithLastMonth(transactions)
```

#### Step 2.2 — Komponen Dashboard
**File: `src/components/dashboard/`**

| File | Deskripsi |
|------|-----------|
| `HeroCard.tsx` | Card besar: saldo + status + gradient sky |
| `SummaryCards.tsx` | 2 card kecil: income (hijau) & expense (merah) |
| `CashFlowStatus.tsx` | Badge berwarna: Aman/Waspada/Perlu Hati-hati |
| `MiniChart.tsx` | Bar chart 7 hari (Recharts, height 120px) |
| `QuickActions.tsx` | 2 tombol: + Tambah & 📷 Scan Struk |
| `AIInsightCard.tsx` | Card dengan skeleton loading & teks insight |

#### Step 2.3 — Halaman Dashboard
**File: `src/app/page.tsx`**
- Susun semua komponen dashboard
- Load data dari Zustand saat mount
- Trigger fetch AI insight

#### Step 2.4 — Halaman Laporan
**File: `src/app/reports/page.tsx`**

**Komponen:**
- `CashFlowChart.tsx` — Bar chart grouped (income vs expense) per bulan
- `CategoryDonut.tsx` — Donut chart + legend daftar kategori
- `MonthPicker.tsx` — Selector bulan/tahun
- `TrendCard.tsx` — Perbandingan dengan bulan lalu (% naik/turun)

---

### Phase 3 — Settings AI & AI Integration
**Goal:** User bisa setup AI sendiri, insight & scanner berjalan multi-provider

#### Step 3.1 — Utility Format
**File: `src/lib/utils.ts`**
```typescript
// formatRupiah(amount: number) → "Rp 45.000"
// formatDate(date: string) → "26 Feb 2026"
// formatRelativeDate(date: string) → "Hari ini" | "Kemarin"
// generateId() → UUID v4
// compressImage(file: File) → Promise<File>
// maskApiKey(key: string) → "sk-ant-...xxxx" (untuk display)
```

#### Step 3.2 — Halaman Settings AI
**File: `src/app/settings/page.tsx`**

**Komponen:**
- `AIProviderPicker.tsx` — 3 pill: Anthropic / OpenAI / Gemini
- `ModelPicker.tsx` — Dropdown model sesuai provider
- `APIKeyInput.tsx` — Input dengan toggle show/hide + link docs
- `ConnectionTest.tsx` — Tombol test + status: loading / sukses / gagal

**Logic Test Koneksi:**
```typescript
// Kirim request kecil ke /api/insight dengan data dummy
// Jika response 200 → ✅ Koneksi berhasil
// Jika 401 → ❌ API key tidak valid
// Jika 429 → ⚠️ Rate limit, tapi key valid
// Jika network error → ❌ Tidak bisa terhubung
```

#### Step 3.3 — API Route: Multi-provider Insight
**File: `src/app/api/insight/route.ts`**
```typescript
// POST /api/insight
// Headers: X-AI-Provider, X-AI-Model, X-AI-Key
// Body: { financialData: FinancialContext }
//
// switch (provider):
//   case 'anthropic': gunakan @anthropic-ai/sdk
//   case 'openai':    gunakan openai SDK
//   case 'gemini':    gunakan @google/generative-ai
//
// Return: { insight: string }
```

**File: `src/lib/ai-insight.ts`**
```typescript
// fetchDailyInsight(data, settings) → string
//   → ambil settings dari Zustand
//   → kirim ke /api/insight dengan header provider/model/key
// getCachedInsight(date) → string | null
// saveInsightCache(date, content) → void
```

#### Step 3.4 — AI Insight Card
**File: `src/components/dashboard/AIInsightCard.tsx`**
- Jika AI belum setup → banner dengan link ke `/settings`
- Jika loading → skeleton shimmer
- Tampilkan teks insight (📌💡✅🔮🌱)
- Tap [Baca Selengkapnya] → bottom sheet insight penuh
- Tombol [Refresh] untuk regenerate

#### Step 3.5 — API Route: Multi-provider Scanner
**File: `src/app/api/scan/route.ts`**
```typescript
// POST /api/scan
// Headers: X-AI-Provider, X-AI-Model, X-AI-Key
// Body: { image: string } (base64)
//
// Semua provider support vision (semua model yang ditawarkan)
// Return: { merchant, date, total, category, notes, confidence }
```

**File: `src/lib/ai-scanner.ts`**
```typescript
// scanReceipt(imageBase64: string, settings: AISettings) → ScannedReceipt
```

#### Step 3.6 — Halaman Scanner
**File: `src/app/scan/page.tsx`**

**Komponen:**
- `ReceiptScanner.tsx` — Area upload/kamera + instruksi
- `ReceiptPreview.tsx` — Preview foto + tombol scan + ganti foto
- `ScanLoading.tsx` — Animasi loading "HEMATIN sedang membaca..."
- `ReceiptConfirm.tsx` — Form pre-filled + tombol simpan/ulang

**Guard:** Jika AI belum dikonfigurasi → redirect ke `/settings` dengan pesan toast

---

### Phase 4 — Goals & Fitur Lengkap
**Goal:** Semua fitur MVP selesai dan terintegrasi

#### Step 4.1 — Goals Store
**File: `src/stores/goalStore.ts`**
- State: `goals[]`
- Actions: `addGoal`, `deleteGoal`, `updateGoal`
- Kalkulasi: `getGoalProgress(category, month)` → { spent, limit, percent }

#### Step 4.2 — Halaman Goals
**File: `src/app/goals/page.tsx`**

**Komponen:**
- `GoalCard.tsx` — Card per kategori dengan progress bar
  - Warna progress: hijau (<80%), kuning (80-99%), merah (>100%)
  - Label: "Rp 350rb dari Rp 500rb"
- `GoalForm.tsx` — Form: pilih kategori + set limit
- Progress bar dengan animasi width dari 0%

#### Step 4.3 — Filter & Search Transaksi
**Tambahan di `/transactions`:**
- Month picker (scroll horizontal atau dropdown)
- Filter kategori (pill scrollable)
- Search bar dengan debounce 300ms
- Sort: terbaru / terlama / terbesar / terkecil

#### Step 4.4 — Edit & Hapus Transaksi
- Tap transaksi → bottom sheet detail
- Edit: pre-fill form dengan data existing
- Hapus: konfirmasi dialog sebelum delete
- Swipe left (mobile): reveal tombol hapus merah

---

### Phase 5 — Polish & Production Ready
**Goal:** UI premium, smooth, siap dipakai sehari-hari

#### Step 5.1 — Framer Motion Animations
```typescript
// Page transition: AnimatePresence + variants
// Card enter: staggerChildren dengan delay 50ms per card
// Bottom sheet: useMotionValue + drag gesture
// Number counter: useSpring untuk animasi angka nominal
// Skeleton → content: crossfade transition
```

#### Step 5.2 — Micro-interactions
- Tombol: `whileTap={{ scale: 0.97 }}`
- Card: `whileHover={{ y: -2, shadow: "md" }}`
- FAB: `whileTap={{ scale: 0.92 }}` + ripple effect
- Input focus: border berubah ke sky-400 dengan smooth transition
- Category pick: scale up + bounce saat dipilih
- Toast: slide dari atas + auto dismiss 3 detik

#### Step 5.3 — Loading & Empty States
- Setiap data-driven komponen punya skeleton variant
- Shimmer direction: kiri ke kanan (90deg gradient)
- Empty state dashboard: ilustrasi + CTA "Catat transaksi pertama"
- Empty state riwayat: "Belum ada transaksi bulan ini"
- Error state AI: "Gagal memuat insight, coba lagi"

#### Step 5.4 — Responsiveness
- Mobile (< 640px): layout utama, bottom nav
- Tablet (640–1024px): konten lebih lebar, padding lebih besar
- Desktop (> 1024px): max-width 480px centered (feel like mobile app)

#### Step 5.5 — PWA (Bonus)
```
public/manifest.json:
  - name: "HEMATIN"
  - theme_color: "#0EA5E9"
  - background_color: "#F0F9FF"
  - display: "standalone"
  - icons: 192x192, 512x512

next.config.ts:
  - Tambah PWA config (next-pwa atau manual service worker)
```

#### Step 5.6 — Environment & Deployment
**File: `.env.local`**
```
ANTHROPIC_API_KEY=sk-ant-...
```

**Deploy ke Vercel:**
```bash
vercel deploy
# Set env var ANTHROPIC_API_KEY di Vercel dashboard
```

---

### Urutan File yang Dibuat (Rekomendasi)

> Legend: ✅ Selesai | 🔲 Pending | ⚡ Prioritas tinggi berikutnya

```
── Phase 1: Foundation ──────────────────────────
✅ 1.  public/manifest.json
✅ 2.  public/icons/                           ← icon.svg + icon-192.png + icon-512.png + icon-maskable-512.png
✅ 3.  next.config.ts                          ← withPWA + --webpack flag
✅ 4.  src/types/index.ts
✅ 5.  src/lib/categories.ts
✅ 6.  src/lib/ai-providers.ts
✅ 7.  src/lib/db.ts
✅ 8.  src/lib/utils.ts
✅ 9.  src/stores/transactionStore.ts
✅ 10. src/stores/settingsStore.ts
✅ 11. src/components/ui/Button.tsx
✅ 12. src/components/ui/Card.tsx
✅ 13. src/components/ui/Input.tsx
✅ 14. src/components/ui/Badge.tsx
✅ 15. src/components/ui/BottomSheet.tsx
✅ 16. src/components/ui/Skeleton.tsx
✅ 17. src/components/ui/Toast.tsx
✅ 18. src/components/ui/EmptyState.tsx
✅ 19. src/components/ui/InstallBanner.tsx     ← PWA install prompt
✅ 20. src/components/layout/BottomNav.tsx
✅ 21. src/components/layout/Header.tsx
✅ 22. src/components/layout/PageWrapper.tsx
✅ 23. src/app/layout.tsx
✅ 24. src/components/transactions/CategoryPicker.tsx
✅ 25. src/components/transactions/TransactionForm.tsx
✅ 26. src/components/transactions/TransactionItem.tsx
✅ 27. src/components/transactions/TransactionList.tsx
✅ 28. src/app/transactions/page.tsx

── Phase 2: Dashboard & Charts ─────────────────
✅ 29. src/lib/calculations.ts                 ← buildFinancialContext, formatContextForAI
✅ 30. src/components/dashboard/MiniChart.tsx  ← Recharts bar 7 hari
✅ 31. src/components/dashboard/AIInsightCard.tsx ← fetch + cache insight harian
✅ 32. src/app/page.tsx                        ← dashboard (AIInsightCard + MiniChart)
✅ 33. src/components/reports/CashFlowChart.tsx ← Recharts grouped bar 4 bulan
✅ 34. src/components/reports/CategoryDonut.tsx ← Recharts donut + legend
✅ 35. src/app/reports/page.tsx               ← laporan lengkap dengan recharts

── Phase 3: Settings AI & AI Integration ───────
✅ 36. src/app/settings/page.tsx              ← inline provider/model/key
✅ 37. src/components/settings/ConnectionTest.tsx ← test koneksi: success/rate-limit/invalid/error
✅ 38. src/app/api/insight/route.ts
✅ 39. src/app/api/scan/route.ts
✅ 40. src/lib/ai-insight.ts                  ← getOrFetchInsight + cache IndexedDB
✅ 41. src/app/scan/page.tsx                  ← inline scanner + preview

── Phase 4: Goals & Fitur Lengkap ──────────────
✅ 42. src/stores/goalStore.ts
✅ 43. src/app/goals/page.tsx                 ← inline GoalCard + GoalForm
✅ 44. Filter & search di /transactions
✅ 45. Edit transaksi (pre-fill form)

── Phase 4B: Utang Piutang (NEW) ────────────────
✅ 46. src/types/index.ts                     ← tambah interface Debt
✅ 47. src/lib/db.ts                          ← tambah tabel debts (version bump)
✅ 48. src/stores/debtStore.ts                ← Zustand + Dexie, computed getters
✅ 49. src/components/layout/BottomNav.tsx    ← tambah tab 💳 + badge overdue
✅ 50. src/app/debts/page.tsx                 ← DebtCard + DebtForm + tab toggle
✅ 51. src/components/dashboard/DebtReminderBanner.tsx  ← banner di dashboard
✅ 52. src/app/page.tsx                       ← integrasi DebtReminderBanner
✅ 53. src/app/api/insight/route.ts           ← update prompt + data hutang

── Phase 4C: Recurring Transactions (NEW) ───────
✅ 54. src/types/index.ts                     ← tambah interface RecurringTemplate + source:'recurring' + recurringId
✅ 55. src/lib/db.ts                          ← tambah tabel recurringTemplates (version bump v3)
✅ 56. src/stores/recurringStore.ts           ← Zustand + Dexie, getPendingToday()
✅ 57. src/app/recurring/page.tsx             ← halaman daftar + form template (toggle aktif/nonaktif, edit, hapus)
✅ 58. src/components/dashboard/RecurringReminderBanner.tsx ← banner di dashboard (dismiss per hari)
✅ 59. src/app/page.tsx                       ← integrasi RecurringReminderBanner + loadTemplates
✅ 60. src/components/transactions/TransactionForm.tsx ← toggle "Ulangi setiap bulan" + DayPicker
✅ 61. src/components/transactions/TransactionItem.tsx ← ikon 🔁 untuk source='recurring'
✅ 62. src/app/transactions/page.tsx          ← link "Rutin" di header → /recurring

── Phase 6: Cloud Migration (Future) ────────────
🔲 54. Supabase project setup + schema SQL
🔲 55. src/lib/supabase.ts                    ← client init
🔲 56. src/stores/authStore.ts                ← session + user state
🔲 57. src/app/auth/page.tsx                  ← login/signup minimal
🔲 58. src/lib/sync.ts                        ← sync queue processor
🔲 59. src/lib/migration.ts                   ← IndexedDB → Supabase one-time migration
```

---

### Status Tracking

| Phase | Status | Mulai | Selesai |
|-------|--------|-------|---------|
| Phase 1 — Foundation | ✅ Selesai | 26 Feb 2026 | 26 Feb 2026 |
| Phase 2 — Dashboard & Charts | ✅ Selesai | 26 Feb 2026 | 26 Feb 2026 |
| Phase 3 — Settings AI & AI Integration | ✅ Selesai | 26 Feb 2026 | 26 Feb 2026 |
| Phase 4 — Goals & Fitur Lengkap | ✅ Selesai | 26 Feb 2026 | 1 Mar 2026 |
| Phase 4B — Utang Piutang + Reminder | ✅ Selesai | 1 Mar 2026 | 1 Mar 2026 |
| Phase 4C — Recurring Transactions | ✅ Selesai | 3 Mar 2026 | 3 Mar 2026 |
| Phase 5 — Polish, Animasi & PWA | 🟡 Sebagian | 26 Feb 2026 | — |
| Phase 6 — Cloud Storage Migration | 🔲 Future | — | — |

### Catatan Implementasi (26 Feb 2026)

**Yang sudah ada tapi beda dari plan awal:**
- Dashboard langsung di `/` (bukan `/app/dashboard`) — SEO split bisa dikerjakan post-MVP
- Settings, Goals, Scan, Reports inline di halaman (bukan komponen terpisah per folder)
- Build menggunakan `--webpack` flag karena Next.js 16 + @ducanh2912/next-pwa tidak kompatibel dengan Turbopack default

**Phase 3 selesai ✅**

**Pending (Phase 5):**
- Swipe-to-delete gesture di TransactionList
- Responsive check (mobile, tablet, desktop)
- Test install di Android & iOS

**Selesai 1 Mar 2026 (lanjutan):**
- ~~InstallBanner PWA~~ ✅

**Selesai 1 Mar 2026:**
- ~~Filter & search di riwayat transaksi~~ ✅
- ~~Edit transaksi (pre-fill form)~~ ✅
- ~~Fitur Utang Piutang + DebtReminderBanner~~ ✅

**Sudah selesai (dari catatan sebelumnya):**
- ~~AI Insight Card~~ ✅ — AIInsightCard.tsx + ai-insight.ts + calculations.ts
- ~~Recharts~~ ✅ — MiniChart + CashFlowChart + CategoryDonut
- ~~PWA Icons~~ ✅ — icon.svg + icon-192.png + icon-512.png + icon-maskable-512.png
- ~~Dark mode~~ ✅ — semua halaman & komponen

---

## 13. SEO Strategy

> HEMATIN perlu dua "muka": **Landing Page** (publik, SEO-heavy) dan **App** (fungsional, IndexedDB-first).

---

### 13.1 Arsitektur URL untuk SEO

```
/                   → Landing Page (SEO, marketing, publik)
/app                → Entry point app (redirect ke /app/dashboard)
/app/dashboard      → Dashboard utama
/app/transactions   → Riwayat transaksi
/app/reports        → Laporan
/app/goals          → Goals
/app/scan           → Scanner struk
/app/settings       → Pengaturan AI

/blog               → Artikel keuangan (post-MVP, untuk organic traffic)
/blog/[slug]        → Artikel individual
```

> **Kenapa dipisah?**
> Landing page bisa di-crawl sepenuhnya oleh Google (SSR/SSG).
> App (`/app/*`) tidak perlu SEO karena data bersifat lokal & personal.

---

### 13.2 Landing Page (`/`)

**Tujuan:** Ranking di Google untuk keyword keuangan personal Indonesia.

**Struktur halaman:**
```
┌─────────────────────────────────────┐
│  HEMATIN    [Mulai Gratis]          │  ← Navbar
├─────────────────────────────────────┤
│  Hero Section                       │
│  "Catat keuangan harian kamu        │
│   dengan bantuan AI"                │
│  [Mulai Gratis] [Lihat Demo]        │
├─────────────────────────────────────┤
│  Features Section                   │
│  ✓ Input manual & scan struk        │
│  ✓ AI insight personal harian       │
│  ✓ Laporan cash flow visual         │
│  ✓ Data tersimpan di perangkatmu    │
├─────────────────────────────────────┤
│  How It Works (3 langkah)           │
├─────────────────────────────────────┤
│  Screenshot / Demo GIF              │
├─────────────────────────────────────┤
│  Privacy Section                    │
│  "Data kamu 100% di perangkat kamu" │
├─────────────────────────────────────┤
│  FAQ                                │
├─────────────────────────────────────┤
│  CTA: "Mulai Gratis Sekarang"       │
└─────────────────────────────────────┘
```

---

### 13.3 Metadata & Next.js SEO Setup

**File: `src/app/layout.tsx`** — metadata global
```typescript
export const metadata: Metadata = {
  title: {
    default: 'HEMATIN — Asisten Keuangan Harian Berbasis AI',
    template: '%s | HEMATIN',
  },
  description:
    'Catat cash flow harianmu, scan struk belanja, dan dapatkan insight AI yang empatik. ' +
    'Data tersimpan aman di perangkatmu, gratis selamanya.',
  keywords: [
    'aplikasi keuangan pribadi',
    'catat pengeluaran',
    'cash flow harian',
    'scan struk belanja',
    'asisten keuangan AI',
    'aplikasi budgeting indonesia',
    'pencatatan keuangan gratis',
  ],
  authors: [{ name: 'HEMATIN' }],
  creator: 'HEMATIN',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://hematin.app',
    siteName: 'HEMATIN',
    title: 'HEMATIN — Asisten Keuangan Harian Berbasis AI',
    description: 'Catat cash flow, scan struk, insight AI. Semua data tersimpan di perangkatmu.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HEMATIN — Asisten Keuangan Harian Berbasis AI',
    description: 'Catat cash flow, scan struk, insight AI. Semua data tersimpan di perangkatmu.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: '/manifest.json',
  themeColor: '#0EA5E9',
}
```

**Per halaman landing (SSG):**
```typescript
// src/app/page.tsx (landing)
export const metadata: Metadata = {
  title: 'Catat Keuangan Harian dengan AI — Gratis',
  description: '...',
  alternates: { canonical: 'https://hematin.app' },
}
```

---

### 13.4 Target Keyword

| Keyword | Intent | Volume Est. | Prioritas |
|---------|--------|-------------|-----------|
| aplikasi catat keuangan | Informational | Tinggi | ★★★ |
| catat pengeluaran harian | Informational | Tinggi | ★★★ |
| aplikasi cash flow pribadi | Informational | Sedang | ★★★ |
| scan struk belanja otomatis | Informational | Sedang | ★★☆ |
| aplikasi budgeting indonesia gratis | Informational | Sedang | ★★★ |
| asisten keuangan AI indonesia | Informational | Rendah | ★★☆ |
| cara mengatur keuangan harian | Informational | Tinggi | ★★☆ |

---

### 13.5 Technical SEO

**File: `src/app/sitemap.ts`**
```typescript
// Generate sitemap otomatis
// Include: /, /blog/*, /features
// Exclude: /app/* (private, no index)
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://hematin.app', lastModified: new Date(), priority: 1 },
    { url: 'https://hematin.app/blog', lastModified: new Date(), priority: 0.8 },
    // blog posts...
  ]
}
```

**File: `src/app/robots.ts`**
```typescript
// Allow: /
// Allow: /blog
// Disallow: /app  ← tidak perlu di-index
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/app/' },
    ],
    sitemap: 'https://hematin.app/sitemap.xml',
  }
}
```

**File: `public/og-image.png`**
- Ukuran: 1200 × 630 px
- Desain: logo HEMATIN + tagline + screenshot app
- Warna: gradient sky blue brand

---

### 13.6 Structured Data (JSON-LD)

**Di landing page:**
```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'HEMATIN',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web, Android, iOS',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
  description: 'Asisten keuangan harian berbasis AI untuk pengguna Indonesia.',
  inLanguage: 'id',
}
```

---

### 13.7 Performance & Core Web Vitals

Target score **Lighthouse ≥ 90** untuk semua kategori:

| Metric | Target | Cara Mencapai |
|--------|--------|---------------|
| LCP | < 2.5s | Optimize hero image, preload fonts |
| FID / INP | < 100ms | Minimize JS blocking, code split |
| CLS | < 0.1 | Reserve space untuk gambar & font |
| TTFB | < 600ms | Vercel Edge, static generation |

**Teknis:**
- Landing page: **Static Generation (SSG)** — zero server response time
- App (`/app/*`): **Client-side Rendering** — tidak perlu SSR, data dari IndexedDB
- Font: `display: swap` untuk menghindari FOUT
- Images: `next/image` dengan `priority` pada hero
- Code splitting: dynamic import untuk komponen berat (chart, framer-motion)

---

### 13.8 Blog / Content Strategy (Post-MVP)

Untuk organic traffic jangka panjang:

| Topik Artikel | Target Keyword |
|---------------|---------------|
| Cara mengatur keuangan dengan metode 50/30/20 | cara mengatur keuangan |
| Apa itu cash flow dan kenapa penting? | cash flow adalah |
| 7 kebiasaan orang yang sukses kelola keuangan | tips kelola keuangan |
| Cara baca struk belanja untuk hemat lebih banyak | cara hemat belanja |
| Bedanya budgeting dan cash flow tracking | budgeting vs cash flow |

**File structure:**
```
src/app/blog/
├── page.tsx              → Daftar artikel
├── [slug]/
│   └── page.tsx          → Artikel detail (MDX/Markdown)
└── _posts/               → File .mdx artikel
```

---

## 14. Monetization Roadmap

> Prinsip: **Gratis dulu, bangun kepercayaan, monetisasi setelah ada user loyal.**

---

### 14.1 Model Monetisasi per Fase

#### Fase 0 — Free Forever (Sekarang — MVP)
**Semua fitur gratis tanpa batas.**
- Tidak ada akun, tidak ada paywall
- User bawa API key sendiri
- Tujuan: **bangun user base & kepercayaan**

```
Revenue: Rp 0  |  Fokus: Traction & Feedback
```

---

#### Fase 1 — Donate / Support (Post-MVP, ~3 bulan)
**Tambahkan tombol donasi untuk user yang mau support.**

```typescript
// Integrasi platform donasi Indonesia:
// - Saweria (paling populer di Indonesia)
// - Trakteer
// - Ko-fi (internasional)

// UI: Tombol kecil "Traktir HEMATIN ☕" di Settings
// Tidak mengganggu, tidak memaksa
```

- Target: Rp 500rb – 2jt/bulan dari komunitas awal
- Low effort, zero engineering

---

#### Fase 2 — HEMATIN Pro (6-12 bulan)
**Freemium model dengan fitur premium.**

| Fitur | Free | Pro |
|-------|------|-----|
| Input transaksi | Unlimited | Unlimited |
| Riwayat data | 3 bulan | Unlimited |
| Laporan bulanan | ✓ | ✓ |
| AI Insight harian | Bring own key | Bring own key + **Hosted AI** |
| Scan struk | Bring own key | Bring own key + **Hosted AI** |
| Export PDF/CSV | ✗ | ✓ |
| Multi-device sync | ✗ | ✓ (cloud backup) |
| Budget goals | 3 kategori | Unlimited |
| Priority support | ✗ | ✓ |

**Harga:**
```
Free:          Rp 0 / bulan
Pro:           Rp 29.000 / bulan
Pro Tahunan:   Rp 249.000 / tahun (hemat ~30%)
Lifetime:      Rp 499.000 (early adopter price)
```

> **Hosted AI** = HEMATIN menyediakan API key Claude/GPT sendiri.
> User Pro tidak perlu setup API key sendiri.

**Implementasi tambahan yang dibutuhkan:**
- Auth system (Supabase atau Clerk)
- Payment gateway (Midtrans atau Xendit — Indonesia)
- Cloud sync backend (Supabase PostgreSQL)
- Subscription management

---

#### Fase 3 — B2B / White Label (12-24 bulan)
**Jual ke perusahaan / komunitas / koperasi.**

```
Target: HR perusahaan yang mau kasih benefit ke karyawan
        Komunitas saving money
        Koperasi simpan pinjam

Model:  Per seat / bulan
        Custom branding
        Dashboard admin
```

---

#### Fase 4 — Marketplace & Affiliasi (18+ bulan)
**Rekomendasikan produk keuangan yang relevan.**

```
Integrasi dengan:
- Reksa dana (Bibit, Ajaib) — afiliasi
- Tabungan digital (Jenius, Blu) — afiliasi
- Asuransi — afiliasi
- Pinjaman (jika user butuh) — afiliasi

Model: Komisi per konversi (Cost Per Acquisition)
```

> Hanya rekomendasikan produk yang **relevan dengan kondisi user**.
> AI HEMATIN bisa merekomendasikan produk berdasarkan pola spending.
> Transparansi: selalu label "ini rekomendasi berbayar"

---

### 14.2 Revenue Projection (Konservatif)

| Fase | Bulan | Users | Revenue/Bulan |
|------|-------|-------|---------------|
| Free | 0-3 | 0–500 | Rp 0 |
| Donate | 3-6 | 500–2.000 | Rp 500rb – 2jt |
| Pro Launch | 6-12 | 2.000–5.000 | Rp 5jt – 20jt |
| Pro Growth | 12-18 | 5.000–15.000 | Rp 20jt – 60jt |
| B2B + Afiliasi | 18-24 | 15.000+ | Rp 60jt+ |

---

### 14.3 Persiapan Teknis untuk Monetisasi (Di MVP)

Meski belum monetisasi sekarang, siapkan fondasi:

```typescript
// 1. Analytics — track usage tanpa data personal
//    Gunakan: Plausible (privacy-first) atau Umami
//    Track: page views, fitur yang paling sering dipakai

// 2. Feedback System
//    Tombol feedback kecil di app
//    Kumpulkan: fitur yang diinginkan, bug, saran

// 3. Email waitlist
//    Form sederhana: "Daftar untuk dapat notifikasi fitur baru"
//    Gunakan: Resend + simple form di landing page

// 4. Version & changelog
//    /changelog page — untuk bangun kepercayaan & transparency
```

**File tambahan:**
```
src/app/changelog/page.tsx     → Riwayat update
src/app/pricing/page.tsx       → Halaman harga (saat Pro launch)
src/components/ui/DonateBanner.tsx  → Banner donasi di settings
```

---

### 14.4 Kompetitor & Diferensiasi

| Kompetitor | Kelemahan | HEMATIN lebih baik di |
|------------|-----------|----------------------|
| Money Manager | Berbayar, UI kuno | Gratis, modern, AI |
| Wallet by BudgetBakers | Perlu akun, sync cloud | No akun, privacy-first |
| Catatan Keuangan (play store) | Tidak ada AI | AI insight empatik |
| Notion/Spreadsheet | Ribet setup | Auto-analisis, scan struk |

**Unique Selling Proposition (USP):**
> *"Satu-satunya app keuangan Indonesia yang punya AI empatik,
> scan struk otomatis, dan data 100% di perangkat kamu — gratis."*

---

---

## 15. Fitur Utang Piutang

> Membantu pengguna melacak uang yang dipinjam (hutang) dan uang yang dipinjamkan (piutang), dengan reminder agar tidak lupa bayar.

---

### 15.1 Konsep & Terminologi

| Istilah | Artinya | Contoh |
|---------|---------|--------|
| **Hutang** | User berhutang ke orang lain | "Aku pinjam Rp 200rb ke Budi" |
| **Piutang** | Orang lain berhutang ke user | "Aku minjemin Rp 100rb ke Sari" |

---

### 15.2 Database Schema — Tabel `debts`

```typescript
interface Debt {
  id: string                          // UUID
  type: 'hutang' | 'piutang'         // hutang = I owe, piutang = they owe me
  person: string                      // nama orang (bebas tulis)
  amount: number                      // jumlah dalam Rupiah
  dueDate?: string                    // ISO date: "2026-03-15" — opsional
  description?: string                // keterangan (e.g. "bayar makan bareng")
  status: 'active' | 'paid' | 'overdue'
  createdAt: number                   // timestamp
  paidAt?: number                     // timestamp saat dilunasi
  notes?: string                      // catatan tambahan saat mark as paid
}
```

**Index Dexie:** `++id, type, status, dueDate, person`

**Kalkulasi otomatis `overdue`:**
- Setiap kali load data, cek `dueDate < today && status === 'active'` → otomatis mark `overdue`

---

### 15.3 Store — `debtStore.ts`

```typescript
// src/stores/debtStore.ts (Zustand + Dexie sync)

interface DebtStore {
  debts: Debt[]
  isLoading: boolean

  // Actions
  loadDebts: () => Promise<void>
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'status'>) => Promise<void>
  markAsPaid: (id: string, notes?: string) => Promise<void>
  deleteDebt: (id: string) => Promise<void>
  updateDebt: (id: string, data: Partial<Debt>) => Promise<void>

  // Computed
  getActiveHutang: () => Debt[]        // type=hutang, status≠paid
  getActivePiutang: () => Debt[]       // type=piutang, status≠paid
  getOverdueCount: () => number        // badge count untuk nav
  getTotalHutang: () => number         // total nominal hutang aktif
  getTotalPiutang: () => number        // total nominal piutang aktif
}
```

---

### 15.4 Halaman `/debts`

```
┌─────────────────────────────────────┐
│  ← Utang & Piutang                  │
├─────────────────────────────────────┤
│  ┌──────────────┐ ┌───────────────┐ │
│  │   Hutangku   │ │   Piutangku   │ │  ← Tab toggle
│  │  Rp 450.000  │ │   Rp 200.000  │ │
│  └──────────────┘ └───────────────┘ │
├─────────────────────────────────────┤
│  ⚠️  1 hutang sudah jatuh tempo!    │  ← Overdue banner (merah)
├─────────────────────────────────────┤
│                                     │
│  ── Belum Lunas ──                  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔴 Budi                    │    │  ← overdue = merah
│  │  Rp 200.000                 │    │
│  │  Jatuh tempo: 28 Feb 2026   │    │
│  │  bayar makan bareng         │    │
│  │  [Tandai Lunas]             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🟡 Mama                   │    │  ← soon (≤7 hari) = kuning
│  │  Rp 250.000                 │    │
│  │  Jatuh tempo: 5 Mar 2026    │    │
│  │  uang bensin                │    │
│  │  [Tandai Lunas]             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ── Lunas ──                        │
│  ┌─────────────────────────────┐    │
│  │  ✅ Tante Sarah — Rp 50rb  │    │  ← collapsed, text muted
│  │  Lunas 20 Feb 2026         │    │
│  └─────────────────────────────┘    │
│                                     │
│                      [+ Tambah]     │  ← FAB / button
├─────────────────────────────────────┤
│  [🏠] [📋] [💳] [📈] [🎯]           │  ← BottomNav + tab Utang
└─────────────────────────────────────┘
```

---

### 15.5 Form Tambah Utang/Piutang (Bottom Sheet)

```
┌─────────────────────────────────────┐
│  ── Tambah Catatan Utang ──         │
│                                     │
│  Jenis        [🔴 Hutang] [🟢 Piutang]
│                                     │
│  Nama Orang   [Budi              ]  │
│                                     │
│  Jumlah       [Rp 200.000        ]  │
│                                     │
│  Keterangan   [bayar makan bareng]  │
│                                     │
│  Jatuh Tempo  [5 Maret 2026    📅]  │  ← opsional
│                                     │
│  [        Simpan Catatan         ]  │
└─────────────────────────────────────┘
```

---

### 15.6 Reminder System

#### Level 1 — Dashboard Banner (MVP) ✅ Wajib diimplementasi

```
┌─────────────────────────────────────┐
│  💳 Pengingat Pembayaran            │
│                                     │
│  ⚠️ Hutang ke Budi — Rp 200rb      │
│     Sudah lewat jatuh tempo!        │
│     [Tandai Lunas] [Lihat Detail]   │
│                                     │
│  🔔 Hutang ke Mama — Rp 250rb      │
│     Jatuh tempo dalam 3 hari        │
│     [Tandai Lunas] [Lihat Detail]   │
└─────────────────────────────────────┘
```

**Logika trigger banner:**
- `status === 'overdue'` → tampil selalu dengan warna merah
- `dueDate` dalam 7 hari ke depan && status aktif → tampil kuning
- Jika tidak ada reminder → tidak tampil (zero UI noise)

#### Level 2 — Badge di Bottom Nav (MVP) ✅ Wajib diimplementasi

```
Tab "💳 Utang" → Badge merah berisi angka jika ada overdue
e.g. [💳 2] → ada 2 hutang overdue atau jatuh tempo
```

#### Level 3 — AI Insight Integration (MVP) ✅ Wajib diimplementasi

Kirim data utang ke prompt AI insight harian:
```typescript
{
  // ...financial context yang sudah ada...
  pending_hutang_count: 2,
  pending_hutang_total: 450000,
  overdue_hutang: ['Budi Rp200rb (overdue)', 'Mama Rp250rb (3 hari lagi)'],
  pending_piutang_count: 1,
  pending_piutang_total: 200000,
}
```

AI bisa menyebut: *"Jangan lupa, kamu masih punya hutang Rp 450rb yang perlu diselesaikan..."*

#### Level 4 — PWA Push Notification (Post-MVP) 🔲

```
// Butuh: Service Worker + Notification API + user permission
// Trigger: H-1 sebelum due date → push notification lokal
// Tidak butuh backend — gunakan Web Notifications API
// Setup di: src/lib/debt-reminder.ts

// Cara kerja:
// 1. Saat user buka app → schedule notification lokal via setTimeout/setInterval
// 2. Gunakan PushManager API atau Notification API langsung
// 3. Reminder: "⏰ Bayar hutang ke Budi Rp 200rb besok!"
```

---

### 15.7 Komponen yang Dibutuhkan

```
src/
├── stores/
│   └── debtStore.ts                   ← Zustand + Dexie sync
│
├── app/
│   └── debts/
│       └── page.tsx                   ← halaman utama utang piutang
│
└── components/
    ├── debts/                         ← (opsional, bisa inline)
    │   ├── DebtCard.tsx               ← card 1 item hutang/piutang
    │   ├── DebtForm.tsx               ← form bottom sheet tambah
    │   └── DebtSummary.tsx            ← ringkasan total hutang/piutang
    └── dashboard/
        └── DebtReminderBanner.tsx     ← banner reminder di dashboard
```

---

### 15.8 Urutan Implementasi

```
🔲 1. Tambah interface Debt ke src/types/index.ts
🔲 2. Tambah tabel 'debts' ke src/lib/db.ts (Dexie schema version bump)
🔲 3. Buat src/stores/debtStore.ts (Zustand + Dexie)
🔲 4. Tambah tab "💳" ke BottomNav (5 tab: Home, Tx, Utang, Reports, Goals)
🔲 5. Buat src/app/debts/page.tsx (inline DebtCard + DebtForm)
🔲 6. Buat DebtReminderBanner.tsx → pasang di Dashboard
🔲 7. Tambah badge overdue count ke tab BottomNav
🔲 8. Update AI insight prompt — sertakan data hutang
🔲 9. (Post-MVP) PWA Push Notification scheduler
```

---

## 16. Cloud Storage Migration Plan

> Saat ini semua data tersimpan di IndexedDB (lokal perangkat). Ini bagus untuk privacy & offline-first, tapi membatasi: data hilang jika browser reset, tidak bisa multi-device, tidak bisa backup otomatis.

---

### 16.1 Mengapa Migrasi?

| Masalah IndexedDB | Dampak ke User |
|-------------------|----------------|
| Data hilang jika clear browser storage | Kehilangan semua riwayat transaksi |
| Tidak bisa akses dari HP lain | Tidak bisa ganti perangkat |
| Tidak ada backup | Tidak ada recovery jika HP rusak |
| Tidak bisa fitur Pro (multi-device sync) | Membatasi monetisasi |

---

### 16.2 Target Arsitektur Cloud

```
┌─────────────┐      ┌──────────────┐      ┌────────────────┐
│   Browser   │      │  Next.js API  │      │   Supabase     │
│  IndexedDB  │ ←──→ │   Routes     │ ←──→ │  PostgreSQL    │
│ (offline    │      │  (proxy +    │      │  + Auth        │
│  cache)     │      │   sync)      │      │  + RLS         │
└─────────────┘      └──────────────┘      └────────────────┘
```

**Prinsip: IndexedDB tetap sebagai offline cache, Supabase sebagai source of truth.**

---

### 16.3 Stack yang Direkomendasikan

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Database** | Supabase (PostgreSQL) | Free tier generous, realtime, RLS built-in |
| **Auth** | Supabase Auth | Built-in dengan DB, social login gratis |
| **ORM/Client** | Supabase JS Client | Official SDK, type-safe |
| **Sync Strategy** | Optimistic update + background sync | UX tetap snappy, offline tetap jalan |
| **Conflict Resolution** | Last-write-wins (per field, by `updatedAt`) | Sederhana, cocok untuk data personal |

---

### 16.4 Database Schema Supabase (PostgreSQL)

```sql
-- Enable Row Level Security
-- User hanya bisa akses data milik sendiri

CREATE TABLE transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT CHECK (type IN ('income', 'expense')),
  amount      INTEGER NOT NULL,
  category    TEXT NOT NULL,
  merchant    TEXT,
  notes       TEXT,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  source      TEXT CHECK (source IN ('manual', 'scan')),
  is_deleted  BOOLEAN DEFAULT FALSE   -- soft delete untuk sync
);

CREATE TABLE debts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT CHECK (type IN ('hutang', 'piutang')),
  person      TEXT NOT NULL,
  amount      INTEGER NOT NULL,
  due_date    DATE,
  description TEXT,
  status      TEXT CHECK (status IN ('active', 'paid', 'overdue')) DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  paid_at     TIMESTAMPTZ,
  notes       TEXT,
  is_deleted  BOOLEAN DEFAULT FALSE
);

CREATE TABLE goals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category     TEXT NOT NULL,
  limit_amount INTEGER NOT NULL,
  month        TEXT NOT NULL,  -- "2026-02"
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category, month)
);

CREATE TABLE insight_cache (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  content      TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- Row Level Security Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own data" ON transactions
  USING (auth.uid() = user_id);

-- (repeat untuk semua tabel)
```

---

### 16.5 Sync Strategy (Offline-First)

```
Skenario 1: Online
  User input → IndexedDB (instant) → background sync ke Supabase
  Supabase update → merge ke IndexedDB (jika ada conflict: updatedAt terbaru menang)

Skenario 2: Offline
  User input → IndexedDB saja (tandai pending_sync = true)
  Saat online kembali → sync queue diproses satu per satu

Skenario 3: Multi-device
  Device A input → Supabase → Supabase Realtime push ke Device B → Device B update IndexedDB
```

**Field tambahan di IndexedDB untuk sync:**
```typescript
// Tambahan field di semua tabel lokal:
pendingSync: boolean    // true = belum tersync ke cloud
syncedAt?: number       // timestamp terakhir berhasil sync
serverUpdatedAt?: number // updatedAt dari server (untuk conflict detection)
```

---

### 16.6 Auth Flow (Supabase Auth)

```
User buka app (pertama kali)
    ↓
Tampilkan opsi:
    [Lanjut tanpa akun]  ←── IndexedDB only (existing behavior)
    [Masuk / Daftar]     ←── Supabase Auth
        ↓
    Pilih: Google / Email magic link / Email+Password
        ↓
    Login sukses → JWT token disimpan → sync data lokal ke cloud
        ↓
    App aktif mode sync
```

> **Prinsip:** Tidak ada fitur yang hilang jika user tidak login. Login hanya menambah sync & backup.

---

### 16.7 Migration Tool (IndexedDB → Cloud)

```typescript
// src/lib/migration.ts
// Dijalankan satu kali saat user pertama kali login

export async function migrateLocalDataToCloud(userId: string) {
  const localTransactions = await db.transactions.toArray()
  const localGoals = await db.goals.toArray()
  const localDebts = await db.debts.toArray()

  // Upload batch ke Supabase
  // Handle duplicate (upsert by id)
  // Update pendingSync = false setelah berhasil

  // Progress UI: "Menyinkronkan data lokal kamu... (45/120)"
}
```

---

### 16.8 Phase Migrasi

```
Phase A — Persiapan (sebelum launch Pro):
  🔲 Setup project Supabase (free tier)
  🔲 Buat schema tabel + RLS policies
  🔲 Install @supabase/supabase-js
  🔲 Buat src/lib/supabase.ts (client init)
  🔲 Tambah NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY ke .env.local

Phase B — Auth Layer:
  🔲 Buat src/app/auth/ (login/signup page minimal)
  🔲 Buat authStore.ts (Zustand: session, user, isLoggedIn)
  🔲 Integrasi Supabase Auth (Google OAuth + Email magic link)
  🔲 Banner opsional di app: "Login untuk backup otomatis"

Phase C — Sync Layer:
  🔲 Tambah field pendingSync, syncedAt ke IndexedDB schema
  🔲 Buat src/lib/sync.ts (sync queue processor)
  🔲 Trigger sync: saat login, saat online kembali, background interval
  🔲 UI indikator sync status (ikon cloud kecil di header)

Phase D — Migration Tool:
  🔲 Buat migrateLocalDataToCloud() — satu kali saat login pertama
  🔲 Progress modal saat migration berjalan
  🔲 Rollback jika gagal di tengah jalan

Phase E — Multi-device Realtime:
  🔲 Subscribe Supabase Realtime untuk tabel transactions, debts, goals
  🔲 Merge incoming changes ke IndexedDB
  🔲 Conflict resolution: last updatedAt wins
```

---

### 16.9 Timeline & Prioritas

| Phase | Kapan | Syarat |
|-------|-------|--------|
| **Utang Piutang** (Sek. 15) | Sekarang (Phase 4 tambahan) | Tidak butuh backend |
| **Auth Layer** | Saat launch fitur Pro | Butuh user base ≥ 500 |
| **Sync Layer** | Bersamaan dengan Pro launch | Auth sudah jalan |
| **Migration Tool** | Bersamaan dengan Sync | Untuk user lama |
| **Realtime Multi-device** | Setelah stable | Pro feature |
| **PWA Push Notification** | Post-sync | Service Worker sudah aktif |

---

### 16.10 Biaya Estimasi (Supabase)

| Tier | Harga | Limit |
|------|-------|-------|
| Free | $0/bulan | 500MB DB, 50rb MAU, 5GB transfer |
| Pro | $25/bulan | 8GB DB, unlimited MAU, 250GB transfer |

> Untuk 0–5.000 user, Free tier Supabase sudah cukup.

---

---

## 17. Fitur Recurring Transactions

> Mengurangi friction pencatatan dengan auto-generate transaksi rutin bulanan (sewa, cicilan, langganan, dll).

---

### 17.1 Konsep

Banyak pengeluaran bersifat tetap dan berulang setiap bulan. Saat ini user harus input ulang manual — fitur ini menghilangkan pekerjaan itu.

**Dua mode:**
| Mode | Deskripsi |
|------|-----------|
| **Auto-create** | Transaksi otomatis dibuat saat tanggal jatuh tempo tiba |
| **Reminder** | Muncul notifikasi UI "Ada X transaksi rutin hari ini, catat sekarang?" |

Untuk MVP, gunakan **Reminder mode** (lebih aman, user tetap konfirmasi sebelum data masuk).

---

### 17.2 Database Schema — Tambahan di `Transaction`

```typescript
// Tambahan field di interface Transaction (src/types/index.ts)
interface Transaction {
  // ...field existing...
  isRecurring?: boolean       // apakah transaksi ini template recurring
  recurringDay?: number       // tanggal dalam bulan: 1–28 (hindari 29–31)
  recurringId?: string        // ID template yang meng-generate transaksi ini
}
```

**Tabel baru: `recurringTemplates`**
```typescript
interface RecurringTemplate {
  id: string                  // UUID
  type: 'income' | 'expense'
  amount: number
  category: string
  merchant?: string
  notes?: string
  recurringDay: number        // tanggal dalam bulan (1–28)
  isActive: boolean           // bisa di-pause
  lastGeneratedMonth?: string // "2026-03" — tracking bulan terakhir di-generate
  createdAt: number
}
```

---

### 17.3 Store — `recurringStore.ts`

```typescript
interface RecurringStore {
  templates: RecurringTemplate[]
  isLoading: boolean

  // Actions
  loadTemplates: () => Promise<void>
  addTemplate: (t: Omit<RecurringTemplate, 'id' | 'createdAt'>) => Promise<void>
  updateTemplate: (id: string, data: Partial<RecurringTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  toggleActive: (id: string) => Promise<void>

  // Generator
  getPendingToday: () => RecurringTemplate[]
  // → template yang recurringDay === today && lastGeneratedMonth !== currentMonth
}
```

---

### 17.4 Logic Reminder

```typescript
// Di Dashboard (src/app/page.tsx) — cek saat mount:
const pending = recurringStore.getPendingToday()
// → tampilkan RecurringReminderBanner jika pending.length > 0

// User tap "Catat Sekarang":
// → untuk setiap template di pending:
//   1. addTransaction({ ...template, date: today, source: 'recurring', recurringId: template.id })
//   2. updateTemplate(id, { lastGeneratedMonth: currentMonth })
// → toast: "3 transaksi rutin berhasil dicatat"
```

---

### 17.5 UI — Halaman Recurring (`/recurring`)

```
┌─────────────────────────────────────┐
│  ← Transaksi Rutin                  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔁 Setiap tanggal 1        │    │
│  │  Kost / Sewa                │    │
│  │  🏠 Tagihan · Rp 1.200.000  │    │
│  │  [Aktif ●]  [Edit] [Hapus]  │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  🔁 Setiap tanggal 5        │    │
│  │  Spotify Premium            │    │
│  │  🎵 Hiburan · Rp 54.990     │    │
│  │  [Aktif ●]  [Edit] [Hapus]  │    │
│  └─────────────────────────────┘    │
│                                     │
│  [+ Tambah Transaksi Rutin]         │
│                                     │
├─────────────────────────────────────┤
│  [🏠] [📋]  [+]  [💳] [📈] [🎯]    │
└─────────────────────────────────────┘
```

**Form tambah template (BottomSheet):**
- Toggle: Pengeluaran / Pemasukan
- Nominal (format Rupiah)
- Kategori (CategoryPicker)
- Nama/Merchant
- Tanggal berulang: pill 1–28 (scroll horizontal)
- Catatan (opsional)

---

### 17.6 Komponen `RecurringReminderBanner`

```
┌─────────────────────────────────────┐
│  🔁 2 transaksi rutin hari ini      │
│  Kost Rp 1.2jt + Spotify Rp 54rb   │
│  [Catat Sekarang]  [Nanti]          │
└─────────────────────────────────────┘
```

- Muncul di Dashboard di atas AI Insight Card
- "Catat Sekarang" → batch-insert semua pending + update lastGeneratedMonth
- "Nanti" → dismiss banner untuk hari ini (localStorage flag `hematin_recurring_dismissed_YYYY-MM-DD`)

---

### 17.7 Integrasi `TransactionForm`

Di form tambah transaksi manual, tambah toggle opsional:
```
□ Ulangi setiap bulan
   Tanggal: [15 ▼]
```
Jika dicentang → saat simpan, buat `RecurringTemplate` sekaligus dengan `recurringDay` yang dipilih.

---

### 17.8 Langkah Implementasi

| # | File | Aksi |
|---|------|------|
| 60 | `src/types/index.ts` | Tambah `RecurringTemplate` interface + field opsional di `Transaction` |
| 61 | `src/lib/db.ts` | Version bump (v3) + tabel `recurringTemplates` |
| 62 | `src/stores/recurringStore.ts` | Zustand + Dexie, `getPendingToday()` |
| 63 | `src/app/recurring/page.tsx` | Halaman daftar + form template |
| 64 | `src/components/dashboard/RecurringReminderBanner.tsx` | Banner di dashboard |
| 65 | `src/app/page.tsx` | Integrasi `RecurringReminderBanner` + `loadTemplates` |
| 66 | `src/components/transactions/TransactionForm.tsx` | Toggle "Ulangi setiap bulan" |
| 67 | `src/components/transactions/TransactionItem.tsx` | Ikon 🔁 untuk source='recurring' |
| 68 | `src/app/transactions/page.tsx` | Link "Rutin" di header → `/recurring` |

> Akses halaman `/recurring` via tombol "Rutin" di header halaman Transaksi (tidak menambah tab BottomNav agar tetap bersih).

---

### 17.9 Edge Cases

| Case | Handling |
|------|----------|
| User tidak buka app di tanggal jatuh tempo | Cek: `recurringDay <= today's date && lastGeneratedMonth !== currentMonth` → masih muncul |
| User buka app di tanggal 30, template `recurringDay = 31` | Skip bulan ini — tidak ada tanggal 31 |
| Template dinonaktifkan | `isActive = false` → tidak muncul di reminder |
| User sudah catat manual, lupa ada recurring | Tidak ada auto-detect, user dismiss banner saja |

---

---

---

## 18. Tipe Transaksi: Saving (Tabungan & Investasi)

> Menambahkan tipe ketiga `saving` di samping `income` dan `expense`, untuk mencatat alokasi dana ke tabungan dan investasi secara terpisah — bukan sebagai "pengeluaran konsumtif".

---

### 18.1 Latar Belakang & Keputusan Desain

| Pertanyaan | Jawaban |
|------------|---------|
| Apakah tabungan = pengeluaran? | **Tidak** — uang tidak "habis", hanya berpindah ke aset |
| Kenapa bukan tipe `transfer`? | `transfer` ambigu — bisa ke orang lain atau pembayaran |
| Mengapa tidak cukup pakai kategori? | Tipe mempengaruhi kalkulasi balance, warna UI, dan AI insight |
| Apakah saving mempengaruhi saldo? | **Ya** — uang keluar dari kantong, tapi ditampilkan terpisah dari expense |

**Model akhir:**
```
income   → uang masuk (gaji, freelance, bonus, dll)
expense  → uang keluar konsumtif (makan, transport, tagihan, dll)
saving   → uang dialokasikan ke tabungan / investasi
```

**Formula saldo dashboard:**
```
Saldo Estimasi = Total Income − Total Expense − Total Saving
```

---

### 18.2 Kategori Saving

Tambah `SAVING_CATEGORIES` baru di `src/lib/categories.ts`:

```typescript
export const SAVING_CATEGORIES: Category[] = [
  { id: 'tabungan',    name: 'Tabungan',      icon: '🏦', color: '#0D9488', bgColor: '#CCFBF1' },
  { id: 'deposito',    name: 'Deposito',      icon: '💵', color: '#0891B2', bgColor: '#CFFAFE' },
  { id: 'reksa-dana',  name: 'Reksa Dana',    icon: '📊', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'saham',       name: 'Saham',         icon: '📈', color: '#16A34A', bgColor: '#DCFCE7' },
  { id: 'crypto',      name: 'Crypto',        icon: '🪙', color: '#D97706', bgColor: '#FEF3C7' },
  { id: 'emas',        name: 'Emas',          icon: '🥇', color: '#CA8A04', bgColor: '#FEF9C3' },
  { id: 'dana-darurat',name: 'Dana Darurat',  icon: '🛡️', color: '#DC2626', bgColor: '#FEE2E2' },
  { id: 'properti',    name: 'Properti',      icon: '🏠', color: '#64748B', bgColor: '#F1F5F9' },
  { id: 'other-saving',name: 'Lainnya',       icon: '📦', color: '#64748B', bgColor: '#F1F5F9' },
]
```

**Catatan:** Hapus kategori `savings` dari `EXPENSE_CATEGORIES` (saat ini ada `id: 'savings'`) karena sudah pindah ke tipe `saving`.

---

### 18.3 Perubahan Type System

**File: `src/types/index.ts`**

```typescript
// Sebelum
type: 'income' | 'expense'

// Sesudah
type: 'income' | 'expense' | 'saving'
```

Update semua interface yang menggunakan union ini:
- `Transaction.type`
- `RecurringTemplate.type`

Update `FinancialContext`:
```typescript
export interface FinancialContext {
  total_income: number
  total_expense: number
  total_saving: number        // ← BARU
  saving_rate: number         // ← BARU: total_saving / total_income * 100 (%)
  cash_flow_status: 'positive' | 'neutral' | 'negative'
  balance: number             // income - expense - saving
  // ...field lainnya tetap
}
```

---

### 18.4 File yang Terkena Perubahan

| # | File | Jenis Perubahan |
|---|------|-----------------|
| 1 | `src/types/index.ts` | Tambah `'saving'` ke union type `Transaction.type` & `RecurringTemplate.type`; tambah `total_saving` & `saving_rate` ke `FinancialContext` |
| 2 | `src/lib/categories.ts` | Tambah `SAVING_CATEGORIES[]`; hapus `savings` dari `EXPENSE_CATEGORIES`; update `getCategoryById` & `getCategoryName` untuk terima `'saving'` |
| 3 | `src/lib/calculations.ts` | Hitung `total_saving` & `saving_rate`; update rumus `balance = income - expense - saving`; update `buildFinancialContext` |
| 4 | `src/components/transactions/TransactionForm.tsx` | Tambah tab/toggle ketiga "Tabungan" di type selector; tampilkan `SAVING_CATEGORIES` saat type='saving' |
| 5 | `src/components/transactions/CategoryPicker.tsx` | Terima prop `type: 'income' \| 'expense' \| 'saving'`; tampilkan `SAVING_CATEGORIES` untuk type saving |
| 6 | `src/components/transactions/TransactionItem.tsx` | Tambah warna & ikon untuk type saving (warna: teal/emerald, ikon piggy bank atau chart) |
| 7 | `src/components/transactions/TransactionList.tsx` | Update filter & group jika ada filter per tipe |
| 8 | `src/app/page.tsx` (Dashboard) | Tambah summary card "Tabungan" di samping Income & Expense; update hero balance menggunakan rumus baru |
| 9 | `src/app/reports/page.tsx` | Tambah section tabungan/investasi: total saving bulan ini, breakdown per kategori saving, saving rate % |
| 10 | `src/components/reports/CashFlowChart.tsx` | Tambah bar ketiga (saving) di grouped bar chart — warna teal |
| 11 | `src/components/reports/CategoryDonut.tsx` | Tambah toggle: tampilkan donut expense ATAU donut saving |
| 12 | `src/app/goals/page.tsx` | Goals hanya berlaku untuk tipe `expense` — filter kategori saving dari goal picker |
| 13 | `src/app/recurring/page.tsx` | Tambah opsi type='saving' di form recurring template |
| 14 | `src/app/api/insight/route.ts` | Update prompt AI — sertakan `total_saving`, `saving_rate`, dan konteks positif jika user rajin menabung |
| 15 | `src/app/scan/page.tsx` | Scan default type tetap `expense`; user bisa ganti ke `saving` manual jika perlu |

---

### 18.5 Logika Warna & Visual untuk Tipe Saving

```
income  → hijau  (Emerald-500, #10B981)
expense → merah  (Red-500, #EF4444)
saving  → teal   (Teal-500, #14B8A6)
```

Di `TransactionItem.tsx`:
```tsx
const typeConfig = {
  income:  { color: 'text-emerald-600', bg: 'bg-emerald-50', prefix: '+', label: 'Pemasukan' },
  expense: { color: 'text-red-500',     bg: 'bg-red-50',     prefix: '-', label: 'Pengeluaran' },
  saving:  { color: 'text-teal-600',    bg: 'bg-teal-50',    prefix: '→', label: 'Tabungan' },
}
```

---

### 18.6 Perubahan Dashboard

**Summary Cards** (saat ini: Income + Expense):

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 💰 Pemasukan │  │ 💸 Pengeluaran│  │ 🏦 Tabungan  │
│  Rp 5.000.000│  │  Rp 2.500.000│  │  Rp 500.000  │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Hero Card** — Saldo Estimasi:
```
Saldo Estimasi = Income − Expense − Saving
               = 5.000.000 − 2.500.000 − 500.000
               = Rp 2.000.000
```

**Cash Flow Status** tetap berdasarkan `balance` (bukan expense saja).

---

### 18.7 Perubahan AI Insight

Update context yang dikirim ke AI prompt di `src/app/api/insight/route.ts`:

```
Bulan ini:
- Pemasukan: Rp 5.000.000
- Pengeluaran: Rp 2.500.000
- Tabungan/Investasi: Rp 500.000 (saving rate: 10%)
- Saldo estimasi: Rp 2.000.000
```

AI bisa memberikan insight seperti:
- *"Kamu sudah menabung 10% dari pendapatan bulan ini — pertahankan!"*
- *"Saving rate kamu masih di bawah 20%, coba tingkatkan sedikit."*
- *"Belum ada alokasi tabungan bulan ini — coba sisihkan minimal 10% dari gaji."*

---

### 18.8 Langkah Implementasi

| # | File | Aksi |
|---|------|------|
| 1 | `src/types/index.ts` | Tambah `'saving'` ke union, tambah `total_saving` & `saving_rate` ke `FinancialContext` |
| 2 | `src/lib/categories.ts` | Tambah `SAVING_CATEGORIES`, hapus `savings` dari `EXPENSE_CATEGORIES`, update helper functions |
| 3 | `src/lib/calculations.ts` | Update `buildFinancialContext` — hitung saving, saving rate, update balance |
| 4 | `src/components/transactions/CategoryPicker.tsx` | Handle type `'saving'` → tampilkan SAVING_CATEGORIES |
| 5 | `src/components/transactions/TransactionForm.tsx` | Tambah tab "Tabungan" ke type selector |
| 6 | `src/components/transactions/TransactionItem.tsx` | Tambah visual config untuk type saving |
| 7 | `src/app/page.tsx` | Tambah Summary Card tabungan, update balance formula |
| 8 | `src/components/reports/CashFlowChart.tsx` | Tambah bar saving (teal) ke grouped chart |
| 9 | `src/components/reports/CategoryDonut.tsx` | Tambah toggle expense/saving donut |
| 10 | `src/app/reports/page.tsx` | Tampilkan saving rate + breakdown saving |
| 11 | `src/app/goals/page.tsx` | Filter saving dari category picker goals |
| 12 | `src/app/recurring/page.tsx` | Tambah opsi type saving di form recurring |
| 13 | `src/app/api/insight/route.ts` | Update prompt dengan data saving |
| 14 | `src/lib/migrations.ts` | Buat fungsi `migrateSavingsFromExpense()` — one-time migration data lama |
| 15 | `src/stores/transactionStore.ts` | Panggil `migrateSavingsFromExpense()` di awal `loadTransactions()` |

---

### 18.9 FAB Expand Menu — Keputusan

FAB saat ini sudah memiliki radial menu dengan 3 item: **Scan** (150°), **Utang** (90°), **Settings** (30°).

**Keputusan: Tidak tambah item FAB baru untuk Saving.**

Alasan:
- 4 item radial di mobile mulai terasa sesak
- Entry point saving sudah ada di form transaksi — user tap FAB utama → form terbuka → pilih tab "Tabungan"
- Konsisten dengan UX yang sudah ada (expense & income juga tidak punya shortcut FAB sendiri)

```
[FAB utama] → bottom sheet TransactionForm
               ├── Tab: Pengeluaran  (default)
               ├── Tab: Pemasukan
               └── Tab: Tabungan  ← tab baru
```

---

### 18.10 Migrasi Data Lama

**Masalah:** Sebelum fitur ini ada, kategori `savings` sudah ada di `EXPENSE_CATEGORIES`. User yang pernah input tabungan sebagai pengeluaran akan memiliki data:
```
{ type: 'expense', category: 'savings', amount: ... }
```

**Dampak jika tidak dimigrasi:**
- `total_expense` tercampur dengan nilai tabungan → laporan tidak akurat
- `total_saving` = 0 meski user sudah pernah mencatat tabungan
- AI insight salah baca kondisi keuangan user

**Solusi: One-time auto-migration saat app load**

```typescript
// src/lib/migrations.ts (file baru)
export async function migrateSavingsFromExpense() {
  const FLAG = 'hematin_migration_saving_v1'
  if (localStorage.getItem(FLAG)) return // sudah pernah jalan, skip

  await db.transactions
    .where({ type: 'expense', category: 'savings' })
    .modify({ type: 'saving', category: 'tabungan' })

  localStorage.setItem(FLAG, '1')
}
```

Panggil di `transactionStore.ts` → `loadTransactions()` sebelum fetch data:
```typescript
await migrateSavingsFromExpense()
const txs = await db.transactions.toArray()
```

**Properti migrasi:**
- Otomatis, satu kali, tidak butuh konfirmasi user
- Intent jelas: user pilih kategori "Tabungan" di expense = maksudnya menabung
- Flag di localStorage → tidak pernah jalan ulang meski app di-refresh

---

### 18.11 Edge Cases & Catatan

| Case | Handling |
|------|----------|
| Data lama `type: 'expense', category: 'savings'` | Auto-migrate ke `type: 'saving', category: 'tabungan'` saat pertama load (Section 18.10) |
| User scan struk → default type | Tetap `expense` — scanner tidak akan otomatis detect saving |
| Goals untuk kategori saving | Tidak relevan — goals hanya untuk expense; filter saving dari goal picker |
| Recurring template type saving | Boleh — cocok untuk cicilan investasi rutin (e.g., reksa dana otomatis tiap tanggal 1) |
| `saving_rate` jika income = 0 | Tampilkan `0%` — guard division by zero |
| Migration gagal (IndexedDB error) | Log error, tidak set flag → akan retry di load berikutnya |

---

## 19. Fitur Natural Language Input

> User bisa ketik transaksi dengan bahasa bebas → AI parse → preview + konfirmasi → simpan ke IndexedDB.

### 19.1 Contoh Use Case

```
"beli kopi 15rb sama makan siang 35rb"     → 2 expense (food)
"gajian 5jt"                               → 1 income (salary)
"bayar listrik 250000 sama bensin kemarin" → 2 expense, date kemarin
"nabung 1jt ke BCA"                        → 1 saving (tabungan)
```

### 19.2 Arsitektur Flow

```
User ketik teks bebas
  → POST /api/parse-nl (AI parsing)
    → JSON array ParsedTransaction[]
  → NLPreviewSheet (preview + edit per item)
    → User konfirmasi / edit / hapus
  → Bulk addTransaction() ke IndexedDB
```

### 19.3 Types Baru (`src/types/index.ts`)

```ts
export interface ParsedTransaction {
  type: 'income' | 'expense' | 'saving'
  amount: number
  category: string
  description: string
  date: string          // ISO "YYYY-MM-DD"
  confidence: 'high' | 'medium' | 'low'
}

export interface NLParseResult {
  transactions: ParsedTransaction[]
  rawInput: string
  parseNote?: string    // catatan AI jika ada ambiguitas
}
```

### 19.4 File yang Terlibat

| File | Aksi |
|---|---|
| `src/types/index.ts` | Modifikasi — tambah `ParsedTransaction`, `NLParseResult` |
| `src/lib/nl-parse.ts` | **Buat baru** — shared helper: `extractJSON()`, `sanitizeParsedTransaction()`, `parseIndonesianAmount()` |
| `src/app/api/parse-nl/route.ts` | **Buat baru** — API route NL parsing |
| `src/components/transactions/NLInputBar.tsx` | **Buat baru** — textarea input + loading state |
| `src/components/transactions/NLPreviewSheet.tsx` | **Buat baru** — preview + edit inline + konfirmasi |
| `src/app/page.tsx` | Modifikasi — tambah kartu "Ketik Bebas" di quick actions |
| `src/app/api/scan/route.ts` | Modifikasi minor — import `extractJSON` dari shared helper |

### 19.5 API Route (`/api/parse-nl`)

Header sama dengan `/api/scan`: `X-AI-Provider`, `X-AI-Model`, `X-AI-Key`.
Body: `{ text: string, today: string }` — `today` dikirim dari client (format `YYYY-MM-DD`) agar "kemarin" sesuai timezone user.

**System Prompt Inti:**
- Parse format angka Indonesia: `15rb` = 15000, `5jt` = 5000000, `1.5jt` = 1500000
- Deteksi tipe dari kata kunci: beli/bayar/makan → expense; gajian/terima → income; nabung/invest → saving
- Deteksi tanggal relatif: "kemarin" = today-1, "minggu lalu" = today-7, tanpa keterangan = today
- Return: raw JSON valid tanpa markdown, format `{ transactions: [...], parseNote: null }`

**Sanitasi di route handler:**
- `amount` harus > 0
- `category` tidak dikenal → fallback ke `'other'` / `'other-income'` / `'other-saving'`
- `date` tidak valid → fallback ke `today`
- `confidence` tidak ada → fallback ke `'medium'`

### 19.6 Komponen UI

**`NLInputBar.tsx`**
- `textarea` auto-resize, Ctrl+Enter untuk kirim
- Placeholder: `"beli kopi 15rb, makan siang 35rb..."`
- State: `idle | loading | error`
- Disabled + hint kalau AI belum dikonfigurasi di Settings

**`NLPreviewSheet.tsx`**
- BottomSheet scrollable (`max-h-[85dvh]`)
- Per kartu transaksi: edit inline (amount, category, date), hapus dengan animasi
- Badge confidence: hijau (high) / kuning (medium) / merah (low)
- Tombol "Simpan Semua" sticky di bawah
- `transactions.length === 0` → toast info "AI tidak menemukan transaksi"

### 19.7 Integrasi Dashboard

Quick actions di `page.tsx` jadi 3 kartu:
```
[Catat Transaksi]  [Scan Struk]
[   Ketik Bebas (full width)  ]
```

State baru di `page.tsx`:
```ts
const [showNLInput, setShowNLInput] = useState(false)
const [nlParseResult, setNLParseResult] = useState<NLParseResult | null>(null)
```

### 19.8 Keputusan Teknis

- **Entry point**: Kartu ketiga di Quick Actions (bukan tab di TransactionForm — state tidak bercampur)
- **`today` dari client**: Konsisten dengan pola AI insight, hindari timezone mismatch server/user
- **Kategori fallback**: Sanitizer di API route handle mapping → tidak perlu logika di client
- **Provider**: Mengikuti settingan user yang sudah ada (Gemini Flash direkomendasikan — gratis 1500 req/hari)

### 19.9 Urutan Implementasi

| Step | Task | Estimasi |
|---|---|---|
| 1 | Tambah types ke `src/types/index.ts` | 5 menit |
| 2 | Buat `src/lib/nl-parse.ts` (shared helpers) | 10 menit |
| 3 | Buat `src/app/api/parse-nl/route.ts` + test manual | 30 menit |
| 4 | Buat `NLInputBar.tsx` | 30 menit |
| 5 | Buat `NLPreviewSheet.tsx` (paling kompleks) | 45 menit |
| 6 | Integrasi di `src/app/page.tsx` | 20 menit |
| 7 | Polish: dark mode, mobile keyboard, flow antar sheet | 20 menit |

**Total estimasi: ~2.5 jam**

---

*Dokumen ini adalah living document — akan diupdate seiring pengerjaan.*

*Dibuat: 26 Februari 2026 | Terakhir diupdate: 11 April 2026 (v14 — Section 20: Cicilan Hutang/Piutang)*

---

## 20. Cicilan Hutang/Piutang (Installment + Reminder)

> Melacak pembayaran bertahap (cicilan) untuk hutang/piutang, lengkap dengan reminder otomatis saat jatuh tempo cicilan tiap bulan.

---

### 20.1 Konsep

Saat ini `Debt` hanya support satu kali bayar penuh (mark as paid). Fitur ini menambah mode **cicilan** di mana:
- Total hutang/piutang dibagi menjadi cicilan per bulan
- Setiap pembayaran dicatat di tabel terpisah (`debtPayments`)
- Sisa hutang dihitung otomatis: `amount - totalPaid`
- Reminder muncul di halaman `/debts` saat tanggal cicilan tiba bulan ini

**Dua mode Debt:**
| Mode | Deskripsi |
|---|---|
| **Lunas Sekaligus** | Behavior existing — satu kali bayar, status jadi `paid` |
| **Cicilan Bulanan** | Bayar bertahap tiap bulan — sisa berkurang, lunas otomatis saat sisa = 0 |

---

### 20.2 Perubahan Database Schema

**Modifikasi interface `Debt` (`src/types/index.ts`):**
```typescript
export interface Debt {
  // --- field existing ---
  id: string
  type: 'hutang' | 'piutang'
  person: string
  amount: number              // TOTAL hutang/piutang (tidak berubah)
  dueDate?: string            // untuk mode lunas sekaligus
  description?: string
  status: 'active' | 'paid' | 'overdue' | 'partial' // tambah 'partial'
  createdAt: number
  paidAt?: number
  notes?: string

  // --- field baru untuk cicilan ---
  isCicilan?: boolean         // true = mode cicilan
  cicilanAmount?: number      // nominal per cicilan (mis. 500.000/bulan)
  cicilanDay?: number         // tanggal jatuh tempo tiap bulan (1–28)
  cicilanStartMonth?: string  // "2026-04" — bulan cicilan pertama
}
```

**Tabel baru: `debtPayments` (`src/lib/db.ts`):**
```typescript
export interface DebtPayment {
  id: string
  debtId: string              // FK ke Debt.id
  amount: number              // nominal yang dibayarkan (boleh ≠ cicilanAmount)
  paidDate: string            // ISO date "YYYY-MM-DD"
  month: string               // "YYYY-MM" — bulan cicilan yang dibayar ini
  notes?: string
  createdAt: number
}
```

**Kalkulasi otomatis:**
- `totalPaid` = SUM(`debtPayments.amount` WHERE `debtId = id`)
- `remaining` = `debt.amount - totalPaid`
- `status` → otomatis `'paid'` jika `remaining <= 0`
- `status` → `'partial'` jika `totalPaid > 0 && remaining > 0`
- `status` → `'overdue'` jika cicilan bulan ini belum dibayar dan `cicilanDay < today`

---

### 20.3 Perubahan Store — `debtStore.ts`

Tambah actions dan computed baru:

```typescript
interface DebtStore {
  // --- existing ---
  debts: Debt[]
  isLoading: boolean
  loadDebts: () => Promise<void>
  addDebt: (data) => Promise<void>
  markAsPaid: (id, notes?) => Promise<void>
  deleteDebt: (id) => Promise<void>
  updateDebt: (id, data) => Promise<void>

  // --- baru: payments ---
  payments: DebtPayment[]
  loadPayments: () => Promise<void>
  addPayment: (data: Omit<DebtPayment, 'id' | 'createdAt'>) => Promise<void>
  deletePayment: (id: string) => Promise<void>
  getPaymentsByDebt: (debtId: string) => DebtPayment[]
  getTotalPaid: (debtId: string) => number
  getRemaining: (debtId: string) => number

  // --- baru: cicilan reminder ---
  getPendingCicilanToday: () => Debt[]
  // → debt.isCicilan === true &&
  //   debt.cicilanDay === today.getDate() &&
  //   belum ada payment untuk bulan ini
}
```

**Logic `getPendingCicilanToday()`:**
```typescript
getPendingCicilanToday: () => {
  const today = new Date()
  const todayDay = today.getDate()
  const currentMonth = format(today, 'yyyy-MM')

  return get().debts.filter((d) => {
    if (!d.isCicilan || d.status === 'paid') return false
    if (d.cicilanDay !== todayDay) return false

    // cek apakah bulan ini sudah ada payment
    const payments = get().getPaymentsByDebt(d.id)
    const paidThisMonth = payments.some((p) => p.month === currentMonth)
    return !paidThisMonth
  })
}
```

---

### 20.4 File yang Terlibat

| File | Aksi |
|---|---|
| `src/types/index.ts` | Modifikasi — tambah field cicilan di `Debt`, tambah interface `DebtPayment` |
| `src/lib/db.ts` | Modifikasi — tambah tabel `debtPayments` ke Dexie schema, bump versi DB |
| `src/stores/debtStore.ts` | Modifikasi — tambah state `payments`, actions baru, `getPendingCicilanToday()` |
| `src/components/debts/DebtForm.tsx` | Modifikasi — tambah toggle "Cicilan Bulanan" + field cicilanAmount + cicilanDay |
| `src/components/debts/DebtCard.tsx` | Modifikasi — tampilkan progress bar sisa, tombol "Bayar Cicilan" |
| `src/components/debts/PaymentSheet.tsx` | **Buat baru** — BottomSheet form catat pembayaran cicilan |
| `src/components/debts/PaymentHistory.tsx` | **Buat baru** — daftar riwayat pembayaran per debt |
| `src/components/debts/CicilanReminderBanner.tsx` | **Buat baru** — banner reminder cicilan jatuh tempo hari ini |
| `src/app/debts/page.tsx` | Modifikasi — tampilkan `CicilanReminderBanner`, update layout kartu cicilan |

---

### 20.5 UI — Perubahan Form Tambah Hutang

Tambah toggle di `DebtForm.tsx`:

```
┌─────────────────────────────────────┐
│  ── Tambah Hutang ──                │
│                                     │
│  [Hutang]  [Piutang]               │
│                                     │
│  Nama: [Budi              ]         │
│  Total: [Rp 2.000.000     ]         │
│                                     │
│  Pembayaran:                        │
│  ○ Lunas Sekaligus                  │
│  ● Cicilan Bulanan                  │
│                                     │
│  (jika Cicilan Bulanan dipilih)     │
│  Per cicilan: [Rp 500.000  ]        │
│  Tanggal bayar tiap bulan: [15 ▼]   │
│  Mulai bulan: [April 2026  ]        │
│                                     │
│  Jatuh tempo (opsional): [__/__/__] │
│  Keterangan: [               ]      │
│                                     │
│  [Simpan]                           │
└─────────────────────────────────────┘
```

---

### 20.6 UI — DebtCard untuk Mode Cicilan

```
┌─────────────────────────────────────┐
│  🟡 Budi                            │
│  Total: Rp 2.000.000                │
│  ████████░░░░░░░░  4/8 cicilan      │  ← progress bar
│  Sudah dibayar: Rp 1.000.000        │
│  Sisa: Rp 1.000.000                 │
│  Cicilan: Rp 500.000 / tgl 15       │
│                                     │
│  [Bayar Cicilan]  [Riwayat]         │
└─────────────────────────────────────┘
```

**Progress bar:**
- Warna: biru (< 50% lunas), hijau (≥ 50%), emerald (≥ 90%)
- Teks: `X/Y cicilan` atau `Rp X dari Rp Y`

---

### 20.7 UI — PaymentSheet (Baru)

BottomSheet yang muncul saat tap "Bayar Cicilan":

```
┌─────────────────────────────────────┐
│  ── Catat Pembayaran ──             │
│  Budi · Sisa Rp 1.000.000          │
│                                     │
│  Nominal:                           │
│  [Rp 500.000     ] ← pre-fill       │
│  (default: cicilanAmount)           │
│                                     │
│  Tanggal bayar: [11 Apr 2026]       │
│                                     │
│  Catatan: [               ]         │
│                                     │
│  [Simpan Pembayaran]                │
└─────────────────────────────────────┘
```

Setelah simpan:
- `addPayment()` ke IndexedDB
- Cek apakah `remaining <= 0` → otomatis `markAsPaid()`
- Toast: "Cicilan bulan ini berhasil dicatat 🎉" atau "Hutang ke Budi LUNAS! 🎊"

---

### 20.8 UI — CicilanReminderBanner (Baru)

Tampil di halaman `/debts` saat ada cicilan jatuh tempo hari ini:

```
┌─────────────────────────────────────┐
│  💳 Cicilan jatuh tempo hari ini    │
│  Budi Rp 500rb · Mama Rp 300rb     │
│  [Catat Sekarang]  [Nanti]          │
└─────────────────────────────────────┘
```

- "Catat Sekarang" → buka PaymentSheet untuk item pertama, lanjut ke berikutnya
- "Nanti" → dismiss dengan localStorage flag `hematin_cicilan_dismissed_YYYY-MM-DD`
- Warna: amber/kuning (berbeda dari overdue banner yang merah)

---

### 20.9 PaymentHistory Component (Baru)

Tampil saat tap "Riwayat" di DebtCard:

```
┌─────────────────────────────────────┐
│  ── Riwayat Pembayaran — Budi ──   │
│                                     │
│  Apr 2026   Rp 500.000  15 Apr ✓   │
│  Mar 2026   Rp 500.000  14 Mar ✓   │
│  Feb 2026   Rp 500.000  15 Feb ✓   │  ← scrollable
│  Jan 2026   Rp 500.000  13 Jan ✓   │
│                                     │
│  Total dibayar: Rp 2.000.000        │
│  Sisa: Rp 0 (LUNAS)                │
└─────────────────────────────────────┘
```

---

### 20.10 Dexie DB — Perubahan Versi

```typescript
// src/lib/db.ts — bump versi DB
this.version(X).stores({
  // ... existing tables ...
  debtPayments: '++id, debtId, month, paidDate',
})
```

> Tidak ada migrasi data lama — field baru di `Debt` bersifat opsional, debt existing tetap bekerja normal sebagai mode "lunas sekaligus".

---

### 20.11 Edge Cases

| Case | Handling |
|---|---|
| Bayar lebih dari `cicilanAmount` | Diperbolehkan — sisa berkurang lebih cepat |
| Bayar kurang dari `cicilanAmount` | Diperbolehkan — sisa tetap terhitung, muncul di reminder bulan depan |
| Cicilan ganda dalam satu bulan | Boleh — `month` field tidak unique per debtId |
| `cicilanDay` = 31, bulan hanya 30 hari | Tampilkan reminder di hari terakhir bulan |
| Debt lunas sekaligus + ada payments | Tidak mungkin — toggle di form mutual exclusive |
| Hapus debt | Cascade delete semua `debtPayments` yang terkait |

---

### 20.12 Urutan Implementasi

| Step | Task | Estimasi |
|---|---|---|
| 1 | Tambah `DebtPayment` type + field cicilan di `Debt` (`src/types/index.ts`) | 5 menit |
| 2 | Bump versi Dexie, tambah tabel `debtPayments` (`src/lib/db.ts`) | 10 menit |
| 3 | Update `debtStore.ts` — tambah state payments + actions + `getPendingCicilanToday()` | 30 menit |
| 4 | Update `DebtForm.tsx` — tambah toggle cicilan + field baru | 30 menit |
| 5 | Buat `PaymentSheet.tsx` — form catat pembayaran | 25 menit |
| 6 | Update `DebtCard.tsx` — progress bar + tombol "Bayar Cicilan" + "Riwayat" | 30 menit |
| 7 | Buat `PaymentHistory.tsx` — riwayat per debt | 20 menit |
| 8 | Buat `CicilanReminderBanner.tsx` — banner reminder hari ini | 20 menit |
| 9 | Update `src/app/debts/page.tsx` — integrasi banner + state flow | 20 menit |

**Total estimasi: ~3 jam**
