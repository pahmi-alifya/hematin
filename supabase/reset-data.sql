-- HEMATIN — Reset semua data Supabase (testing/dev only)
--
-- Menghapus SEMUA baris di tabel data (dompet, transaksi, goals, hutang, cicilan,
-- template rutin, keanggotaan dompet, log aktivitas) — TAPI akun login (auth.users)
-- dan profiles TIDAK ikut dihapus, jadi bisa langsung login lagi tanpa daftar ulang.
--
-- CASCADE aman dipakai di sini karena semua FK di tabel-tabel ini mengarah KE
-- cloud_wallets/profiles (searah), bukan sebaliknya — jadi tidak ada efek balik ke profiles.
--
-- PERINGATAN: ini permanen dan tidak bisa di-undo. Jalankan cuma kalau memang mau
-- reset total data testing.

truncate table
  cloud_transactions,
  cloud_goals,
  cloud_debts,
  cloud_debt_payments,
  cloud_recurring_templates,
  activity_log,
  wallet_members,
  cloud_wallets
cascade;
