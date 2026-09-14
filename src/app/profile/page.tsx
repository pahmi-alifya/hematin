"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet as WalletIcon, ChevronRight, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { AccountSection } from "@/components/settings/AccountSection";
import { FaqSection } from "@/components/settings/FaqSection";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useTourStore } from "@/stores/tourStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProfilePage() {
  const router = useRouter();
  const startTour = useTourStore((s) => s.startTour);
  const t = useTranslation();

  function handleReplayTour() {
    router.push("/");
    startTour();
  }

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title={t.profile.title} hideWalletSwitcher rightElement={<LanguageToggle />} />

      <PageWrapper>
        <div className="pb-28 space-y-4">
          <AccountSection />

          <Link
            href="/wallets"
            data-tour="manage-wallet-link"
            className="flex items-center gap-3 bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4"
          >
            <div className="w-11 h-11 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <WalletIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t.profile.manageWalletTitle}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t.profile.manageWalletSubtitle}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
          </Link>

          <button
            type="button"
            onClick={handleReplayTour}
            data-tour="tour-replay-button"
            className="flex items-center gap-3 w-full bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4 text-left"
          >
            <div className="w-11 h-11 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t.profile.replayTourTitle}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t.profile.replayTourSubtitle}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
          </button>

          <FaqSection />
        </div>
      </PageWrapper>

      <BottomNav />
    </div>
  );
}
