"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  TYPE_FILTERS,
  SORT_OPTIONS,
  type TypeFilter,
  type SortBy,
} from "@/lib/transactions";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getCategoryLabel } from "@/lib/categories";
import type { Category } from "@/types";

const TYPE_ACTIVE_CLASS: Record<Exclude<TypeFilter, "all">, string> = {
  income: "bg-emerald-500 text-white shadow-sm",
  expense: "bg-rose-500 text-white shadow-sm",
  saving: "bg-teal-500 text-white shadow-sm",
};

interface TransactionFilterSheetProps {
  open: boolean;
  onClose: () => void;
  typeFilter: TypeFilter;
  onTypeChange: (t: TypeFilter) => void;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  monthCategories: Category[];
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
  onReset: () => void;
}

/** Sheet konsolidasi Tipe + Kategori + Sort - satu tempat, bukan 3 baris pills menumpuk di halaman. */
export function TransactionFilterSheet({
  open,
  onClose,
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  monthCategories,
  sortBy,
  onSortChange,
  onReset,
}: TransactionFilterSheetProps) {
  const t = useTranslation();
  const language = useLanguageStore((s) => s.language);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t.transactions.filterSheetTitle}
    >
      <div className="px-5 pb-6 pt-1 space-y-5">
        {/* Tipe */}
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {t.transactions.sectionType}
          </p>
          <div className="flex gap-2">
            {TYPE_FILTERS.map((item) => (
              <motion.button
                key={item.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTypeChange(item.value)}
                className={cn(
                  "flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all",
                  typeFilter === item.value
                    ? item.value === "all"
                      ? "bg-sky-500 text-white shadow-sm"
                      : TYPE_ACTIVE_CLASS[item.value]
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                )}
              >
                <span>{item.icon}</span>
                <span>{t.transactions[item.labelKey]}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Kategori - cuma tampil kalau ada kategori di bulan ini */}
        {monthCategories.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              {t.common.category}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCategoryChange("all")}
                className={cn(
                  "h-8 px-3 rounded-full text-xs font-semibold transition-all",
                  categoryFilter === "all"
                    ? "bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                )}
              >
                {t.transactions.allCategories}
              </button>
              {monthCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    onCategoryChange(cat.id === categoryFilter ? "all" : cat.id)
                  }
                  className={cn(
                    "h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all",
                    categoryFilter === cat.id
                      ? "text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                  )}
                  style={
                    categoryFilter === cat.id
                      ? { backgroundColor: cat.color }
                      : undefined
                  }
                >
                  <span>{cat.icon}</span>
                  {getCategoryLabel(cat, language)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Urutkan */}
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {t.transactions.sectionSort}
          </p>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSortChange(opt.value)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors",
                  sortBy === opt.value
                    ? "text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-900/20"
                    : "text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/60",
                )}
              >
                {t.transactions[opt.labelKey]}
                {sortBy === opt.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        <Button variant="secondary" fullWidth onClick={onReset}>
          {t.transactions.resetFilter}
        </Button>
      </div>
    </BottomSheet>
  );
}
