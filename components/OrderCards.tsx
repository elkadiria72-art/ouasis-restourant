'use client';

import { AlertCircle } from 'lucide-react';

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

const statusLabels = {
  new: 'New Order',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  cancelled: 'Cancelled',
};

export default function OrderCards({ orders, onSelectOrder }: OrderCardsProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (orders.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <AlertCircle className="mx-auto mb-4 text-slate-500" size={32} />
        <p className="text-slate-400 text-lg">No orders found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <button
          key={order.id}
          onClick={() => onSelectOrder(order)}
          className="text-left bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-amber-600 hover:shadow-lg hover:shadow-amber-600/20 transition-all group"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Order #{order.id}</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium border capitalize ${
                statusColors[order.status]
              }`}
            >
              {statusLabels[order.status]}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <p className="text-sm text-slate-400">
              <span className="text-slate-300 font-medium">Table:</span> {order.table_number}
            </p>
            <p className="text-sm text-slate-400 line-clamp-2">
              <span className="text-slate-300 font-medium">Items:</span> {order.items || 'N/A'}
            </p>
            <p className="text-sm text-slate-400">
              <span className="text-slate-300 font-medium">Time:</span>{' '}
              {formatTime(order.created_at)} • {formatDate(order.created_at)}
            </p>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-slate-700">
            <p className="text-2xl font-bold text-amber-600">{order.total_amount} DH</p>
          </div>

          {/* Hover indicator */}
          <div className="text-xs text-slate-500 mt-3 group-hover:text-amber-600 transition-colors">
            Click for details →
          </div>
        </button>
      ))}
    </div>
  );
}
