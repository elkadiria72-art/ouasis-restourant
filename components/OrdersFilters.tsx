'use client';

import { Clock, Filter } from 'lucide-react';

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
  const dateRanges = ['today', 'yesterday', 'week', 'month'];
  const statuses = ['all', 'new', 'preparing', 'ready', 'served', 'cancelled'];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-amber-600" />
        <h3 className="text-lg font-semibold text-white">Filters</h3>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">Time Range</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {dateRanges.map((range) => (
            <button
              key={range}
              onClick={() => onDateRangeChange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">Status</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                status === s
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
