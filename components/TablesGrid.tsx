'use client';

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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {tables.map((table) => (
        <button
          key={table.id}
          onClick={() => onSelectTable(table)}
          className={`aspect-square rounded-lg border-2 transition-all hover:shadow-lg hover:shadow-amber-600/20 flex flex-col items-center justify-center p-3 text-center group ${
            statusColors[table.status]
          }`}
        >
          {/* Status Indicator */}
          <span className="text-2xl mb-2">{statusEmoji[table.status]}</span>

          {/* Table Number */}
          <p className="text-lg font-bold text-white mb-1">
            Table {String(table.table_number).padStart(2, '0')}
          </p>

          {/* Status Text */}
          <p className="text-xs text-slate-300 capitalize mb-2">
            {table.status.replace('_', ' ')}
          </p>

          {/* Waiter Call Badge */}
          {table.waiter_call && (
            <span className="inline-block px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded mt-1">
              🔔 CALL
            </span>
          )}

          {/* Amount */}
          {table.current_order_amount && (
            <p className="text-amber-400 font-semibold text-sm mt-2">
              {table.current_order_amount} DH
            </p>
          )}

          {/* Click hint */}
          <div className="text-xs text-slate-400 mt-2 group-hover:text-amber-600 transition-colors">
            Click for details
          </div>
        </button>
      ))}
    </div>
  );
}
