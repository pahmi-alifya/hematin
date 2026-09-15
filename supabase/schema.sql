-- HEMATIN - Fase 2 (Auth & Backend Infrastructure)
-- Jalankan file ini di Supabase Dashboard → SQL Editor (sekali saja, di project baru).
--
-- Cakupan Fase 2: akun (profiles) + backup cloud per-akun (cloud_wallets & data anaknya).
-- Sharing (wallet_members, activity_log, share_key multi-user RLS) menyusul di Fase 3 -
-- lihat docs/planning-multi-dompet-sharing-auth.md §3.2/§3.3/§4.

-- ─── 1. profiles ────────────────────────────────────────────────────────────
-- 1 row per auth.users, dibuat otomatis lewat trigger saat signup.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Trigger: buat row profiles otomatis begitu user baru signup.
-- Nama diambil dari user_metadata.name yang dikirim saat supabase.auth.signUp().
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Guest'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── 2. cloud_wallets ───────────────────────────────────────────────────────
-- Dompet yang sudah cloud-linked (di-upload otomatis saat register/login,
-- lihat §3.6 planning doc). share_key & share_key_active baru dipakai di Fase 3.

create table if not exists cloud_wallets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  icon text not null default '👛',
  color text not null default '#0EA5E9',
  share_key uuid unique,
  share_key_active boolean not null default false,
  created_at timestamptz not null default now()
);

alter table cloud_wallets enable row level security;

create policy "cloud_wallets_owner_all" on cloud_wallets
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ─── 3. Data anak per-dompet ────────────────────────────────────────────────
-- Skema paralel dengan tabel Dexie lokal (lihat src/types/index.ts), ditambah
-- created_by untuk audit trail (dipakai penuh di Fase 3 saat multi-member).

create table if not exists cloud_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references cloud_wallets(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'saving')),
  amount numeric not null,
  category text not null,
  merchant text,
  notes text,
  date date not null,
  source text not null check (source in ('manual', 'scan', 'recurring')),
  recurring_id uuid,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cloud_goals (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references cloud_wallets(id) on delete cascade,
  category text not null,
  limit_amount numeric not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cloud_debts (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references cloud_wallets(id) on delete cascade,
  type text not null check (type in ('hutang', 'piutang')),
  person text not null,
  amount numeric not null,
  due_date date,
  description text,
  status text not null check (status in ('active', 'paid', 'overdue', 'partial')),
  paid_at bigint,
  notes text,
  is_cicilan boolean not null default false,
  cicilan_amount numeric,
  cicilan_day int,
  cicilan_start_month text,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cloud_debt_payments (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references cloud_wallets(id) on delete cascade,
  debt_id uuid not null references cloud_debts(id) on delete cascade,
  amount numeric not null,
  paid_date date not null,
  month text not null,
  notes text,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists cloud_recurring_templates (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references cloud_wallets(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'saving')),
  amount numeric not null,
  category text not null,
  merchant text,
  notes text,
  recurring_day int not null,
  is_active boolean not null default true,
  last_generated_month text,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table cloud_transactions enable row level security;
alter table cloud_goals enable row level security;
alter table cloud_debts enable row level security;
alter table cloud_debt_payments enable row level security;
alter table cloud_recurring_templates enable row level security;

-- RLS Fase 2: akses HANYA untuk owner dompetnya (belum ada konsep member/role -
-- itu ditambahkan di Fase 3 lewat migration terpisah begitu wallet_members ada).
create policy "cloud_transactions_owner_all" on cloud_transactions
  for all using (
    wallet_id in (select id from cloud_wallets where owner_id = auth.uid())
  ) with check (
    wallet_id in (select id from cloud_wallets where owner_id = auth.uid())
  );

create policy "cloud_goals_owner_all" on cloud_goals
  for all using (
    wallet_id in (select id from cloud_wallets where owner_id = auth.uid())
  ) with check (
    wallet_id in (select id from cloud_wallets where owner_id = auth.uid())
  );

create policy "cloud_debts_owner_all" on cloud_debts
  for all using (
    wallet_id in (select id from cloud_wallets where owner_id = auth.uid())
  ) with check (
    wallet_id in (select id from cloud_wallets where owner_id = auth.uid())
  );

create policy "cloud_debt_payments_owner_all" on cloud_debt_payments
  for all using (
    wallet_id in (select id from cloud_wallets where owner_id = auth.uid())
  ) with check (
    wallet_id in (select id from cloud_wallets where owner_id = auth.uid())
  );

create policy "cloud_recurring_templates_owner_all" on cloud_recurring_templates
  for all using (
    wallet_id in (select id from cloud_wallets where owner_id = auth.uid())
  ) with check (
    wallet_id in (select id from cloud_wallets where owner_id = auth.uid())
  );

-- ─── Setelah menjalankan file ini ──────────────────────────────────────────
-- 1. Authentication → Providers → Email → matikan "Confirm email" (signup langsung aktif,
--    sesuai requirement "email tidak perlu validasi ke email").
-- 2. Authentication → Policies: pastikan "Enable email provider" aktif.
-- 3. Salin Project URL & anon public key (Settings → API) ke .env.local:
--    NEXT_PUBLIC_SUPABASE_URL=...
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
