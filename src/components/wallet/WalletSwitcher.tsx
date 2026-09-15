"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Check,
  Settings2,
  Plus,
  Users,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/stores/walletStore";
import { useSharedSyncStore } from "@/stores/sharedSyncStore";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useTranslation } from "@/hooks/useTranslation";

interface WalletSwitcherProps {
  /** Varian tampilan tombol trigger - light dipakai di atas background gradient (hero dashboard) */
  variant?: "default" | "light";
  className?: string;
}

export function WalletSwitcher({
  variant = "default",
  className,
}: WalletSwitcherProps) {
  const t = useTranslation();
  const router = useRouter();
  const { wallets, activeWalletId, setActiveWallet } = useWalletStore();
  const { refreshingWalletId, refreshWallet } = useSharedSyncStore();
  const [open, setOpen] = useState(false);

  const activeWallet = wallets.find((w) => w.id === activeWalletId);
  if (!activeWallet) return null;

  return (
    <>
      <div className={cn("inline-flex items-center gap-1", className)}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 h-9 pl-2 pr-3 rounded-full text-sm font-semibold transition-colors max-w-50",
            variant === "light"
              ? "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              : "bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-slate-700",
          )}
        >
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0"
            style={{ backgroundColor: `${activeWallet.color}33` }}
          >
            {activeWallet.icon}
          </span>
          <span className="truncate">{activeWallet.name}</span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
        </motion.button>

        {activeWallet.isShared && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => refreshWallet(activeWallet.id)}
            title={t.wallets.switcher.refreshTooltip}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
              variant === "light"
                ? "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                : "bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-slate-700",
            )}
          >
            <RefreshCw
              className={cn(
                "w-3.5 h-3.5",
                refreshingWalletId === activeWallet.id && "animate-spin",
              )}
            />
          </motion.button>
        )}
      </div>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t.wallets.switcher.title}
      >
        <div className="px-4 pb-6 pt-1 flex flex-col gap-1.5">
          {wallets.map((wallet) => {
            const isActive = wallet.id === activeWalletId;
            return (
              <button
                key={wallet.id}
                onClick={() => {
                  setActiveWallet(wallet.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl text-left transition-colors",
                  isActive
                    ? "bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/60"
                    : "border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60",
                )}
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${wallet.color}22` }}
                >
                  {wallet.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {wallet.name}
                  </p>
                  {wallet.isShared && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {t.wallets.switcher.shared}
                    </p>
                  )}
                </div>
                {isActive && (
                  <Check className="w-4 h-4 text-sky-500 shrink-0" />
                )}
              </button>
            );
          })}

          <button
            onClick={() => {
              setOpen(false);
              router.push("/wallets?new=1");
            }}
            className="flex items-center gap-3 p-3 rounded-2xl text-left text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors mt-1"
          >
            <span className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </span>
            <p className="text-sm font-semibold">{t.wallets.switcher.addNew}</p>
          </button>

          <button
            onClick={() => {
              setOpen(false);
              router.push("/wallets");
            }}
            className="flex items-center gap-3 p-3 rounded-2xl text-left text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Settings2 className="w-4 h-4" />
            </span>
            <p className="text-sm font-semibold">{t.wallets.switcher.manage}</p>
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
