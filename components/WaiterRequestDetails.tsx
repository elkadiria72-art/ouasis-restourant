'use client';

import { useState } from 'react';
import { X, Clock, AlertCircle as AlertIcon } from 'lucide-react';
import { acknowledgeRequest, resolveRequest, deleteRequest } from '@/lib/waiter-actions';
import { ar, formatTimeAr } from '@/lib/ar';

interface WaiterRequest {
  id: number;
  table_number: number;
  request_type: 'waiter' | 'bill' | 'issue' | 'other';
  message: string;
  status: 'new' | 'accepted' | 'resolved';
  created_at: string;
  accepted_at?: string;
  resolved_at?: string;
}

interface WaiterRequestDetailsProps {
  request: WaiterRequest;
  onClose: () => void;
  onStatusChange: () => void;
}

const requestTypeEmoji = {
  waiter: '👤',
  bill: '💰',
  issue: '⚠️',
  other: '❓',
};

const statusEmoji = {
  new: '🔴',
  accepted: '🟡',
  resolved: '🟢',
};

export default function WaiterRequestDetails({
  request,
  onClose,
  onStatusChange,
}: WaiterRequestDetailsProps) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDuration = () => {
    const createdAt = new Date(request.created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `${diffMins} دقيقة`;

    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} ساعة و${diffMins % 60} دقيقة`;
  };

  const handleAccept = async () => {
    setUpdating(true);
    setError(null);

    try {
      await acknowledgeRequest(request.id);
      onStatusChange();
    } catch (err) {
      setError((err as Error).message || 'فشل قبول الطلب');
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    setUpdating(true);
    setError(null);

    try {
      await resolveRequest(request.id);
      onStatusChange();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'فشل حل الطلب');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('حذف هذا الطلب؟')) return;

    setUpdating(true);
    setError(null);

    try {
      await deleteRequest(request.id);
      onStatusChange();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'فشل حذف الطلب');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-lg border border-slate-700 bg-slate-800 md:rounded-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-700 bg-gradient-to-l from-red-600/10 to-orange-600/10 p-6">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-300"
          >
            <X size={28} />
          </button>
          <div className="text-right">
            <h2 className="flex items-center justify-end gap-2 text-2xl font-bold text-white">
              {requestTypeEmoji[request.request_type]}{' '}
              {ar.waiterType[request.request_type]}
            </h2>
            <p className="mt-1 text-sm text-slate-400">الطاولة {request.table_number}</p>
          </div>
        </div>

        <div className="space-y-6 p-6 text-right">
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
              <AlertIcon className="text-red-400" size={20} />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <div className="rounded-lg bg-slate-700/50 p-4">
            <p className="mb-2 text-sm text-slate-400">الحالة</p>
            <div className="flex items-center justify-end gap-2">
              <p className="text-lg font-bold text-white">{ar.waiterStatus[request.status]}</p>
              <span className="text-3xl">{statusEmoji[request.status]}</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-700/50 p-4">
            <p className="mb-2 text-sm text-slate-400">رسالة الطلب</p>
            <p className="text-lg font-medium leading-relaxed text-white">{request.message}</p>
          </div>

          <div className="space-y-3 rounded-lg bg-slate-700/50 p-4">
            <p className="text-sm font-medium text-slate-400">الجدول الزمني</p>

            <div className="flex items-center justify-end gap-3">
              <div className="text-right">
                <p className="text-sm text-slate-300">
                  أُنشئ {formatTimeAr(request.created_at)}
                </p>
                <p className="text-xs text-slate-400">منذ {calculateDuration()}</p>
              </div>
              <Clock className="text-amber-600" size={18} />
            </div>

            {request.accepted_at && (
              <div className="flex items-center justify-end gap-3">
                <div className="text-right">
                  <p className="text-sm text-slate-300">قُبل {formatTimeAr(request.accepted_at)}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(request.accepted_at).toLocaleDateString('ar-MA')}
                  </p>
                </div>
                <span className="text-lg">🟡</span>
              </div>
            )}

            {request.resolved_at && (
              <div className="flex items-center justify-end gap-3">
                <div className="text-right">
                  <p className="text-sm text-slate-300">حُلّ {formatTimeAr(request.resolved_at)}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(request.resolved_at).toLocaleDateString('ar-MA')}
                  </p>
                </div>
                <span className="text-lg">🟢</span>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-700 pt-4">
            {request.status === 'new' && (
              <button
                type="button"
                onClick={handleAccept}
                disabled={updating}
                className="w-full rounded-lg bg-yellow-600 px-4 py-3 font-medium text-white transition-colors hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                قبول الطلب
              </button>
            )}

            {request.status !== 'resolved' && (
              <button
                type="button"
                onClick={handleResolve}
                disabled={updating}
                className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                تحديد كـ تم الحل
              </button>
            )}

            <button
              type="button"
              onClick={handleDelete}
              disabled={updating}
              className="w-full rounded-lg bg-red-600/50 px-4 py-3 font-medium text-red-100 transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ar.delete}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-slate-700 px-4 py-3 font-medium text-slate-100 transition-colors hover:bg-slate-600"
            >
              {ar.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
