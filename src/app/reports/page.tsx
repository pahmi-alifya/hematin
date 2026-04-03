"use client";

import { useState, useEffect, useMemo } from "react";
import { format, subMonths, addMonths, parseISO, getDaysInMonth } from "date-fns";
import { id } from "date-fns/locale";
import {
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  CalendarDays,
  Target,
  BarChart2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { CategoryDonut } from "@/components/reports/CategoryDonut";
import { DebtSummaryChart } from "@/components/reports/DebtSummaryChart";
import { useTransactionStore } from "@/stores/transactionStore";
import { useDebtStore } from "@/stores/debtStore";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { formatRupiah, getCurrentMonth, cn } from "@/lib/utils";

export default function ReportsPage() {
  const { transactions, isLoading, loadTransactions } = useTransactionStore();
  const { loadDebts } = useDebtStore();
  const [month, setMonth] = useState(getCurrentMonth());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadTransactions();
    loadDebts();
  }, [loadTransactions, loadDebts]);

  function prevMonth() {
    setShowAll(false);
    setMonth((m) => format(subMonths(parseISO(m + "-01"), 1), "yyyy-MM"));
  }

  function nextMonth() {
    const next = format(addMonths(parseISO(month + "-01"), 1), "yyyy-MM");
    if (next <= getCurrentMonth()) {
      setShowAll(false);
      setMonth(next);
    }
  }

  const isCurrentMonth = month === getCurrentMonth();
  const monthLabel = format(parseISO(month + "-01"), "MMMM yyyy", {
    locale: id,
  });

  const filteredTx = useMemo(
    () =>
      showAll
        ? transactions
        : transactions.filter((t) => t.date.startsWith(month)),
    [transactions, month, showAll],
  );

  const income = useMemo(
    () =>
      filteredTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
    [filteredTx],
  );
  const expense = useMemo(
    () =>
      filteredTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    [filteredTx],
  );

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTx
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] ?? 0) + t.amount;
      });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [filteredTx]);

  const donutData = useMemo(
    () =>
      byCategory.map(([catId, amount]) => {
        const cat = EXPENSE_CATEGORIES.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat?.name ?? catId,
          icon: cat?.icon ?? "📦",
          amount,
          color: cat?.color ?? "#64748B",
          bgColor: cat?.bgColor ?? "#F1F5F9",
        };
      }),
    [byCategory],
  );

  // Daily stats (only for specific month, not "Semua")
  const dailyStats = useMemo(() => {
    if (showAll) return null
    const monthDate = parseISO(month + "-01")
    const daysInMonth = getDaysInMonth(monthDate)
    const daysElapsed = isCurrentMonth ? new Date().getDate() : daysInMonth

    const avgExpense = daysElapsed > 0 ? expense / daysElapsed : 0
    const avgIncome = daysElapsed > 0 ? income / daysElapsed : 0

    // Hari paling boros
    const expenseByDay: Record<string, number> = {}
    filteredTx
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expenseByDay[t.date] = (expenseByDay[t.date] ?? 0) + t.amount
      })
    const busiestEntry = Object.entries(expenseByDay).sort(([, a], [, b]) => b - a)[0]
    const busiestDay = busiestEntry
      ? format(parseISO(busiestEntry[0]), "EEE, d MMM", { locale: id })
      : null
    const busiestAmount = busiestEntry?.[1] ?? 0

    // Hari aktif (ada pengeluaran)
    const activeDays = Object.keys(expenseByDay).length

    // Proyeksi akhir bulan (hanya bulan berjalan)
    const projection = isCurrentMonth ? Math.round(avgExpense * daysInMonth) : null

    return { avgExpense, avgIncome, busiestDay, busiestAmount, activeDays, daysElapsed, daysInMonth, projection }
  }, [showAll, month, isCurrentMonth, expense, income, filteredTx])

  const byIncomeCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTx
      .filter((t) => t.type === "income")
      .forEach((t) => {
        map[t.category] = (map[t.category] ?? 0) + t.amount;
      });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [filteredTx]);

  const incomeDonutData = useMemo(
    () =>
      byIncomeCategory.map(([catId, amount]) => {
        const cat = INCOME_CATEGORIES.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat?.name ?? catId,
          icon: cat?.icon ?? "💰",
          amount,
          color: cat?.color ?? "#10B981",
          bgColor: cat?.bgColor ?? "#ECFDF5",
        };
      }),
    [byIncomeCategory],
  );

  // Bulan yang ditampilkan di chart: jika "Semua", tampilkan bulan saat ini
  const chartMonth = showAll ? getCurrentMonth() : month;

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title="Laporan" />

      <PageWrapper>
        <div className="pb-28 space-y-4">
          {/* Month Navigator */}
          <div className="flex items-center bg-white dark:bg-slate-800/60 rounded-2xl px-3 py-3 shadow-sm border border-sky-100 dark:border-slate-700/60 gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAll(true)}
              className={cn(
                "shrink-0 h-7 px-2.5 rounded-xl text-xs font-semibold transition-all",
                showAll
                  ? "bg-sky-500 text-white"
                  : "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
              )}
            >
              Semua
            </motion.button>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

            <div className="flex-1 flex items-center justify-between">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={prevMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {showAll ? "Semua Data" : monthLabel}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={nextMonth}
                disabled={showAll || isCurrentMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Pemasukan
                </span>
              </div>
              <p className="text-lg font-bold text-emerald-600">
                {formatRupiah(income)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Pengeluaran
                </span>
              </div>
              <p className="text-lg font-bold text-red-500">
                {formatRupiah(expense)}
              </p>
            </div>
          </div>

          {/* Daily Chart — mengikuti filter bulan */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
            {isLoading ? (
              <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
            ) : transactions.length === 0 ? (
              <EmptyState
                icon="📊"
                title="Belum ada data"
                description="Mulai catat transaksi untuk melihat laporan"
                className="py-8"
              />
            ) : (
              <MonthlyChart transactions={transactions} externalMonth={chartMonth} />
            )}
          </div>

          {/* Category Donut */}
          {donutData.length > 0 && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
                Distribusi Pengeluaran
              </p>
              <CategoryDonut data={donutData} total={expense} />
            </div>
          )}

          {/* Income Donut */}
          {incomeDonutData.length > 0 && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
                Distribusi Pemasukan
              </p>
              <CategoryDonut data={incomeDonutData} total={income} />
            </div>
          )}

          {/* Debt Summary Chart */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Hutang & Piutang
            </p>
            <DebtSummaryChart />
          </div>

          {/* Net Cash Flow */}
          {(income > 0 || expense > 0) && (() => {
            const net = income - expense
            const isPositive = net >= 0
            const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0
            const expenseRatio = income > 0 ? Math.min(Math.round((expense / income) * 100), 100) : 100

            return (
              <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4 space-y-4">
                {/* Header + Net */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Net Cash Flow</p>
                    <p className={`text-2xl font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                      {isPositive ? "+" : ""}{formatRupiah(net)}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {isPositive ? "Keuangan bulan ini sehat" : "Pengeluaran melebihi pemasukan"}
                    </p>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-xl text-xs font-bold ${isPositive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400"}`}>
                    {isPositive ? "✓ Surplus" : "✗ Defisit"}
                  </div>
                </div>

                {/* Progress bar: expense vs income */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span>Pengeluaran dari pemasukan</span>
                    <span className={`font-semibold ${expenseRatio >= 90 ? "text-rose-500" : expenseRatio >= 70 ? "text-amber-500" : "text-emerald-500"}`}>
                      {expenseRatio}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${expenseRatio >= 90 ? "bg-rose-500" : expenseRatio >= 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                      style={{ width: `${expenseRatio}%` }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-3 py-2.5 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">Saving Rate</p>
                    <p className={`text-sm font-bold ${savingsRate > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                      {savingsRate > 0 ? savingsRate : 0}%
                    </p>
                  </div>
                  <div className="px-3 py-2.5 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">Pemasukan</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {filteredTx.filter(t => t.type === 'income').length}x
                    </p>
                  </div>
                  <div className="px-3 py-2.5 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">Pengeluaran</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {filteredTx.filter(t => t.type === 'expense').length}x
                    </p>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Daily Stats */}
          {dailyStats && expense > 0 && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm p-4 space-y-4">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Ringkasan Harian</p>

              {/* Top 2 stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wide">Rata-rata/hari</span>
                  </div>
                  <p className="text-base font-bold text-rose-600 dark:text-rose-400 leading-tight">
                    {formatRupiah(Math.round(dailyStats.avgExpense))}
                  </p>
                  <p className="text-[10px] text-rose-400 dark:text-rose-500 mt-0.5">pengeluaran</p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wide">Rata-rata/hari</span>
                  </div>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                    {formatRupiah(Math.round(dailyStats.avgIncome))}
                  </p>
                  <p className="text-[10px] text-emerald-400 dark:text-emerald-500 mt-0.5">pemasukan</p>
                </div>
              </div>

              {/* Divider stats row */}
              <div className="divide-y divide-slate-100 dark:divide-slate-700 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                {/* Hari paling boros */}
                {dailyStats.busiestDay && (
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">Hari paling boros</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{formatRupiah(dailyStats.busiestAmount)}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{dailyStats.busiestDay}</p>
                    </div>
                  </div>
                )}

                {/* Hari aktif */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">Hari aktif transaksi</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {dailyStats.activeDays} <span className="font-normal text-slate-400 dark:text-slate-500">dari {dailyStats.daysElapsed} hari</span>
                  </p>
                </div>

                {/* Proyeksi — hanya bulan berjalan */}
                {dailyStats.projection !== null && (
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">Proyeksi akhir bulan</span>
                    </div>
                    <p className="text-xs font-bold text-violet-600 dark:text-violet-400">
                      {formatRupiah(dailyStats.projection)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </PageWrapper>

      <BottomNav />
    </div>
  );
}
