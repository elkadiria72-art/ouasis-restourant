'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import OrdersFilters from '@/components/OrdersFilters';
import OrderCards from '@/components/OrderCards';
import OrderDetails from '@/components/OrderDetails';
import { fetchOrders } from '@/lib/orders-actions';

interface Order {
  id: number;
  table_number: number;
  items: string;
  total_amount: number;
  status: 'new' | 'preparing' | 'ready' | 'served' | 'cancelled';
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('today');
  const [status, setStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrders({ dateRange, status: status === 'all' ? undefined : status });
      setOrders(data || []);
    } catch (err) {
      setError((err as Error).message || 'Failed to load orders');
      console.error(err);
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
    loadOrders();
  }, [dateRange, status]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [dateRange, status]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders Management</h1>
          <p className="text-slate-400 mt-1">Track and manage all restaurant orders in real-time.</p>
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

      {/* Filters */}
      <OrdersFilters
        dateRange={dateRange}
        status={status}
        onDateRangeChange={setDateRange}
        onStatusChange={setStatus}
      />

      {/* Loading */}
      {loading && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-slate-400 text-lg">Loading orders...</p>
        </div>
      )}

      {/* Orders Grid */}
      {!loading && (
        <div>
          <div className="mb-4">
            <p className="text-slate-400 text-sm">
              Found <span className="text-amber-600 font-semibold">{orders.length}</span> order(s)
            </p>
          </div>
          <OrderCards orders={orders} onSelectOrder={setSelectedOrder} />
        </div>
      )}

      {/* Order Details Modal */}
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
