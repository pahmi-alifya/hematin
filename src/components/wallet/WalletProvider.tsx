"use client";

import { useEffect, useRef } from "react";
import { useWalletStore } from "@/stores/walletStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { useGoalStore } from "@/stores/goalStore";
import { useDebtStore } from "@/stores/debtStore";
import { useRecurringStore } from "@/stores/recurringStore";
import { useSharedSyncStore } from "@/stores/sharedSyncStore";
import { useAuthStore } from "@/stores/authStore";

// Lapis 2 (collaboration sync) - hanya jalan untuk dompet aktif yang isShared===true.
// 2 menit, bukan detik - polling tiap 45s terlalu boros request Supabase (lihat riwayat
// commit: 1471 request/jam dari 1 tab aktif), padahal sharing dompet keluarga/kecil tidak
// butuh update se-real-time itu. Refresh manual (WalletSwitcher) tetap tersedia kapan saja.
const SHARED_WALLET_POLL_MS = 120_000;

/**
 * Reload semua store yang di-scope per-dompet setiap kali activeWalletId berubah,
 * supaya halaman yang sedang terbuka (tanpa remount) ikut ter-update saat user
 * ganti dompet lewat switcher.
 */
export function WalletProvider() {
  const loadWallets = useWalletStore((s) => s.loadWallets);
  const activeWalletId = useWalletStore((s) => s.activeWalletId);
  const isActiveWalletShared = useWalletStore(
    (s) => !!s.wallets.find((w) => w.id === s.activeWalletId)?.isShared,
  );
  const isGuest = useAuthStore((s) => s.isGuest);
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadGoals = useGoalStore((s) => s.loadGoals);
  const loadDebts = useDebtStore((s) => s.loadDebts);
  const loadTemplates = useRecurringStore((s) => s.loadTemplates);
  const didInit = useRef(false);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  useEffect(() => {
    if (!activeWalletId) return;
    // Hindari double-load di render pertama - masing-masing halaman sudah
    // memanggil loadX() sendiri saat mount.
    if (!didInit.current) {
      didInit.current = true;
      return;
    }
    loadTransactions();
    loadGoals();
    loadDebts();
    loadTemplates();
  }, [activeWalletId, loadTransactions, loadGoals, loadDebts, loadTemplates]);

  useEffect(() => {
    if (!isActiveWalletShared || isGuest) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && activeWalletId) {
        useSharedSyncStore.getState().refreshWallet(activeWalletId);
      }
    }, SHARED_WALLET_POLL_MS);

    return () => clearInterval(interval);
  }, [isActiveWalletShared, isGuest, activeWalletId]);

  return null;
}
