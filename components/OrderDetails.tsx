'use client';

import { useState } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { updateOrderStatus, cancelOrder } from '@/lib/orders-actions';
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

const statusTransitions: Record<string, string[]> = {
  new: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['served'],
  served: [],
  cancelled: [],
};

const statusActionLabels: Record<string, string> = {
  preparing: 'تحديد كـ قيد التحضير',
  ready: 'تحديد كـ جاهز',
  served: 'تحديد كـ تم التقديم',
  cancelled: 'إلغاء الطلب',
};

export default function OrderDetails({ order, onClose, onStatusChange }: OrderDetailsProps) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDuration = () => {
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;

    const diffHours = Math.floor(diffMins / 60);
    return `منذ ${diffHours} ساعة و${diffMins % 60} دقيقة`;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    setError(null);

    try {
      await updateOrderStatus(order.id, newStatus);
      onStatusChange();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'فشل تحديث الطلب');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;

    setUpdating(true);
    setError(null);

    try {
      await cancelOrder(order.id);
      onStatusChange();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'فشل إلغاء الطلب');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-800">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-700 bg-slate-800 p-6">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-300"
          >
            <X size={28} />
          </button>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-white">طلب #{order.id}</h2>
            <p className="mt-1 text-sm text-slate-400">{formatTimeAr(order.created_at)}</p>
          </div>
        </div>

        <div className="space-y-6 p-6 text-right">
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-700/50 p-4">
              <p className="mb-2 text-sm text-slate-400">الحالة</p>
              <p
                className={`inline-block rounded-lg border px-3 py-1 text-sm font-medium ${
                  statusColors[order.status]
                }`}
              >
                {ar.orderStatus[order.status]}
              </p>
            </div>

            <div className="rounded-lg bg-slate-700/50 p-4">
              <p className="mb-2 text-sm text-slate-400">المدة</p>
              <div className="flex items-center justify-end gap-2">
                <p className="font-medium text-white">{calculateDuration()}</p>
                <Clock size={16} className="text-amber-600" />
              </div>
            </div>

            <div className="rounded-lg bg-slate-700/50 p-4">
              <p className="mb-2 text-sm text-slate-400">الطاولة</p>
              <p className="text-2xl font-bold text-white">#{order.table_number}</p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-700/50 p-4">
            <p className="mb-3 font-medium text-slate-300">الأصناف</p>
            <p className="whitespace-pre-wrap text-slate-100">{formatOrderItems(order.items) || 'لا توجد تفاصيل'}</p>
          </div>

          <div className="rounded-lg border border-amber-600/50 bg-amber-600/20 p-4">
            <p className="mb-2 font-medium text-slate-300">المبلغ الإجمالي</p>
            <p className="text-3xl font-bold text-amber-600">
              {formatNumberAr(order.total_amount)} {ar.dh}
            </p>
          </div>

          {statusTransitions[order.status].length > 0 && (
            <div className="space-y-3 rounded-lg bg-slate-700/50 p-4">
              <p className="font-medium text-slate-300">تحديث الحالة</p>
              <div className="grid grid-cols-2 gap-2">
                {statusTransitions[order.status].map((nextStatus) => (
                  <button
                    key={nextStatus}
                    type="button"
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={updating}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {statusActionLabels[nextStatus] || ar.orderStatus[nextStatus as keyof typeof ar.orderStatus]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {order.status !== 'cancelled' && order.status !== 'served' && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={updating}
              className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              إلغاء الطلب
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
