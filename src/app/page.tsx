"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  Camera,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { useTransactionStore } from "@/stores/transactionStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { CategorySpendingChart } from "@/components/dashboard/CategorySpendingChart";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { DebtReminderBanner } from "@/components/dashboard/DebtReminderBanner";
import { RecurringReminderBanner } from "@/components/dashboard/RecurringReminderBanner";
import { GoalAlertBanner } from "@/components/dashboard/GoalAlertBanner";
import { formatRupiah, getCurrentMonth } from "@/lib/utils";
import { useDebtStore } from "@/stores/debtStore";
import { useRecurringStore } from "@/stores/recurringStore";
import { useGoalStore } from "@/stores/goalStore";

function CashFlowStatus({ balance }: { balance: number }) {
  if (balance > 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-full">
        <TrendingUp className="w-3 h-3" /> Aman
      </span>
    );
  if (balance < 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50/80 px-2 py-0.5 rounded-full">
        <TrendingDown className="w-3 h-3" /> Perlu Hati-hati
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50/80 px-2 py-0.5 rounded-full">
      <Minus className="w-3 h-3" /> Waspada
    </span>
  );
}

export default function DashboardPage() {
  const { transactions, loadTransactions } = useTransactionStore();
  const { loadSettings } = useSettingsStore();
  const { loadDebts } = useDebtStore();
  const { loadTemplates } = useRecurringStore();
  const { loadGoals } = useGoalStore();
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentMonth = getCurrentMonth();
  const monthLabel = format(new Date(), "MMMM yyyy", { locale: id });

  useEffect(() => {
    setMounted(true);
    loadTransactions();
    loadSettings();
    loadDebts();
    loadTemplates();
    loadGoals();
  }, [loadTransactions, loadSettings, loadDebts, loadTemplates, loadGoals]);

  const monthlyTransactions = useMemo(
    () => transactions.filter((t) => t.date.startsWith(currentMonth)),
    [transactions, currentMonth],
  );

  const incomeTransactions = useMemo(
    () => monthlyTransactions.filter((t) => t.type === "income"),
    [monthlyTransactions],
  );
  const expenseTransactions = useMemo(
    () => monthlyTransactions.filter((t) => t.type === "expense"),
    [monthlyTransactions],
  );
  const savingTransactions = useMemo(
    () => monthlyTransactions.filter((t) => t.type === "saving"),
    [monthlyTransactions],
  );
  const income = useMemo(
    () => incomeTransactions.reduce((s, t) => s + t.amount, 0),
    [incomeTransactions],
  );
  const expense = useMemo(
    () => expenseTransactions.reduce((s, t) => s + t.amount, 0),
    [expenseTransactions],
  );
  const saving = useMemo(
    () => savingTransactions.reduce((s, t) => s + t.amount, 0),
    [savingTransactions],
  );
  const balance = income - expense - saving;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden pt-14"
        style={{
          background:
            "linear-gradient(135deg, #075985 0%, #0284C7 45%, #38BDF8 100%)",
        }}
      >
        {/* Settings link */}
        <Link
          href="/settings"
          className="absolute top-3 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white"
        >
          <Settings className="w-5 h-5" />
        </Link>

        <div className="px-5 pt-4 pb-8">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
            {monthLabel}
          </p>
          <p className="text-sm text-white/80 mb-1">Saldo Bulan Ini</p>
          <motion.p
            key={balance}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white tracking-tight mb-2"
          >
            {balance >= 0 ? "" : "-"}
            {formatRupiah(Math.abs(balance))}
          </motion.p>
          <CashFlowStatus balance={balance} />
        </div>

        {/* Summary Cards */}
        <div className="mx-4 mb-0 grid grid-cols-3 gap-2 pb-5">
          {/* Pemasukan */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl px-3 py-3 shadow-sm border border-sky-100 dark:border-slate-700/60"
          >
            <div className="flex items-center gap-1 mb-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Masuk
              </span>
            </div>
            <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400 leading-tight">
              {formatRupiah(income)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{incomeTransactions.length}x</p>
          </motion.div>

          {/* Pengeluaran */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl px-3 py-3 shadow-sm border border-sky-100 dark:border-slate-700/60"
          >
            <div className="flex items-center gap-1 mb-1.5">
              <TrendingDown className="w-3 h-3 text-rose-500" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Keluar
              </span>
            </div>
            <p className="text-sm font-bold text-rose-500 dark:text-rose-400 leading-tight">
              {formatRupiah(expense)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{expenseTransactions.length}x</p>
          </motion.div>

          {/* Tabungan */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl px-3 py-3 shadow-sm border border-sky-100 dark:border-slate-700/60"
          >
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-[10px]">🏦</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Tabungan
              </span>
            </div>
            <p className="text-sm font-bold text-teal-600 dark:text-teal-400 leading-tight">
              {formatRupiah(saving)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{savingTransactions.length}x</p>
          </motion.div>
        </div>

        {/* Wave bottom */}
        <div
          className="h-6 bg-sky-50 dark:bg-[#0B1120]"
          style={{ borderTopLeftRadius: "28px", borderTopRightRadius: "28px" }}
        />
      </div>

      <PageWrapper className="mt-0">
        <div className="space-y-4 pb-28">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(true)}
              className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-800/60 rounded-2xl py-5 shadow-sm border border-sky-100 dark:border-slate-700/60 active:bg-sky-50 dark:active:bg-slate-700"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Catat Transaksi
              </span>
            </motion.button>

            <Link href="/scan">
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-800/60 rounded-2xl py-5 shadow-sm border border-sky-100 dark:border-slate-700/60 active:bg-sky-50 dark:active:bg-slate-700 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Scan Struk
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Recurring Reminder Banner */}
          <RecurringReminderBanner />

          {/* Debt Reminder Banner */}
          <DebtReminderBanner />

          {/* Goal Alert Banner */}
          <GoalAlertBanner />

          {/* AI Insight Card */}
          <AIInsightCard />

          {/* Category Spending Chart */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
              Top Pengeluaran Bulan Ini
            </p>
            <CategorySpendingChart transactions={transactions} />
          </div>

          {/* Monthly Chart */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
            <MonthlyChart transactions={transactions} />
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Transaksi Bulan Ini
              </h2>
              <Link
                href="/transactions"
                className="text-xs font-semibold text-sky-600 dark:text-sky-400"
              >
                Lihat semua →
              </Link>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 overflow-hidden">
              <TransactionList
                month={currentMonth}
                onAddClick={() => setShowForm(true)}
              />
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Bottom Nav */}
      <BottomNav />

      {/* Add Transaction Sheet */}
      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Catat Transaksi"
      >
        <TransactionForm onSuccess={() => setShowForm(false)} />
      </BottomSheet>
    </div>
  );
}
