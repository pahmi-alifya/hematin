-- HEMATIN — Fitur Hapus Akun Pribadi
-- Jalankan SETELAH supabase/schema.sql (Fase 2) dan supabase/schema-fase3-sharing.sql
-- (Fase 3) sudah dijalankan di project yang sama.
--
-- Lihat docs/planning-delete-account.md untuk konteks penuh (§2.1, §3.2, §3.6).

-- ─── 1. Perbaikan FK: created_by / actor_id harus SET NULL, bukan block delete ──
-- Kolom-kolom ini sebelumnya `not null references profiles(id)` TANPA `on delete`,
-- artinya default Postgres = block delete (foreign key violation). Kalau dibiarkan,
-- auth.admin.deleteUser() akan GAGAL TOTAL untuk user yang pernah jadi Editor dan
-- mencatat data di dompet MILIK ORANG LAIN (bukan cascade — cascade justru salah di
-- sini karena akan menghapus data milik pemilik dompet, bukan milik si editor yang
-- keluar). Jadi: kolom dibuat nullable + on delete set null — riwayat transaksi tetap
-- ada untuk laporan pemilik dompet, cuma "siapa yang mencatat" jadi kosong.

alter table cloud_transactions alter column created_by drop not null;
alter table cloud_transactions drop constraint if exists cloud_transactions_created_by_fkey;
alter table cloud_transactions add constraint cloud_transactions_created_by_fkey
  foreign key (created_by) references profiles(id) on delete set null;

alter table cloud_goals alter column created_by drop not null;
alter table cloud_goals drop constraint if exists cloud_goals_created_by_fkey;
alter table cloud_goals add constraint cloud_goals_created_by_fkey
  foreign key (created_by) references profiles(id) on delete set null;

alter table cloud_debts alter column created_by drop not null;
alter table cloud_debts drop constraint if exists cloud_debts_created_by_fkey;
alter table cloud_debts add constraint cloud_debts_created_by_fkey
  foreign key (created_by) references profiles(id) on delete set null;

alter table cloud_debt_payments alter column created_by drop not null;
alter table cloud_debt_payments drop constraint if exists cloud_debt_payments_created_by_fkey;
alter table cloud_debt_payments add constraint cloud_debt_payments_created_by_fkey
  foreign key (created_by) references profiles(id) on delete set null;

alter table cloud_recurring_templates alter column created_by drop not null;
alter table cloud_recurring_templates drop constraint if exists cloud_recurring_templates_created_by_fkey;
alter table cloud_recurring_templates add constraint cloud_recurring_templates_created_by_fkey
  foreign key (created_by) references profiles(id) on delete set null;

alter table activity_log alter column actor_id drop not null;
alter table activity_log drop constraint if exists activity_log_actor_id_fkey;
alter table activity_log add constraint activity_log_actor_id_fkey
  foreign key (actor_id) references profiles(id) on delete set null;

-- (wallet_members.user_id dan cloud_wallets.owner_id sudah `on delete cascade` sejak
-- Fase 2/3 — tidak perlu diubah, sudah benar untuk kasusnya masing-masing.)

-- ─── 2. RPC: transfer_wallet_ownership ──────────────────────────────────────
-- Dipanggil dari server route /api/account/delete (pakai service-role client, BUKAN
-- dari client biasa) sebelum auth.admin.deleteUser() dieksekusi. security definer
-- supaya bisa update cloud_wallets & wallet_members lintas-user (di luar RLS owner-only
-- yang normal), tapi tetap validasi manual di dalam function — jangan asumsikan caller
-- server route selalu benar, defense in depth.

create or replace function public.transfer_wallet_ownership(
  p_wallet_id uuid,
  p_caller_id uuid,
  p_new_owner_id uuid
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from cloud_wallets
    where id = p_wallet_id and owner_id = p_caller_id
  ) then
    raise exception 'Caller bukan owner dompet ini — transfer dibatalkan';
  end if;

  if not exists (
    select 1 from wallet_members
    where wallet_id = p_wallet_id and user_id = p_new_owner_id
  ) then
    raise exception 'Calon owner baru bukan anggota dompet ini — transfer dibatalkan';
  end if;

  update cloud_wallets set owner_id = p_new_owner_id where id = p_wallet_id;

  -- KOREKSI (lihat catatan di bawah tanggal 2026-09-15): owner MEMANG punya baris sendiri
  -- di wallet_members (role 'owner') — di-upsert oleh ensureOwnerMembership() setiap kali
  -- dompet cloud-linked, bukan cuma dompet yang di-share. Jadi di sini yang benar:
  -- baris owner LAMA (p_caller_id) dihapus (toh akunnya sesaat lagi dihapus permanen,
  -- cascade juga akan membereskan ini, tapi dibersihkan langsung di sini biar konsisten
  -- seketika), dan baris owner BARU (p_new_owner_id, yang sudah divalidasi ada di atas
  -- sebagai member) role-nya DINAIKKAN jadi 'owner' — BUKAN dihapus.
  delete from wallet_members
    where wallet_id = p_wallet_id and user_id = p_caller_id;

  update wallet_members set role = 'owner'
    where wallet_id = p_wallet_id and user_id = p_new_owner_id;

  insert into activity_log (wallet_id, actor_id, action, entity_type, description)
    values (p_wallet_id, p_new_owner_id, 'ownership_transferred', 'member',
            'Menjadi owner baru (pemilik lama menghapus akunnya)');
end;
$$;

-- ─── Setelah menjalankan file ini ──────────────────────────────────────────
-- Tidak ada langkah manual tambahan di dashboard Supabase — semua lewat SQL di atas.
-- Verifikasi FK: `\d+ cloud_transactions` (dst.) harus menunjukkan `created_by` nullable
-- dan constraint `... ON DELETE SET NULL`.
-- Uji coba RPC (lihat §5 planning doc): buat 2 akun test, akun A share dompet ke akun B
-- (role apapun), panggil `select transfer_wallet_ownership('<wallet_id>', '<A id>', '<B id>')`
-- lewat SQL editor, pastikan `cloud_wallets.owner_id` akun itu berubah jadi B, baris
-- wallet_members B ber-role 'owner' (bukan hilang), dan baris wallet_members A (owner lama)
-- ikut terhapus.
--
-- ─── KOREKSI 2026-09-15 ─────────────────────────────────────────────────────
-- Ditemukan setelah test dengan data Supabase asli: `ensureOwnerMembership()` (dipanggil
-- dari accountSync.ts tiap login) meng-upsert baris wallet_members untuk OWNER juga —
-- untuk SEMUA dompet cloud-linked, TERMASUK yang tidak pernah di-share ke siapapun. Asumsi
-- awal ("owner tidak pernah punya baris wallet_members") di komentar lama fungsi ini SALAH,
-- diambil cuma dari baca join_wallet_by_key() yang cuma soal jalur JOIN, bukan jalur upload
-- pertama kali. Akibatnya: dompet pribadi (tidak di-share ke siapapun) ikut muncul di sheet
-- "Transfer Kepemilikan" saat hapus akun, karena baris wallet_members milik diri sendiri
-- ikut terhitung sebagai "anggota". Fix di client: src/hooks/useAccountDeletion.ts sekarang
-- membuang baris user_id = diri sendiri sebelum menghitung "apakah dompet ini punya anggota
-- lain". Fix di sini: function di atas sudah dikoreksi (update role, bukan delete, untuk
-- owner baru). Kalau function ini sudah pernah dijalankan versi lama, jalankan ulang file
-- ini (aman, `create or replace function` idempotent) untuk pakai versi yang benar.
