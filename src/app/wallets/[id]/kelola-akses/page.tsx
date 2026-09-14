"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  Users,
  History,
  KeyRound,
  Copy,
  RefreshCw,
  Power,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { MemberRoleSelect } from "@/components/wallet/MemberRoleSelect";
import { cn, formatDate } from "@/lib/utils";
import { useWalletSharing } from "@/hooks/useWalletSharing";
import { useSharedSyncStore } from "@/stores/sharedSyncStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";

type Tab = "anggota" | "log" | "key";

export default function KelolaAksesPage() {
  const t = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const walletId = params.id;
  const [tab, setTab] = useState<Tab>("key");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const TABS: { value: Tab; label: string; icon: typeof Users }[] = [
    { value: "key", label: t.wallets.access.tabKey, icon: KeyRound },
    { value: "anggota", label: t.wallets.access.tabMembers, icon: Users },
    { value: "log", label: t.wallets.access.tabLog, icon: History },
  ];

  const {
    wallet,
    shareKey,
    shareKeyActive,
    loadingKey,
    activating,
    members,
    loadingMembers,
    logs,
    loadingLogs,
    handleActivate,
    handleRegenerate,
    handleToggleActive,
    handleRoleChange,
    handleRemoveMember,
  } = useWalletSharing(walletId);
  const { refreshingWalletId, refreshWallet } = useSharedSyncStore();

  useEffect(() => {
    if (wallet && wallet.ownerRole && wallet.ownerRole !== "owner") {
      toast(t.wallets.access.ownerOnlyToast, "error");
      router.replace("/wallets");
    }
  }, [wallet, router, t]);

  useEffect(() => {
    if (!shareKey) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(shareKey, { width: 240, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [shareKey]);

  function handleCopy() {
    if (!shareKey) return;
    navigator.clipboard.writeText(shareKey);
    toast(t.wallets.access.keyCopiedToast, "success");
  }

  if (!wallet) return null;

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header
        title={t.wallets.access.pageTitle(wallet.name)}
        showBack
        backHref="/wallets"
        hideWalletSwitcher
        rightElement={
          wallet.cloudWalletId && (
            <button
              onClick={() => refreshWallet(wallet.id)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
              title={t.wallets.access.refreshTooltip}
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4",
                  refreshingWalletId === wallet.id && "animate-spin",
                )}
              />
            </button>
          )
        }
      />

      <PageWrapper>
        <div className="pb-28 space-y-4">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            {TABS.map((tabItem) => (
              <button
                key={tabItem.value}
                onClick={() => setTab(tabItem.value)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                  tab === tabItem.value
                    ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                <tabItem.icon className="w-3.5 h-3.5" />
                {tabItem.label}
              </button>
            ))}
          </div>

          {/* Tab: Key & QR */}
          {tab === "key" && (
            <div className="space-y-4">
              {loadingKey ? (
                <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ) : !shareKey ? (
                <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-5 text-center space-y-3">
                  <ShieldCheck className="w-8 h-8 text-sky-500 mx-auto" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t.wallets.access.activatePrompt}
                  </p>
                  <Button
                    fullWidth
                    onClick={handleActivate}
                    loading={activating}
                  >
                    {t.wallets.access.activateButton}
                  </Button>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        shareKeyActive
                          ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
                      )}
                    >
                      {shareKeyActive ? t.wallets.access.statusActive : t.wallets.access.statusInactive}
                    </span>
                    <button
                      onClick={() => handleToggleActive(!shareKeyActive)}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400"
                    >
                      <Power className="w-3.5 h-3.5" />
                      {shareKeyActive
                        ? t.wallets.access.deactivateButton
                        : t.wallets.access.reactivateButton}
                    </button>
                  </div>

                  {qrDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt={t.wallets.access.qrAlt}
                      className="w-48 h-48 mx-auto rounded-xl"
                    />
                  )}

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                    <code className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      {shareKey}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 text-sky-600 dark:text-sky-400"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleRegenerate}
                    loading={activating}
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" /> {t.wallets.access.regenerateButton}
                  </Button>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                    {t.wallets.access.regenerateNote}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Anggota */}
          {tab === "anggota" && (
            <div className="space-y-2">
              {loadingMembers ? (
                <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ) : members.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">
                  {t.wallets.access.noMembers}
                </p>
              ) : (
                members.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400 text-sm font-bold shrink-0">
                      {(m.profiles?.name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {m.profiles?.name ?? t.wallets.access.unknownUser}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {t.wallets.access.joinedPrefix(formatDate(m.joined_at.slice(0, 10), language))}
                      </p>
                    </div>
                    {m.role === "owner" ? (
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                        {t.wallets.role.owner}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <MemberRoleSelect
                          value={m.role}
                          onChange={(role) => handleRoleChange(m.id, role)}
                        />
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab: Log Aktivitas */}
          {tab === "log" && (
            <div className="space-y-2">
              {loadingLogs ? (
                <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ) : logs.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">
                  {t.wallets.access.noActivity}
                </p>
              ) : (
                <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm divide-y divide-slate-100 dark:divide-slate-700/60">
                  {logs.map((log) => (
                    <div key={log.id} className="px-4 py-3">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        <span className="font-semibold">
                          {log.profiles?.name ?? t.wallets.access.unknownUser}
                        </span>{" "}
                        {log.description}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(log.created_at).toLocaleString(language === "en" ? "en-US" : "id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PageWrapper>

      <BottomNav />
    </div>
  );
}
