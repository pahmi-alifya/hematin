-- HEMATIN - Fase 3 (Sharing)
-- Jalankan SETELAH supabase/schema.sql (Fase 2) sudah dijalankan di project yang sama.
-- File terpisah (bukan edit schema.sql) supaya project yang sudah menjalankan Fase 2
-- tinggal apply file ini sebagai migration lanjutan.
--
-- Lihat docs/planning-multi-dompet-sharing-auth.md §4.1-§4.3 untuk konteks penuh.

-- ─── 1. wallet_members ──────────────────────────────────────────────────────
-- Siapa saja yang punya akses ke sebuah cloud_wallet + role-nya.

create table if not exists wallet_members (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references cloud_wallets(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  joined_at timestamptz not null default now(),
  unique (wallet_id, user_id)
);

alter table wallet_members enable row level security;

-- ─── 1b. Helper functions (SECURITY DEFINER) ───────────────────────────────
-- cloud_wallets dan wallet_members saling butuh cek satu sama lain (cloud_wallets perlu
-- tahu "apakah user ini member", wallet_members perlu tahu "apakah user ini owner dompet
-- ini") - kalau dicek lewat subquery biasa di dalam policy, RLS kedua tabel akan saling
-- panggil tanpa henti (infinite recursion, Postgres error 42P17). Function SECURITY DEFINER
-- di bawah ini query tabelnya langsung TANPA melewati RLS lagi, jadi rantainya terputus.

create or replace function public.is_wallet_owner(p_wallet_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from cloud_wallets
    where id = p_wallet_id and owner_id = p_user_id
  );
$$;

create or replace function public.is_wallet_member(p_wallet_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from wallet_members
    where wallet_id = p_wallet_id and user_id = p_user_id
  );
$$;

create or replace function public.can_edit_wallet(p_wallet_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from wallet_members
    where wallet_id = p_wallet_id and user_id = p_user_id and role in ('owner', 'editor')
  );
$$;

-- SELECT: lihat baris keanggotaan sendiri (untuk cek role), ATAU owner lihat semua member
-- dompetnya (untuk halaman Kelola Akses).
create policy "wallet_members_select" on wallet_members
  for select using (
    user_id = auth.uid()
    or public.is_wallet_owner(wallet_id, auth.uid())
  );

-- INSERT/UPDATE/DELETE manual (ubah role, remove member) - HANYA owner dompet.
-- Insert saat JOIN via key ditangani terpisah lewat RPC join_wallet_by_key()
-- (security definer, lihat §2) supaya share_key tervalidasi di server, bukan cuma RLS.
create policy "wallet_members_owner_write" on wallet_members
  for all using (
    public.is_wallet_owner(wallet_id, auth.uid())
  ) with check (
    public.is_wallet_owner(wallet_id, auth.uid())
  );

-- ─── 2. RPC: join_wallet_by_key ─────────────────────────────────────────────
-- Satu-satunya jalur resmi untuk "gabung dompet pakai key" - security definer supaya
-- validasi share_key terjadi di server (client tidak pernah insert wallet_members
-- langsung untuk proses join, mencegah orang insert baris membership sembarang wallet_id).

create or replace function public.join_wallet_by_key(p_share_key uuid)
returns table (wallet_id uuid, wallet_name text, wallet_icon text, wallet_color text, member_role text)
language plpgsql
security definer set search_path = public
as $$
declare
  v_wallet cloud_wallets%rowtype;
  v_existing_role text;
begin
  select * into v_wallet from cloud_wallets
    where share_key = p_share_key and share_key_active = true;

  if not found then
    raise exception 'Key tidak valid atau sudah tidak aktif';
  end if;

  if v_wallet.owner_id = auth.uid() then
    raise exception 'Tidak bisa join ke dompet milik sendiri';
  end if;

  select role into v_existing_role from wallet_members
    where wallet_members.wallet_id = v_wallet.id and wallet_members.user_id = auth.uid();

  if v_existing_role is null then
    insert into wallet_members (wallet_id, user_id, role)
      values (v_wallet.id, auth.uid(), 'viewer');
    insert into activity_log (wallet_id, actor_id, action, entity_type, description)
      values (v_wallet.id, auth.uid(), 'joined', 'member', 'Bergabung ke dompet via key');
    v_existing_role := 'viewer';
  end if;

  return query select v_wallet.id, v_wallet.name, v_wallet.icon, v_wallet.color, v_existing_role;
end;
$$;

-- ─── 2b. RPC: leave_wallet ──────────────────────────────────────────────────
-- Satu-satunya jalur resmi untuk "keluar dari dompet yang di-share" (dipakai member,
-- BUKAN owner) - security definer karena "wallet_members_owner_write" cuma izinkan
-- owner insert/update/delete baris wallet_members, jadi member tidak bisa hapus baris
-- membership-nya sendiri lewat client langsung.

create or replace function public.leave_wallet(p_wallet_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if public.is_wallet_owner(p_wallet_id, auth.uid()) then
    raise exception 'Owner tidak bisa keluar dari dompet sendiri - hapus dompet kalau memang mau berhenti berbagi';
  end if;

  delete from wallet_members
    where wallet_id = p_wallet_id and user_id = auth.uid();

  insert into activity_log (wallet_id, actor_id, action, entity_type, description)
    values (p_wallet_id, auth.uid(), 'left', 'member', 'Keluar dari dompet');
end;
$$;

-- ─── 3. activity_log ────────────────────────────────────────────────────────

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references cloud_wallets(id) on delete cascade,
  actor_id uuid not null references profiles(id),
  action text not null,           -- 'joined' | 'create_transaction' | 'update_goal' | 'remove_member' dst
  entity_type text,               -- 'transaction' | 'goal' | 'debt' | 'member' | null
  entity_id text,
  description text not null,      -- teks siap-tampil, misal "menambah transaksi Rp50.000 - Makan"
  created_at timestamptz not null default now()
);

alter table activity_log enable row level security;

-- INSERT oleh member dengan hak tulis (owner/editor) - dipakai saat CRUD data.
-- Insert untuk event 'joined' ditangani RPC join_wallet_by_key (security definer, lolos RLS).
create policy "activity_log_insert" on activity_log
  for insert with check (
    actor_id = auth.uid()
    and public.can_edit_wallet(wallet_id, auth.uid())
  );

-- SELECT hanya owner (§4.3: log aktivitas cuma bisa dilihat owner)
create policy "activity_log_select" on activity_log
  for select using (
    public.is_wallet_owner(wallet_id, auth.uid())
  );

-- ─── 4. Buka akses SELECT untuk member di cloud_wallets ────────────────────
-- Fase 2 cuma kasih akses ke owner. Sekarang member (viewer/editor) juga perlu SELECT
-- supaya bisa fetch data dompet yang di-share ke mereka. UPDATE/DELETE tetap owner-only
-- (dijaga oleh policy "cloud_wallets_owner_all" dari Fase 2 - tidak diubah).

create policy "cloud_wallets_member_select" on cloud_wallets
  for select using (
    public.is_wallet_member(id, auth.uid())
  );

-- ─── 5. Buka akses untuk member di 5 tabel data anak ───────────────────────
-- Pola sama untuk cloud_transactions/cloud_goals/cloud_debts/cloud_debt_payments/
-- cloud_recurring_templates: SELECT untuk semua member (termasuk viewer), INSERT/UPDATE/
-- DELETE untuk member dengan role owner ATAU editor (viewer diblok di level database).
-- Policy "..._owner_all" dari Fase 2 tetap ada (memberi owner akses penuh); dua policy
-- baru di bawah menambah akses member tanpa mengubah yang lama.

create policy "cloud_transactions_member_select" on cloud_transactions
  for select using (public.is_wallet_member(wallet_id, auth.uid()));
create policy "cloud_transactions_editor_write" on cloud_transactions
  for all using (public.can_edit_wallet(wallet_id, auth.uid()))
  with check (public.can_edit_wallet(wallet_id, auth.uid()));

create policy "cloud_goals_member_select" on cloud_goals
  for select using (public.is_wallet_member(wallet_id, auth.uid()));
create policy "cloud_goals_editor_write" on cloud_goals
  for all using (public.can_edit_wallet(wallet_id, auth.uid()))
  with check (public.can_edit_wallet(wallet_id, auth.uid()));

create policy "cloud_debts_member_select" on cloud_debts
  for select using (public.is_wallet_member(wallet_id, auth.uid()));
create policy "cloud_debts_editor_write" on cloud_debts
  for all using (public.can_edit_wallet(wallet_id, auth.uid()))
  with check (public.can_edit_wallet(wallet_id, auth.uid()));

create policy "cloud_debt_payments_member_select" on cloud_debt_payments
  for select using (public.is_wallet_member(wallet_id, auth.uid()));
create policy "cloud_debt_payments_editor_write" on cloud_debt_payments
  for all using (public.can_edit_wallet(wallet_id, auth.uid()))
  with check (public.can_edit_wallet(wallet_id, auth.uid()));

create policy "cloud_recurring_templates_member_select" on cloud_recurring_templates
  for select using (public.is_wallet_member(wallet_id, auth.uid()));
create policy "cloud_recurring_templates_editor_write" on cloud_recurring_templates
  for all using (public.can_edit_wallet(wallet_id, auth.uid()))
  with check (public.can_edit_wallet(wallet_id, auth.uid()));

-- ─── 6. Buka akses SELECT profiles untuk owner atas member dompetnya ───────
-- Fase 2 cuma kasih "profiles_select_own" (auth.uid() = id) - cukup untuk profil sendiri,
-- tapi halaman Kelola Akses (owner-only) perlu tampilkan NAMA member lain. Tanpa policy ini
-- PostgREST diam-diam nge-null-in embed `profiles(name)` di query wallet_members untuk baris
-- selain milik sendiri (bukan error, RLS cuma nge-filter row-nya).

create or replace function public.is_wallet_owner_of_member(p_member_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from wallet_members wm
    where wm.user_id = p_member_user_id
      and public.is_wallet_owner(wm.wallet_id, auth.uid())
  );
$$;

create policy "profiles_select_wallet_owner_view_members" on profiles
  for select using (public.is_wallet_owner_of_member(id));

-- ─── Setelah menjalankan file ini ──────────────────────────────────────────
-- Tidak ada langkah manual tambahan di dashboard Supabase - semua lewat SQL di atas.
-- Uji coba: buat 2 akun test, generate share_key dari akun A (lewat app), join dari akun B,
-- pastikan akun B (role viewer default) bisa SELECT tapi ditolak saat INSERT/UPDATE/DELETE.
