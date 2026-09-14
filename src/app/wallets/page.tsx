"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Reorder, motion } from "framer-motion";
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Check,
  Share2,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { MAX_WALLETS, WALLET_ICONS, WALLET_COLORS } from "@/lib/constants";
import { useWalletStore, isSharedWithMe } from "@/stores/walletStore";
import { useSharedSyncStore } from "@/stores/sharedSyncStore";
import { useWalletForm } from "@/hooks/useWalletForm";
import { useDeleteWalletConfirm } from "@/hooks/useDeleteWalletConfirm";
import { useWalletReorder } from "@/hooks/useWalletReorder";
import { useJoinWallet } from "@/hooks/useJoinWallet";
import { QrScanButton } from "@/components/wallet/QrScanButton";
import type { Wallet } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/hooks/useTranslation";

function JoinWalletForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslation();
  const { key, setKey, loading, handleJoin } = useJoinWallet(onSuccess);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t.wallets.join.instructions}
      </p>
      <div className="flex gap-2">
        <Input
          placeholder={t.wallets.join.keyPlaceholder}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="flex-1"
        />
        <QrScanButton onScan={setKey} />
      </div>
      <Button fullWidth onClick={handleJoin} loading={loading}>
        {t.wallets.join.submitButton}
      </Button>
    </div>
  );
}

function WalletFormSheet({
  open,
  onClose,
  editing,
  initialMode,
}: {
  open: boolean;
  onClose: () => void;
  editing: Wallet | null;
  initialMode: "create" | "join";
}) {
  const t = useTranslation();
  const [mode, setMode] = useState<"create" | "join">(initialMode);
  const { name, setName, icon, setIcon, color, setColor, saving, handleSave } =
    useWalletForm(open, editing, onClose);

  useEffect(() => {
    if (open) setMode(editing ? "create" : initialMode);
  }, [open, editing, initialMode]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={
        editing
          ? t.wallets.form.editTitle
          : mode === "create"
            ? t.wallets.form.newTitle
            : t.wallets.form.joinTitle
      }
    >
      <div className="px-5 pb-8 pt-1 space-y-5">
        {!editing && (
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            {(["create", "join"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-semibold transition-all",
                  mode === m
                    ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                {m === "create" ? t.wallets.form.createTab : t.wallets.form.joinTab}
              </button>
            ))}
          </div>
        )}

        {mode === "join" && !editing ? (
          <JoinWalletForm onSuccess={onClose} />
        ) : (
          <>
            <Input
              label={t.wallets.form.nameLabel}
              placeholder={t.wallets.form.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              autoFocus
            />

            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t.wallets.form.iconLabel}
              </p>
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
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t.wallets.form.colorLabel}
              </p>
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
              {editing ? t.common.saveChanges : t.wallets.form.createButton}
            </Button>
          </>
        )}
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
  const t = useTranslation();
  const { counts, deleting, handleConfirm, isLeaving } = useDeleteWalletConfirm(
    wallet,
    onClose,
  );

  return (
    <BottomSheet
      open={!!wallet}
      onClose={onClose}
      title={isLeaving ? t.wallets.delete.leaveTitle : t.wallets.delete.deleteTitle}
    >
      {wallet && (
        <div className="px-5 pb-8 pt-1 space-y-4">
          {isLeaving ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t.wallets.delete.leaveDescriptionBefore}{" "}
              <span className="font-semibold">&ldquo;{wallet.name}&rdquo;</span>{" "}
              {t.wallets.delete.leaveDescriptionAfter}
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t.wallets.delete.deleteDescriptionBefore}{" "}
                <span className="font-semibold">&ldquo;{wallet.name}&rdquo;</span>{" "}
                {t.wallets.delete.deleteDescriptionAfter}
                {wallet.isShared && t.wallets.delete.deleteDescriptionSharedSuffix}:
              </p>
              {counts && (
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4">
                  <li>• {t.wallets.delete.countTransactions(counts.transactions)}</li>
                  <li>• {t.wallets.delete.countGoals(counts.goals)}</li>
                  <li>• {t.wallets.delete.countDebts(counts.debts)}</li>
                  <li>• {t.wallets.delete.countRecurring(counts.recurringTemplates)}</li>
                </ul>
              )}
            </>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleConfirm}
              loading={deleting}
            >
              {isLeaving ? t.wallets.delete.confirmLeaveButton : t.wallets.delete.confirmDeleteButton}
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
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallets, activeWalletId, setActiveWallet, canCreateWallet } =
    useWalletStore();
  const { items, handleReorder } = useWalletReorder(wallets);
  const { refreshingWalletId, refreshWallet } = useSharedSyncStore();

  const userId = useAuthStore((s) => s.user?.id);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "join">("create");
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Wallet | null>(null);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setFormMode("create");
      setFormOpen(true);
    } else if (searchParams.get("join") === "1") {
      setEditing(null);
      setFormMode("join");
      setFormOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title={t.wallets.list.pageTitle} showBack hideWalletSwitcher />

      <PageWrapper>
        <div className="px-2 pb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {t.wallets.list.dragHintBefore}{" "}
            <GripVertical className="w-3 h-3 inline -mt-0.5" />{" "}
            {t.wallets.list.dragHintAfter}
          </p>

          <Reorder.Group
            axis="y"
            values={items}
            onReorder={handleReorder}
            className="space-y-2"
          >
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {wallet.id === activeWalletId && (
                          <span className="text-xs font-medium text-sky-500">
                            {t.wallets.list.activeLabel}
                          </span>
                        )}
                        {isSharedWithMe(wallet) && (
                          <span className="text-xs font-medium text-violet-500 dark:text-violet-400">
                            {t.wallets.list.sharedWithRole(
                              t.wallets.role[wallet.ownerRole as "editor" | "viewer"],
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {wallet.isShared && (
                    <button
                      onClick={() => refreshWallet(wallet.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
                      title={t.wallets.list.refreshTooltip}
                    >
                      <RefreshCw
                        className={cn(
                          "w-3.5 h-3.5",
                          refreshingWalletId === wallet.id && "animate-spin",
                        )}
                      />
                    </button>
                  )}

                  {wallet.ownerRole !== "viewer" &&
                    wallet.ownerRole !== "editor" &&
                    !!userId && (
                      <button
                        onClick={() =>
                          router.push(`/wallets/${wallet.id}/kelola-akses`)
                        }
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
                        title={t.wallets.list.manageAccessTooltip}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                  {!isSharedWithMe(wallet) && (
                    <button
                      onClick={() => {
                        setEditing(wallet);
                        setFormOpen(true);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
                      title={t.wallets.list.editTooltip}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {items.length > 1 && (
                    <button
                      onClick={() => setDeleteTarget(wallet)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                      title={isSharedWithMe(wallet) ? t.wallets.list.deleteAccessTooltip : t.wallets.list.deleteWalletTooltip}
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
                toast(t.wallets.list.maxWalletsToast(MAX_WALLETS), "error");
                return;
              }
              setEditing(null);
              setFormMode("create");
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
            {t.wallets.list.addWallet} {!canCreateWallet() && t.wallets.list.addWalletMax(MAX_WALLETS)}
          </motion.button>
        </div>
      </PageWrapper>

      <BottomNav />

      <WalletFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
        initialMode={formMode}
      />
      <DeleteWalletSheet
        wallet={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
