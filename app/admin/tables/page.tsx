'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import TablesGrid from '@/components/TablesGrid';
import TableDetails from '@/components/TableDetails';
import { fetchTables } from '@/lib/tables-actions';
import { useAdminSearch } from '@/components/AdminSearchContext';
import { matchesSearch } from '@/lib/search-utils';
import { ar, formatNumberAr } from '@/lib/ar';
import { isOnline, loadCachedDataset } from '@/lib/offline-cache';

interface Table {
  id: number;
  table_number: number;
  status: 'empty' | 'occupied' | 'needs_attention';
  waiter_call: boolean;
  current_order_amount?: number;
  duration_minutes?: number;
}

export default function TablesPage() {
  const { query } = useAdminSearch();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTables = async () => {
    try {
      setLoading(tables.length === 0);
      setError(null);
      const result = await loadCachedDataset<Table[]>('tables:all', fetchTables, (cached) => {
        setTables(cached.data || []);
        setLoading(false);
      });
      setTables(result.data || []);
    } catch (err) {
      setError((err as Error).message || 'فشل تحميل الطاولات');
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline()) void handleRefresh();
    }, 10000);
    const handleReconnect = () => void loadTables();
    window.addEventListener('admin-connection-restored', handleReconnect);
    return () => {
      clearInterval(interval);
      window.removeEventListener('admin-connection-restored', handleReconnect);
    };
  }, []);

  const filteredTables = useMemo(
    () =>
      tables.filter((t) =>
        matchesSearch(
          query,
          t.table_number,
          t.status,
          ar.tableStatus[t.status]
        )
      ),
    [tables, query]
  );

  const stats = {
    empty: tables.filter((t) => t.status === 'empty').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    needsAttention: tables.filter((t) => t.status === 'needs_attention').length,
    waiterCalls: tables.filter((t) => t.waiter_call).length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">إدارة الطاولات</h1>
          <p className="mt-1 text-sm text-slate-400">
            راقب حالة الطاولات وأدرها لحظياً.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          {ar.refresh}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-green-500/50 bg-green-500/20 p-4 text-right">
          <p className="text-sm text-slate-400">متاحة</p>
          <p className="text-3xl font-bold text-green-300">{formatNumberAr(stats.empty)}</p>
        </div>
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/20 p-4 text-right">
          <p className="text-sm text-slate-400">{ar.tableStatus.occupied}</p>
          <p className="text-3xl font-bold text-yellow-300">{formatNumberAr(stats.occupied)}</p>
        </div>
        <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-right">
          <p className="text-sm text-slate-400">{ar.tableStatus.needs_attention}</p>
          <p className="text-3xl font-bold text-red-300">{formatNumberAr(stats.needsAttention)}</p>
        </div>
        <div className="rounded-lg border border-purple-500/50 bg-purple-500/20 p-4 text-right">
          <p className="text-sm text-slate-400">نداءات النادل</p>
          <p className="text-3xl font-bold text-purple-300">{formatNumberAr(stats.waiterCalls)}</p>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-12 text-center">
          <p className="text-lg text-slate-400">{ar.loading}</p>
        </div>
      )}

      {!loading && (
        <>
          {query && (
            <p className="text-sm text-slate-400">
              {filteredTables.length} نتيجة للبحث «{query}»
            </p>
          )}
          <TablesGrid tables={filteredTables} onSelectTable={setSelectedTable} />
        </>
      )}

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
