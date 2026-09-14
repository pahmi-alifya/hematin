"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, subDays } from "date-fns";
import type { Locale } from "date-fns";
import type { Transaction } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { useDateLocale } from "@/hooks/useDateLocale";
import { formatRupiah, formatRupiahShort } from "@/lib/utils";
import { TYPE_COLORS } from "@/lib/constants";

interface MiniChartProps {
  transactions: Transaction[];
}

function getLast7Days(transactions: Transaction[], locale: Locale) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayTx = transactions.filter((t) => t.date === dateStr);
    return {
      label: format(date, "EEE", { locale }),
      income: dayTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
      expense: dayTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
      dateStr,
    };
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const income = payload.find((p) => p.name === "income")?.value ?? 0;
  const expense = payload.find((p) => p.name === "expense")?.value ?? 0;
  if (income === 0 && expense === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-sky-100 dark:border-slate-700 px-3 py-2 text-xs space-y-1 pointer-events-none">
      {income > 0 && (
        <p className="text-emerald-600 font-semibold">+{formatRupiahShort(income)}</p>
      )}
      {expense > 0 && (
        <p className="text-red-500 font-semibold">-{formatRupiahShort(expense)}</p>
      )}
    </div>
  );
}

export function MiniChart({ transactions }: MiniChartProps) {
  const t = useTranslation();
  const dateLocale = useDateLocale();
  const data = getLast7Days(transactions, dateLocale);
  const today = format(new Date(), "yyyy-MM-dd");

  const weekIncome = data.reduce((s, d) => s + d.income, 0);
  const weekExpense = data.reduce((s, d) => s + d.expense, 0);
  const weekNet = weekIncome - weekExpense;

  const todayData = data.find((d) => d.dateStr === today);
  const todayIncome = todayData?.income ?? 0;
  const todayExpense = todayData?.expense ?? 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {t.dashboard.last7Days}
        </p>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            weekNet >= 0
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-900/30 text-red-500"
          }`}
        >
          {weekNet >= 0 ? "+" : ""}
          {formatRupiah(weekNet)}
        </span>
      </div>

      {/* Today snapshot */}
      {(todayIncome > 0 || todayExpense > 0) && (
        <div className="flex gap-2 mb-3">
          {todayIncome > 0 && (
            <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                {t.dashboard.incomeToday}
              </p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {formatRupiah(todayIncome)}
              </p>
            </div>
          )}
          {todayExpense > 0 && (
            <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
              <p className="text-[10px] text-red-500 font-medium">
                {t.dashboard.expenseToday}
              </p>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                {formatRupiah(todayExpense)}
              </p>
            </div>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={data} barGap={2} barCategoryGap="28%">
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(14,165,233,0.06)", radius: 6 }}
          />
          <Bar
            dataKey="income"
            name="income"
            radius={[3, 3, 0, 0]}
            maxBarSize={14}
          >
            {data.map((entry) => (
              <Cell
                key={entry.dateStr}
                fill={entry.dateStr === today ? TYPE_COLORS.income.base : TYPE_COLORS.income.muted}
              />
            ))}
          </Bar>
          <Bar
            dataKey="expense"
            name="expense"
            radius={[3, 3, 0, 0]}
            maxBarSize={14}
          >
            {data.map((entry) => (
              <Cell
                key={entry.dateStr}
                fill={entry.dateStr === today ? TYPE_COLORS.expense.base : TYPE_COLORS.expense.muted}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Week summary + legend */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" />{" "}
            {formatRupiah(weekIncome)}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />{" "}
            {formatRupiah(weekExpense)}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">{t.dashboard.sevenDaysShort}</span>
      </div>
    </div>
  );
}
