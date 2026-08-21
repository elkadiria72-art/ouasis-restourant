'use client';

import { AlertCircle } from 'lucide-react';
import { ar, formatNumberAr, formatTimeAr } from '@/lib/ar';
import { formatOrderItems } from '@/lib/order-items';

interface Order {
  id: number;
  table_number: number;
  items: string;
  total_amount: number;
  status: 'new' | 'preparing' | 'ready' | 'served' | 'cancelled';
  created_at: string;
}

interface OrderCardsProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

const statusColors = {
  new: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  preparing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  ready: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  served: 'bg-green-500/20 text-green-300 border-green-500/50',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/50',
};

export default function OrderCards({ orders, onSelectOrder }: OrderCardsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' });
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-12 text-center">
        <AlertCircle className="mx-auto mb-4 text-slate-500" size={32} />
        <p className="text-lg text-slate-400">لا توجد طلبات</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <button
          key={order.id}
          type="button"
          onClick={() => onSelectOrder(order)}
          className="group rounded-lg border border-slate-700 bg-slate-800 p-5 text-right transition-all hover:border-amber-600 hover:shadow-lg hover:shadow-amber-600/20"
        >
          <div className="mb-3 flex items-center justify-between">
            <span
              className={`rounded border px-2 py-1 text-xs font-medium ${
                statusColors[order.status]
              }`}
            >
              {ar.orderStatus[order.status]}
            </span>
            <h3 className="text-lg font-semibold text-white">طلب #{order.id}</h3>
          </div>

          <div className="mb-4 space-y-2">
            <p className="text-sm text-slate-400">
              <span className="font-medium text-slate-300">الطاولة:</span> {order.table_number}
            </p>
            <p className="line-clamp-2 text-sm text-slate-400">
              <span className="font-medium text-slate-300">الأصناف:</span>{' '}
              {formatOrderItems(order.items) || 'غير متوفر'}
            </p>
            <p className="text-sm text-slate-400">
              <span className="font-medium text-slate-300">الوقت:</span>{' '}
              {formatTimeAr(order.created_at)} • {formatDate(order.created_at)}
            </p>
          </div>

          <div className="border-t border-slate-700 pt-3">
            <p className="text-2xl font-bold text-amber-600">
              {formatNumberAr(order.total_amount)} {ar.dh}
            </p>
          </div>

          <div className="mt-3 text-xs text-slate-500 transition-colors group-hover:text-amber-600">
            ← انقر للتفاصيل
          </div>
        </button>
      ))}
    </div>
  );
}
