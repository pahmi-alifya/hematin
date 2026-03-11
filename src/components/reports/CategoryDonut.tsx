'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatRupiah } from '@/lib/utils'

interface CategoryDonutProps {
  data: Array<{
    id: string
    name: string
    icon: string
    amount: number
    color: string
    bgColor: string
  }>
  total: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { icon: string } }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-sky-100 dark:border-slate-700 px-3 py-2 text-xs pointer-events-none">
      <p className="font-semibold text-slate-700 dark:text-slate-200">
        {item.payload.icon} {item.name}
      </p>
      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{formatRupiah(item.value)}</p>
    </div>
  )
}

export function CategoryDonut({ data, total }: CategoryDonutProps) {
  if (data.length === 0) return null

  return (
    <div className="flex items-center gap-4">
      {/* Donut */}
      <div className="shrink-0" style={{ width: 120, height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={56}
              dataKey="amount"
              nameKey="name"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.id} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {data.slice(0, 5).map((item) => {
          const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0
          return (
            <div key={item.id} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1 min-w-0">
                {item.icon} {item.name}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                {pct}%
              </span>
            </div>
          )
        })}
        {data.length > 5 && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            +{data.length - 5} kategori lainnya
          </p>
        )}
      </div>
    </div>
  )
}
