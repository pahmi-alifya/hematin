"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionFilterSheet } from "@/components/transactions/TransactionFilterSheet";
import { useTransactionStore } from "@/stores/transactionStore";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import { useCanEditActiveWallet } from "@/hooks/useCanEditActiveWallet";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { formatRupiah } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  RefreshCw,
  Plus,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  Download,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { exportTransactionsCSV } from "@/lib/export";
import { TYPE_FILTERS, SORT_OPTIONS } from "@/lib/transactions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, SAVING_CATEGORIES } from "@/lib/categories";

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...SAVING_CATEGORIES];

export default function TransactionsPage() {
  const t = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const { transactions, loadTransactions } = useTransactionStore();
  const canEdit = useCanEditActiveWallet();
  const [showForm, setShowForm] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const {
    month,
    monthLabel,
    isCurrentMonth,
    prevMonth,
    nextMonth,
    search,
    setSearch,
    typeFilter,
    handleTypeChange,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    monthCategories,
    filteredTransactions,
    filteredStats,
    activeSheetFiltersCount,
    resetSheetFilters,
  } = useTransactionFilters(transactions);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const activeTypeFilter = TYPE_FILTERS.find((item) => item.value === typeFilter);
  const activeTypeLabel = activeTypeFilter ? t.transactions[activeTypeFilter.labelKey] : undefined;
  const activeCategory =
    categoryFilter !== "all"
      ? ALL_CATEGORIES.find((c) => c.id === categoryFilter)
      : undefined;
  const activeSortOption = SORT_OPTIONS.find((s) => s.value === sortBy);
  const activeSortLabel = activeSortOption ? t.transactions[activeSortOption.labelKey] : undefined;

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header
        title={t.nav.transactions}
        rightElement={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMoreMenu(true)}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400"
              title={t.transactions.moreMenuTooltip}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {canEdit && (
              <button
                onClick={() => setShowForm(true)}
                className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
              </button>
            )}
          </div>
        }
      />

      <BottomSheet
        open={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        title={t.transactions.moreMenuTitle}
      >
        <div className="px-4 pb-6 pt-1 flex flex-col gap-1.5">
          <Link
            href="/recurring"
            onClick={() => setShowMoreMenu(false)}
            className="flex items-center gap-3 p-3 rounded-2xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <RefreshCw className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t.transactions.recurringTransactions}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t.transactions.manageRecurringDesc}
              </p>
            </div>
          </Link>

          <button
            onClick={() => {
              exportTransactionsCSV(
                filteredTransactions,
                `hematin-${month}.csv`,
                language,
              );
              setShowMoreMenu(false);
            }}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-3 p-3 rounded-2xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors disabled:opacity-40"
          >
            <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
              <Download className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t.transactions.exportCSV}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {filteredTransactions.length === 0
                  ? t.transactions.noTransactionsToExport
                  : t.transactions.exportCount(filteredTransactions.length)}
              </p>
            </div>
          </button>
        </div>
      </BottomSheet>

      <PageWrapper>
        <div className="pb-28 space-y-3">
          {/* Month Navigator */}
          <div
            data-tour="month-navigator"
            className="flex items-center justify-between bg-white dark:bg-slate-800/60 rounded-2xl px-4 py-3 shadow-sm border border-sky-100 dark:border-slate-700/60"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {monthLabel}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.transactions.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilter(true)}
              className={cn(
                "relative h-10 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0",
                activeSheetFiltersCount > 0
                  ? "border-sky-400 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-500 dark:text-slate-400",
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {t.transactions.filterButton}
              {activeSheetFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeSheetFiltersCount}
                </span>
              )}
            </motion.button>
          </div>

          {/* Ringkasan filter aktif — cuma tampil kalau ada yang di-filter */}
          <AnimatePresence>
            {activeSheetFiltersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5">
                  {typeFilter !== "all" && (
                    <button
                      onClick={() => handleTypeChange("all")}
                      className="h-7 pl-2.5 pr-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1"
                    >
                      {activeTypeLabel}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {activeCategory && (
                    <button
                      onClick={() => setCategoryFilter("all")}
                      className="h-7 pl-2.5 pr-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1"
                    >
                      {activeCategory.icon} {activeCategory.name}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {sortBy !== "newest" && (
                    <button
                      onClick={() => setSortBy("newest")}
                      className="h-7 pl-2.5 pr-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1"
                    >
                      {activeSortLabel}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary Stats */}
          <motion.div
            key={`${month}-${typeFilter}-${categoryFilter}-${search}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 overflow-hidden"
          >
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700">
              {/* Pemasukan */}
              <div className="px-3 py-3 flex flex-col gap-0.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {t.transactions.typeShortIncome}
                  </span>
                </div>
                <p className="text-[13px] font-bold text-emerald-500 dark:text-emerald-400 leading-tight truncate">
                  {formatRupiah(filteredStats.incomeTotal)}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {filteredStats.incomeCount}x
                </p>
              </div>

              {/* Pengeluaran */}
              <div className="px-3 py-3 flex flex-col gap-0.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <TrendingDown className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {t.transactions.typeShortExpense}
                  </span>
                </div>
                <p className="text-[13px] font-bold text-rose-500 dark:text-rose-400 leading-tight truncate">
                  {formatRupiah(filteredStats.expenseTotal)}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {filteredStats.expenseCount}x
                </p>
              </div>

              {/* Tabungan */}
              <div className="px-3 py-3 flex flex-col gap-0.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px]">🏦</span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {t.transactions.typeShortSaving}
                  </span>
                </div>
                <p className="text-[13px] font-bold text-teal-600 dark:text-teal-400 leading-tight truncate">
                  {formatRupiah(filteredStats.savingTotal)}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {filteredStats.savingCount}x
                </p>
              </div>
            </div>
          </motion.div>

          {/* Transaction List */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 overflow-hidden">
            <TransactionList
              month={month}
              onAddClick={() => setShowForm(true)}
              search={search || undefined}
              typeFilter={typeFilter}
              categoryFilter={categoryFilter}
              sortBy={sortBy}
            />
          </div>
        </div>
      </PageWrapper>

      <BottomNav />

      <TransactionFilterSheet
        open={showFilter}
        onClose={() => setShowFilter(false)}
        typeFilter={typeFilter}
        onTypeChange={handleTypeChange}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        monthCategories={monthCategories}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={resetSheetFilters}
      />

      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t.transactions.addTransactionSheetTitle}
      >
        <TransactionForm onSuccess={() => setShowForm(false)} />
      </BottomSheet>
    </div>
  );
}
