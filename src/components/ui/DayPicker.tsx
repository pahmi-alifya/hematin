"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Pill picker tanggal berulang 1–28 (aman di semua bulan) - dipakai di form transaksi & recurring. */
export function DayPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (day: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
        <motion.button
          key={day}
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => onChange(day)}
          className={cn(
            "w-9 h-9 rounded-xl text-sm font-semibold transition-all",
            value === day
              ? "bg-sky-500 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600",
          )}
        >
          {day}
        </motion.button>
      ))}
    </div>
  );
}
