'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';

type Period = 'today' | 'week' | 'month';

interface ChartData {
  label: string;
  sales: number;
  orders: number;
}

export default function SalesChart() {
  const [period, setPeriod] = useState<Period>('today');

  const chartData: Record<Period, ChartData[]> = {
    today: [
      { label: '12 AM', sales: 120, orders: 8 },
      { label: '3 AM', sales: 45, orders: 3 },
      { label: '6 AM', sales: 180, orders: 12 },
      { label: '9 AM', sales: 450, orders: 28 },
      { label: '12 PM', sales: 890, orders: 52 },
      { label: '3 PM', sales: 720, orders: 45 },
      { label: '6 PM', sales: 985, orders: 58 },
      { label: '9 PM', sales: 645, orders: 38 },
    ],
    week: [
      { label: 'Mon', sales: 2800, orders: 145 },
      { label: 'Tue', sales: 2500, orders: 130 },
      { label: 'Wed', sales: 3200, orders: 168 },
      { label: 'Thu', sales: 2900, orders: 150 },
      { label: 'Fri', sales: 3800, orders: 198 },
      { label: 'Sat', sales: 4200, orders: 218 },
      { label: 'Sun', sales: 3500, orders: 182 },
    ],
    month: [
      { label: 'Week 1', sales: 18500, orders: 945 },
      { label: 'Week 2', sales: 19200, orders: 1008 },
      { label: 'Week 3', sales: 17800, orders: 920 },
      { label: 'Week 4', sales: 20500, orders: 1065 },
    ],
  };

  const data = chartData[period];
  const maxSales = Math.max(...data.map((d) => d.sales));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Sales & Orders</h3>
        <Activity className="text-amber-600" size={20} />
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {(['today', 'week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {data.map((item) => {
          const height = (item.sales / maxSales) * 100;
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs font-medium text-slate-400">{item.label}</span>
                <span className="text-xs font-semibold text-amber-600">{item.sales} DH</span>
              </div>
              <div className="h-8 bg-slate-700 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg transition-all duration-300"
                  style={{ width: `${height}%`, minWidth: '4px' }}
                ></div>
              </div>
              <div className="text-xs text-slate-500">{item.orders} orders</div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-sm font-medium transition-colors">
        Detailed Analytics
      </button>
    </div>
  );
}
