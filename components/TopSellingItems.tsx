'use client';

import { TrendingUp } from 'lucide-react';

interface TopItem {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  trend: number;
}

interface TopSellingItemsProps {
  items?: TopItem[];
}

export default function TopSellingItems({ items }: TopSellingItemsProps) {
  const defaultItems: TopItem[] = [
    { id: 1, name: 'Cappuccino', sales: 48, revenue: 576, trend: 12 },
    { id: 2, name: 'Burger Elkahmed', sales: 35, revenue: 665, trend: 8 },
    { id: 3, name: 'Pizza Margherita', sales: 28, revenue: 560, trend: -3 },
    { id: 4, name: 'Iced Tea', sales: 22, revenue: 110, trend: 5 },
    { id: 5, name: 'Falafel Wrap', sales: 18, revenue: 288, trend: 2 },
  ];

  const displayItems = items || defaultItems;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Top Selling Items</h3>
        <TrendingUp className="text-amber-600" size={20} />
      </div>

      <div className="space-y-4">
        {displayItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between pb-4 border-b border-slate-700 last:pb-0 last:border-0">
            <div className="flex-1">
              <p className="font-medium text-white">{item.name}</p>
              <p className="text-xs text-slate-400 mt-1">{item.sales} sales</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-amber-600">{item.revenue} DH</p>
              <p className={`text-xs font-medium ${item.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {item.trend >= 0 ? '+' : ''}{item.trend}%
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-sm font-medium transition-colors">
        View Full Report
      </button>
    </div>
  );
}
