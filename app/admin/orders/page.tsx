'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import OrdersFilters from '@/components/OrdersFilters';
import OrderCards from '@/components/OrderCards';
import OrderDetails from '@/components/OrderDetails';
import { fetchOrders } from '@/lib/orders-actions';
import { useAdminSearch } from '@/components/AdminSearchContext';
import { matchesSearch } from '@/lib/search-utils';
import { useNotificationSounds } from '@/components/useNotificationSounds';
import { playSoundUrl } from '@/lib/play-sound';
import { ar } from '@/lib/ar';

interface Order {
  id: number;
  table_number: number;
  items: string;
  total_amount: number;
  status: 'new' | 'preparing' | 'ready' | 'served' | 'cancelled';
  created_at: string;
}

export default function OrdersPage() {
  const { query } = useAdminSearch();
  const { newOrderSoundUrl } = useNotificationSounds();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('today');
  const [status, setStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const knownNewOrderIds = useRef<Set<number>>(new Set());
  const isInitialLoad = useRef(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrders({ dateRange, status: status === 'all' ? undefined : status });
      const list = data || [];
      const newOrders = list.filter((o) => o.status === 'new');

      if (!isInitialLoad.current) {
        const hasFreshNew = newOrders.some((o) => !knownNewOrderIds.current.has(o.id));
        if (hasFreshNew) {
          void playSoundUrl(newOrderSoundUrl);
        }
      }

      knownNewOrderIds.current = new Set(newOrders.map((o) => o.id));
      isInitialLoad.current = false;
      setOrders(list);
    } catch (err) {
      setError((err as Error).message || 'فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    isInitialLoad.current = true;
    knownNewOrderIds.current = new Set();
    loadOrders();
  }, [dateRange, status]);

  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [dateRange, status]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) =>
        matchesSearch(query, o.id, o.table_number, o.items, o.status, o.total_amount)
      ),
    [orders, query]
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">إدارة الطلبات</h1>
          <p className="mt-1 text-sm text-slate-400">تتبّع وأدر جميع طلبات المطعم لحظياً.</p>
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

      <OrdersFilters
        dateRange={dateRange}
        status={status}
        onDateRangeChange={setDateRange}
        onStatusChange={setStatus}
      />

      {loading && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-12 text-center">
          <p className="text-lg text-slate-400">{ar.loading}</p>
        </div>
      )}

      {!loading && (
        <div>
          <p className="mb-4 text-sm text-slate-400">
            {filteredOrders.length === 0
              ? 'لا توجد طلبات حالياً'
              : `تم العثور على ${filteredOrders.length} طلب`}
          </p>
          <OrderCards orders={filteredOrders} onSelectOrder={setSelectedOrder} />
        </div>
      )}

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={loadOrders}
        />
      )}
    </div>
  );
}
