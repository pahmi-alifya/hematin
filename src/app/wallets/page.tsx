"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Reorder, motion } from "framer-motion";
import { GripVertical, Pencil, Trash2, Plus, Check } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { MAX_WALLETS, WALLET_ICONS, WALLET_COLORS } from "@/lib/constants";
import { useWalletStore } from "@/stores/walletStore";
import type { Wallet } from "@/types";

interface WalletCounts {
  transactions: number;
  goals: number;
  debts: number;
  recurringTemplates: number;
}

async function countWalletData(walletId: string): Promise<WalletCounts> {
  const [transactions, goals, debts, recurringTemplates] = await Promise.all([
    db.transactions.where("walletId").equals(walletId).count(),
    db.goals.where("walletId").equals(walletId).count(),
    db.debts.where("walletId").equals(walletId).count(),
    db.recurringTemplates.where("walletId").equals(walletId).count(),
  ]);
  return { transactions, goals, debts, recurringTemplates };
}

function WalletFormSheet({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Wallet | null;
}) {
  const { createWallet, renameWallet, updateWalletAppearance, canCreateWallet } =
    useWalletStore();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(WALLET_ICONS[0]);
  const [color, setColor] = useState(WALLET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setIcon(editing?.icon ?? WALLET_ICONS[0]);
    setColor(editing?.color ?? WALLET_COLORS[0]);
  }, [open, editing]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Nama dompet tidak boleh kosong", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await renameWallet(editing.id, trimmed);
        await updateWalletAppearance(editing.id, icon, color);
        toast("Dompet berhasil diperbarui", "success");
      } else {
        if (!canCreateWallet()) {
          toast(`Maksimal ${MAX_WALLETS} dompet`, "error");
          setSaving(false);
          return;
        }
        await createWallet({ name: trimmed, icon, color });
        toast("Dompet baru berhasil dibuat", "success");
      }
      onClose();
    } catch {
      toast("Gagal menyimpan dompet", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? "Edit Dompet" : "Dompet Baru"}>
      <div className="px-5 pb-8 pt-1 space-y-5">
        <Input
          label="Nama Dompet"
          placeholder="Misal: Keuangan Kantor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          autoFocus
        />

        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ikon</p>
          <div className="grid grid-cols-6 gap-2">
            {WALLET_ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={cn(
                  "h-11 rounded-xl flex items-center justify-center text-lg border-2 transition-colors",
                  icon === i
                    ? "border-sky-400 bg-sky-50 dark:bg-sky-900/30"
                    : "border-transparent bg-slate-50 dark:bg-slate-800",
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Warna</p>
          <div className="flex flex-wrap gap-2.5">
            {WALLET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: c }}
              >
                {color === c && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <Button fullWidth onClick={handleSave} loading={saving}>
          {editing ? "Simpan Perubahan" : "Buat Dompet"}
        </Button>
      </div>
    </BottomSheet>
  );
}

function DeleteWalletSheet({
  wallet,
  onClose,
}: {
  wallet: Wallet | null;
  onClose: () => void;
}) {
  const deleteWallet = useWalletStore((s) => s.deleteWallet);
  const [counts, setCounts] = useState<WalletCounts | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!wallet) {
      setCounts(null);
      return;
    }
    countWalletData(wallet.id).then(setCounts);
  }, [wallet]);

  async function handleConfirm() {
    if (!wallet) return;
    setDeleting(true);
    try {
      await deleteWallet(wallet.id);
      toast(`Dompet "${wallet.name}" berhasil dihapus`, "success");
      onClose();
    } catch {
      toast("Gagal menghapus dompet", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <BottomSheet open={!!wallet} onClose={onClose} title="Hapus Dompet?">
      {wallet && (
        <div className="px-5 pb-8 pt-1 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Semua data di dalam dompet{" "}
            <span className="font-semibold">&ldquo;{wallet.name}&rdquo;</span> akan ikut terhapus
            permanen dan tidak bisa dikembalikan:
          </p>
          {counts && (
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4">
              <li>• {counts.transactions} transaksi</li>
              <li>• {counts.goals} goals</li>
              <li>• {counts.debts} catatan utang/piutang</li>
              <li>• {counts.recurringTemplates} template transaksi rutin</li>
            </ul>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Batal
            </Button>
            <Button variant="danger" fullWidth onClick={handleConfirm} loading={deleting}>
              Ya, Hapus
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

export default function WalletsPage() {
  return (
    <Suspense fallback={null}>
      <WalletsPageContent />
    </Suspense>
  );
}

function WalletsPageContent() {
  const searchParams = useSearchParams();
  const { wallets, activeWalletId, setActiveWallet, reorderWallets, canCreateWallet } =
    useWalletStore();
  const [items, setItems] = useState<Wallet[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Wallet | null>(null);

  useEffect(() => {
    setItems(wallets);
  }, [wallets]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
    }
  }, [searchParams]);

  const handleReorder = useCallback(
    (newOrder: Wallet[]) => {
      setItems(newOrder);
      reorderWallets(newOrder.map((w) => w.id));
    },
    [reorderWallets],
  );

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title="Kelola Dompet" showBack hideWalletSwitcher />

      <PageWrapper>
        <div className="px-2 pb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Tahan &amp; geser <GripVertical className="w-3 h-3 inline -mt-0.5" /> untuk mengubah urutan
          </p>

          <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
            {items.map((wallet) => (
              <Reorder.Item
                key={wallet.id}
                value={wallet}
                className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm"
              >
                <div className="flex items-center gap-2 p-3">
                  <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 cursor-grab active:cursor-grabbing" />

                  <button
                    onClick={() => setActiveWallet(wallet.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${wallet.color}22` }}
                    >
                      {wallet.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {wallet.name}
                      </p>
                      {wallet.id === activeWalletId && (
                        <span className="text-xs font-medium text-sky-500">Aktif</span>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setEditing(wallet);
                      setFormOpen(true);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {items.length > 1 && (
                    <button
                      onClick={() => setDeleteTarget(wallet)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!canCreateWallet()) {
                toast(`Maksimal ${MAX_WALLETS} dompet`, "error");
                return;
              }
              setEditing(null);
              setFormOpen(true);
            }}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed mt-3 text-sm font-semibold transition-colors",
              canCreateWallet()
                ? "border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                : "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500",
            )}
          >
            <Plus className="w-4 h-4" />
            Tambah Dompet {!canCreateWallet() && `(maks ${MAX_WALLETS})`}
          </motion.button>
        </div>
      </PageWrapper>

      <BottomNav />

      <WalletFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
      />
      <DeleteWalletSheet wallet={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
}
