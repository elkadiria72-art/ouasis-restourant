'use client';

import { Filter } from 'lucide-react';
import { ar } from '@/lib/ar';

interface OrdersFiltersProps {
  dateRange: string;
  status: string;
  onDateRangeChange: (range: string) => void;
  onStatusChange: (status: string) => void;
}

export default function OrdersFilters({
  dateRange,
  status,
  onDateRangeChange,
  onStatusChange,
}: OrdersFiltersProps) {
  const dateRanges = ['today', 'yesterday', 'week', 'month'] as const;
  const statuses = ['all', 'new', 'preparing', 'ready', 'served', 'cancelled'] as const;

  return (
    <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Filter size={20} className="text-amber-600" />
        <h3 className="text-lg font-semibold text-white">التصفية</h3>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">الفترة الزمنية</label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {dateRanges.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => onDateRangeChange(range)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {ar.periods[range]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">الحالة</label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStatusChange(s)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                status === s
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {ar.orderStatus[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
