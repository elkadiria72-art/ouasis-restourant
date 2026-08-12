'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import TablesGrid from '@/components/TablesGrid';
import TableDetails from '@/components/TableDetails';
import { fetchTables } from '@/lib/tables-actions';

interface Table {
  id: number;
  table_number: number;
  status: 'empty' | 'occupied' | 'needs_attention';
  waiter_call: boolean;
  current_order_amount?: number;
  duration_minutes?: number;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTables();
      setTables(data || []);
    } catch (err) {
      setError((err as Error).message || 'Failed to load tables');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTables();
    setRefreshing(false);
  };

  useEffect(() => {
    loadTables();
  }, []);

  // Auto-refresh every 10 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(handleRefresh, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    empty: tables.filter((t) => t.status === 'empty').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    needsAttention: tables.filter((t) => t.status === 'needs_attention').length,
    waiterCalls: tables.filter((t) => t.waiter_call).length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tables Management</h1>
          <p className="text-slate-400 mt-1">Monitor table status and manage reservations in real-time.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Available</p>
          <p className="text-3xl font-bold text-green-300">{stats.empty}</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Occupied</p>
          <p className="text-3xl font-bold text-yellow-300">{stats.occupied}</p>
        </div>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Needs Attention</p>
          <p className="text-3xl font-bold text-red-300">{stats.needsAttention}</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Waiter Calls</p>
          <p className="text-3xl font-bold text-purple-300">{stats.waiterCalls}</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-slate-400 text-lg">Loading tables...</p>
        </div>
      )}

      {/* Tables Grid */}
      {!loading && <TablesGrid tables={tables} onSelectTable={setSelectedTable} />}

      {/* Table Details Modal */}
      {selectedTable && (
        <TableDetails
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onUpdate={loadTables}
        />
      )}
    </div>
  );
}
