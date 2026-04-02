'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { CreditCard, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { useDebtStore } from '@/stores/debtStore'
import { formatRupiah } from '@/lib/utils'
import type { Debt } from '@/types'

function fmt(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`
  return `${v}`
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; payload: { label: string } }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-sky-100 dark:border-slate-700 px-3 py-2 text-xs pointer-events-none">
      <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">{item.payload.label}</p>
      <p className="font-bold text-slate-800 dark:text-slate-100">Rp {fmt(item.value)}</p>
    </div>
  )
}

function StatBadge({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
      <Icon className={`w-4 h-4 ${color}`} />
      <p className={`text-sm font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-400 text-center leading-tight">{label}</p>
    </div>
  )
}

export function DebtSummaryChart() {
  const debts = useDebtStore((s) => s.debts)
  const getTotalHutang = useDebtStore((s) => s.getTotalHutang)
  const getTotalPiutang = useDebtStore((s) => s.getTotalPiutang)

  const totalHutang = getTotalHutang()
  const totalPiutang = getTotalPiutang()

  const overdueCount = debts.filter((d: Debt) => d.status === 'overdue').length
  const activeCount = debts.filter((d: Debt) => d.status === 'active').length
  const paidCount = debts.filter((d: Debt) => d.status === 'paid').length

  const barData = useMemo(
    () => [
      { label: 'Hutang', value: totalHutang, color: '#EF4444' },
      { label: 'Piutang', value: totalPiutang, color: '#10B981' },
    ],
    [totalHutang, totalPiutang]
  )

  const hasData = totalHutang > 0 || totalPiutang > 0

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={barData} barCategoryGap="45%">
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmt}
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                width={38}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.06)', radius: 6 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52}>
                {barData.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Net posisi */}
          {(totalHutang > 0 || totalPiutang > 0) && (
            <div className={`flex items-center justify-between px-4 py-3 rounded-2xl ${
              totalPiutang >= totalHutang
                ? 'bg-emerald-50 dark:bg-emerald-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Posisi Bersih</p>
                <p className={`text-base font-bold ${
                  totalPiutang >= totalHutang ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {totalPiutang >= totalHutang ? '+' : '-'}
                  {formatRupiah(Math.abs(totalPiutang - totalHutang))}
                </p>
              </div>
              <CreditCard className={`w-5 h-5 ${
                totalPiutang >= totalHutang ? 'text-emerald-500' : 'text-red-400'
              }`} />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 text-slate-400 dark:text-slate-500">
          <CreditCard className="w-8 h-8 opacity-40" />
          <p className="text-sm">Belum ada data hutang/piutang</p>
        </div>
      )}

      {/* Status breakdown */}
      <div className="flex gap-2">
        <StatBadge
          icon={AlertCircle}
          label="Terlambat"
          value={overdueCount}
          color="text-red-500"
        />
        <StatBadge
          icon={Clock}
          label="Aktif"
          value={activeCount}
          color="text-amber-500"
        />
        <StatBadge
          icon={CheckCircle2}
          label="Lunas"
          value={paidCount}
          color="text-emerald-500"
        />
      </div>
    </div>
  )
}
