'use client';

import { Clock, CircleCheck } from 'lucide-react';
import { ar, formatRelativeTimeAr } from '@/lib/ar';

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

interface WaiterRequestCardsProps {
  requests: WaiterRequest[];
  onSelectRequest: (request: WaiterRequest) => void;
}

const requestTypeColors = {
  waiter: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  bill: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  issue: 'bg-red-500/20 text-red-300 border-red-500/50',
  other: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
};

const requestTypeLabels = {
  waiter: '👤 نداء نادل',
  bill: '💰 طلب الحساب',
  issue: '⚠️ الإبلاغ عن مشكلة',
  other: '❓ طلب آخر',
};

const statusColors = {
  new: 'bg-red-600',
  accepted: 'bg-yellow-600',
  resolved: 'bg-green-600',
};

const statusEmoji = {
  new: '🔴',
  accepted: '🟡',
  resolved: '🟢',
};

export default function WaiterRequestCards({ requests, onSelectRequest }: WaiterRequestCardsProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-green-500/50 bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-12 text-center">
        <CircleCheck className="mx-auto mb-4 text-green-400" size={40} />
        <p className="text-lg font-semibold text-green-300">كل شيء تحت السيطرة! 🎉</p>
        <p className="mt-2 text-sm text-green-400">لا توجد نداءات نادل معلّقة حالياً.</p>
      </div>
    );
  }

  const sortedRequests = [...requests].sort((a, b) => {
    const statusOrder = { new: 0, accepted: 1, resolved: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="space-y-4">
      {sortedRequests.map((request) => (
        <button
          key={request.id}
          type="button"
          onClick={() => onSelectRequest(request)}
          className={`w-full rounded-lg border-2 p-5 text-right transition-all hover:shadow-lg hover:shadow-amber-600/20 ${
            request.status === 'new'
              ? 'animate-pulse border-red-500/30 bg-red-500/10'
              : 'border-slate-700 bg-slate-800'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div
              className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${statusColors[request.status]}`}
            >
              {ar.waiterStatus[request.status]}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center justify-end gap-3">
                <div className="text-right">
                  <p className="text-sm text-slate-400">الطاولة</p>
                  <p className="text-2xl font-bold text-white">#{request.table_number}</p>
                </div>
                <span className="text-2xl">{statusEmoji[request.status]}</span>
              </div>

              <div className="mb-3">
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${
                    requestTypeColors[request.request_type]
                  }`}
                >
                  {requestTypeLabels[request.request_type]}
                </span>
              </div>

              <p className="mb-2 line-clamp-2 font-medium text-slate-200">{request.message}</p>

              <div className="flex flex-wrap items-center justify-end gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <span>{formatRelativeTimeAr(request.created_at)}</span>
                  <Clock size={14} />
                </div>

                {request.accepted_at && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <span>✓ قُبل {formatRelativeTimeAr(request.accepted_at)}</span>
                  </div>
                )}

                {request.resolved_at && (
                  <div className="flex items-center gap-1 text-green-400">
                    <span>✓✓ حُلّ {formatRelativeTimeAr(request.resolved_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {request.status === 'new' && (
            <div className="mt-3 text-xs font-semibold text-red-400">
              ⚠️ عاجل — انقر للرد
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
