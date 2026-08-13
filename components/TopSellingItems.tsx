'use client';

import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { ar, formatNumberAr } from '@/lib/ar';

interface TopItem {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

interface TopSellingItemsProps {
  items: TopItem[];
}

export default function TopSellingItems({ items }: TopSellingItemsProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{ar.dashboard.topSelling}</h3>
        <TrendingUp className="text-amber-600" size={20} />
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-slate-400">{ar.dashboard.noProducts}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-slate-700 pb-4 last:border-0 last:pb-0"
            >
              <div className="min-w-0 flex-1 pe-3">
                <p className="truncate font-medium text-white">{item.name}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatNumberAr(item.sales)} مبيعة
                </p>
              </div>
              <div className="text-left">
                <p className="font-semibold text-amber-600">
                  {formatNumberAr(item.revenue)} {ar.dh}
                </p>
              </div>
            </div>
          ))}
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
