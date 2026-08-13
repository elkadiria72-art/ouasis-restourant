'use client';

import { ar, formatNumberAr } from '@/lib/ar';

interface Table {
  id: number;
  table_number: number;
  status: 'empty' | 'occupied' | 'needs_attention';
  waiter_call: boolean;
  current_order_amount?: number;
}

interface TablesGridProps {
  tables: Table[];
  onSelectTable: (table: Table) => void;
}

const statusColors = {
  empty: 'bg-green-500/20 border-green-500/50',
  occupied: 'bg-yellow-500/20 border-yellow-500/50',
  needs_attention: 'bg-red-500/20 border-red-500/50',
};

const statusEmoji = {
  empty: '🟢',
  occupied: '🟡',
  needs_attention: '🔴',
};

export default function TablesGrid({ tables, onSelectTable }: TablesGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
      {tables.map((table) => (
        <button
          key={table.id}
          type="button"
          onClick={() => onSelectTable(table)}
          className={`group flex aspect-square flex-col items-center justify-center rounded-lg border-2 p-3 text-center transition-all hover:shadow-lg hover:shadow-amber-600/20 ${
            statusColors[table.status]
          }`}
        >
          <span className="mb-2 text-2xl">{statusEmoji[table.status]}</span>

          <p className="mb-1 text-lg font-bold text-white">
            طاولة {String(table.table_number).padStart(2, '0')}
          </p>

          <p className="mb-2 text-xs text-slate-300">
            {ar.tableStatus[table.status]}
          </p>

          {table.waiter_call && (
            <span className="mt-1 inline-block rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
              🔔 نداء
            </span>
          )}

          {table.current_order_amount ? (
            <p className="mt-2 text-sm font-semibold text-amber-400">
              {formatNumberAr(table.current_order_amount)} {ar.dh}
            </p>
          ) : null}

          <div className="mt-2 text-xs text-slate-400 transition-colors group-hover:text-amber-600">
            انقر للتفاصيل
          </div>
        </button>
      ))}
    </div>
  );
}
