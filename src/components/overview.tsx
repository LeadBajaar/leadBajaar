"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.dataKey}:</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

interface OverviewProps {
  data?: any[]
}

export function Overview({ data }: OverviewProps) {
  const chartData = data || []

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
        <CartesianGrid vertical={false} stroke="hsl(214 32% 91%)" strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#94A3B8" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#94A3B8" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(238 100% 97% / 0.5)" }} />
        <Bar dataKey="leads" fill="#6366F1" radius={[6, 6, 0, 0]} />
        <Bar dataKey="meetings" fill="#10B981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

