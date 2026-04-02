"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useTransactionStore } from "@/stores/transactionStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useDebtStore } from "@/stores/debtStore";
import { getOrFetchInsight } from "@/lib/ai-insight";

export function AIInsightCard() {
  const { transactions } = useTransactionStore();
  const { aiSettings, isConfigured } = useSettingsStore();
  const debts = useDebtStore((s) => s.debts);
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const loadInsight = useCallback(
    async (forceRefresh = false) => {
      if (!aiSettings || !isConfigured) return;
      setIsLoading(true);
      setError(null);
      try {
        const text = await getOrFetchInsight(
          transactions,
          aiSettings,
          forceRefresh,
          debts,
        );
        setInsight(text);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat insight");
      } finally {
        setIsLoading(false);
      }
    },
    [transactions, aiSettings, isConfigured],
  );

  useEffect(() => {
    if (isConfigured && aiSettings) {
      loadInsight();
    }
  }, [isConfigured, aiSettings, loadInsight]);

  // Not configured → setup banner
  if (!isConfigured) {
    return (
      <Link href="/settings">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center my-3 gap-3 bg-linear-to-r from-sky-500 to-sky-400 rounded-2xl p-4 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              Aktifkan AI Insight
            </p>
            <p className="text-xs text-white/80 truncate">
              Hubungkan API key untuk analisis keuangan harian
            </p>
          </div>
          <span className="text-xs font-semibold text-white/80 bg-white/20 px-2 py-1 rounded-full shrink-0">
            Setup →
          </span>
        </motion.div>
      </Link>
    );
  }

  // Loading skeleton (initial load only)
  if (isLoading && !insight) {
    return (
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-900/40 animate-pulse" />
          <div className="h-4 w-28 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-3 w-4/6 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !insight) {
    return (
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🤖</span>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              HEMATIN AI
            </p>
          </div>
          <button
            onClick={() => loadInsight(true)}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!insight) return null;

  const preview =
    insight.length > 220 ? insight.slice(0, 220).trimEnd() + "..." : insight;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl shadow-sm border border-sky-200 dark:border-sky-800/40 p-5 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(186,230,253,0.18) 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 dark:bg-sky-400/20 flex items-center justify-center">
              <span className="text-base">🤖</span>
            </div>
            <p className="text-sm font-bold text-sky-700 dark:text-sky-300">
              HEMATIN bilang:
            </p>
          </div>
          <button
            onClick={() => loadInsight(true)}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-sky-400 hover:text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors disabled:opacity-40"
            title="Refresh insight"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          {preview}
        </p>

        {insight.length > 220 && (
          <button
            onClick={() => setShowSheet(true)}
            className="mt-3 flex items-center gap-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400"
          >
            Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>

      <BottomSheet
        open={showSheet}
        onClose={() => setShowSheet(false)}
        title="AI Insight Harian"
      >
        <div className="px-5 pt-2 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              HEMATIN bilang:
            </p>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {insight}
          </p>
        </div>
      </BottomSheet>
    </>
  );
}
