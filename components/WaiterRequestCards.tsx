'use client';

import { Clock, CircleCheck, AlertCircle as AlertIcon } from 'lucide-react';

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
  waiter: '👤 Waiter Needed',
  bill: '💰 Bill Requested',
  issue: '⚠️ Issue Reported',
  other: '❓ Other Request',
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
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  if (requests.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-12 text-center">
        <CircleCheck className="mx-auto mb-4 text-green-400" size={40} />
        <p className="text-green-300 text-lg font-semibold">All caught up! 🎉</p>
        <p className="text-green-400 text-sm mt-2">No pending waiter requests at the moment.</p>
      </div>
    );
  }

  // Sort by status (new first, then accepted, then resolved)
  const sortedRequests = [...requests].sort((a, b) => {
    const statusOrder = { new: 0, accepted: 1, resolved: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="space-y-4">
      {sortedRequests.map((request) => (
        <button
          key={request.id}
          onClick={() => onSelectRequest(request)}
          className={`text-left w-full p-5 rounded-lg border-2 transition-all hover:shadow-lg hover:shadow-amber-600/20 ${
            request.status === 'new'
              ? 'bg-red-500/10 border-red-500/30 animate-pulse'
              : 'bg-slate-800 border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left Section */}
            <div className="flex-1 min-w-0">
              {/* Status + Table */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{statusEmoji[request.status]}</span>
                <div>
                  <p className="text-sm text-slate-400">Table</p>
                  <p className="text-2xl font-bold text-white">#{request.table_number}</p>
                </div>
              </div>

              {/* Request Type Badge */}
              <div className="mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                    requestTypeColors[request.request_type]
                  }`}
                >
                  {requestTypeLabels[request.request_type]}
                </span>
              </div>

              {/* Message */}
              <p className="text-slate-200 font-medium mb-2 line-clamp-2">{request.message}</p>

              {/* Timing */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{formatTime(request.created_at)}</span>
                </div>

                {request.accepted_at && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <span>✓ Accepted {formatTime(request.accepted_at)}</span>
                  </div>
                )}

                {request.resolved_at && (
                  <div className="flex items-center gap-1 text-green-400">
                    <span>✓✓ Resolved {formatTime(request.resolved_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Status Badge */}
            <div className={`px-3 py-2 rounded-lg text-white text-sm font-semibold capitalize ${statusColors[request.status]}`}>
              {request.status}
            </div>
          </div>

          {/* Click Hint */}
          {request.status === 'new' && (
            <div className="text-xs text-red-400 font-semibold mt-3">
              ⚠️ URGENT - Click to respond
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
