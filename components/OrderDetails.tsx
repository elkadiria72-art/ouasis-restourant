'use client';

import { useState } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { updateOrderStatus, cancelOrder } from '@/lib/orders-actions';

interface Order {
  id: number;
  table_number: number;
  items: string;
  total_amount: number;
  status: 'new' | 'preparing' | 'ready' | 'served' | 'cancelled';
  created_at: string;
}

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onStatusChange: () => void;
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

const statusTransitions: Record<string, string[]> = {
  new: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['served'],
  served: [],
  cancelled: [],
};

export default function OrderDetails({ order, onClose, onStatusChange }: OrderDetailsProps) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const calculateDuration = () => {
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    setError(null);

    try {
      await updateOrderStatus(order.id, newStatus);
      onStatusChange();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setUpdating(true);
    setError(null);

    try {
      await cancelOrder(order.id);
      onStatusChange();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 flex items-center justify-between p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Order #{order.id}</h2>
            <p className="text-slate-400 text-sm mt-1">{formatTime(order.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Status & Duration */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Status</p>
              <p
                className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border capitalize ${
                  statusColors[order.status]
                }`}
              >
                {statusLabels[order.status]}
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Duration</p>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-600" />
                <p className="text-white font-medium">{calculateDuration()}</p>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Table</p>
              <p className="text-white font-bold text-2xl">#{order.table_number}</p>
            </div>
          </div>

          {/* Items */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-300 font-medium mb-3">Items</p>
            <p className="text-slate-100 whitespace-pre-wrap">{order.items || 'No items details'}</p>
          </div>

          {/* Total Amount */}
          <div className="bg-amber-600/20 border border-amber-600/50 rounded-lg p-4">
            <p className="text-slate-300 font-medium mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-amber-600">{order.total_amount} DH</p>
          </div>

          {/* Status Actions */}
          {statusTransitions[order.status].length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
              <p className="text-slate-300 font-medium">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {statusTransitions[order.status].map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed capitalize"
                  >
                    Mark as {nextStatus}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cancel Button */}
          {order.status !== 'cancelled' && order.status !== 'served' && (
            <button
              onClick={handleCancel}
              disabled={updating}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
