'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';
import Link from 'next/link';
import { ar, formatNumberAr } from '@/lib/ar';
import type { ChartPoint } from '@/lib/dashboard-actions';

type Period = 'today' | 'week' | 'month';

interface SalesChartProps {
  chartData: {
    today: ChartPoint[];
    week: ChartPoint[];
    month: ChartPoint[];
  };
}

export default function SalesChart({ chartData }: SalesChartProps) {
  const [period, setPeriod] = useState<Period>('today');

  const periodLabels: Record<Period, string> = {
    today: ar.periods.today,
    week: ar.periods.week,
    month: ar.periods.month,
  };

  const data = chartData[period];
  const maxSales = Math.max(...data.map((d) => d.sales), 1);
  const hasData = data.some((d) => d.sales > 0 || d.orders > 0);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{ar.dashboard.salesChart}</h3>
        <Activity className="text-amber-600" size={20} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(['today', 'week', 'month'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              period === p
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {!hasData ? (
        <p className="py-8 text-center text-slate-400">{ar.dashboard.noChartData}</p>
      ) : (
        <div className="space-y-4">
          {data.map((item) => {
            const height = (item.sales / maxSales) * 100;
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-xs font-medium text-slate-400">{item.label}</span>
                  <span className="text-xs font-semibold text-amber-600">
                    {formatNumberAr(item.sales)} {ar.dh}
                  </span>
                </div>
                <div className="h-8 overflow-hidden rounded-lg bg-slate-700">
                  <div
                    className="h-full rounded-lg bg-gradient-to-l from-amber-600 to-amber-500 transition-all duration-300"
                    style={{ width: `${height}%`, minWidth: item.sales > 0 ? '4px' : '0' }}
                  />
                </div>
                <div className="text-xs text-slate-500">
                  {formatNumberAr(item.orders)} {ar.dashboard.ordersCount}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/admin/analytics"
        className="mt-6 block w-full rounded-lg bg-slate-700 px-4 py-2 text-center text-sm font-medium text-slate-100 transition-colors hover:bg-slate-600"
      >
        {ar.dashboard.viewAnalytics}
      </Link>
    </div>
  );
}
