-- HEMATIN - Patch: perbaiki infinite recursion (error 42P17) di RLS cloud_wallets/wallet_members
--
-- Jalankan SEKALI ini kalau kamu SUDAH menjalankan supabase/schema-fase3-sharing.sql sebelumnya
-- dan mendapat error "infinite recursion detected in policy for relation cloud_wallets".
-- File supabase/schema-fase3-sharing.sql sudah diperbaiki juga (untuk project baru nanti),
-- tapi project yang SUDAH jalan perlu di-patch pakai file ini karena policy tidak bisa
-- di-"replace" langsung - harus di-drop dulu baru dibuat ulang.
--
-- Aman dijalankan berkali-kali (semua statement pakai IF EXISTS / OR REPLACE).

-- 1) Helper functions SECURITY DEFINER - memutus rantai saling-cek RLS antara
--    cloud_wallets dan wallet_members.
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

-- 2) Drop semua policy lama yang masih pakai subquery langsung (sumber recursion),
--    lalu buat ulang pakai helper function di atas.

drop policy if exists "wallet_members_select" on wallet_members;
create policy "wallet_members_select" on wallet_members
  for select using (
    user_id = auth.uid()
    or public.is_wallet_owner(wallet_id, auth.uid())
  );

drop policy if exists "wallet_members_owner_write" on wallet_members;
create policy "wallet_members_owner_write" on wallet_members
  for all using (public.is_wallet_owner(wallet_id, auth.uid()))
  with check (public.is_wallet_owner(wallet_id, auth.uid()));

drop policy if exists "cloud_wallets_member_select" on cloud_wallets;
create policy "cloud_wallets_member_select" on cloud_wallets
  for select using (public.is_wallet_member(id, auth.uid()));

drop policy if exists "activity_log_insert" on activity_log;
create policy "activity_log_insert" on activity_log
  for insert with check (
    actor_id = auth.uid()
    and public.can_edit_wallet(wallet_id, auth.uid())
  );

drop policy if exists "activity_log_select" on activity_log;
create policy "activity_log_select" on activity_log
  for select using (public.is_wallet_owner(wallet_id, auth.uid()));

drop policy if exists "cloud_transactions_member_select" on cloud_transactions;
create policy "cloud_transactions_member_select" on cloud_transactions
  for select using (public.is_wallet_member(wallet_id, auth.uid()));
drop policy if exists "cloud_transactions_editor_write" on cloud_transactions;
create policy "cloud_transactions_editor_write" on cloud_transactions
  for all using (public.can_edit_wallet(wallet_id, auth.uid()))
  with check (public.can_edit_wallet(wallet_id, auth.uid()));

drop policy if exists "cloud_goals_member_select" on cloud_goals;
create policy "cloud_goals_member_select" on cloud_goals
  for select using (public.is_wallet_member(wallet_id, auth.uid()));
drop policy if exists "cloud_goals_editor_write" on cloud_goals;
create policy "cloud_goals_editor_write" on cloud_goals
  for all using (public.can_edit_wallet(wallet_id, auth.uid()))
  with check (public.can_edit_wallet(wallet_id, auth.uid()));

drop policy if exists "cloud_debts_member_select" on cloud_debts;
create policy "cloud_debts_member_select" on cloud_debts
  for select using (public.is_wallet_member(wallet_id, auth.uid()));
drop policy if exists "cloud_debts_editor_write" on cloud_debts;
create policy "cloud_debts_editor_write" on cloud_debts
  for all using (public.can_edit_wallet(wallet_id, auth.uid()))
  with check (public.can_edit_wallet(wallet_id, auth.uid()));

drop policy if exists "cloud_debt_payments_member_select" on cloud_debt_payments;
create policy "cloud_debt_payments_member_select" on cloud_debt_payments
  for select using (public.is_wallet_member(wallet_id, auth.uid()));
drop policy if exists "cloud_debt_payments_editor_write" on cloud_debt_payments;
create policy "cloud_debt_payments_editor_write" on cloud_debt_payments
  for all using (public.can_edit_wallet(wallet_id, auth.uid()))
  with check (public.can_edit_wallet(wallet_id, auth.uid()));

drop policy if exists "cloud_recurring_templates_member_select" on cloud_recurring_templates;
create policy "cloud_recurring_templates_member_select" on cloud_recurring_templates
  for select using (public.is_wallet_member(wallet_id, auth.uid()));
drop policy if exists "cloud_recurring_templates_editor_write" on cloud_recurring_templates;
create policy "cloud_recurring_templates_editor_write" on cloud_recurring_templates
  for all using (public.can_edit_wallet(wallet_id, auth.uid()))
  with check (public.can_edit_wallet(wallet_id, auth.uid()));
