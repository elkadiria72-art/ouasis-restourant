'use client';

import { useState } from 'react';
import { X, Clock, AlertCircle as AlertIcon } from 'lucide-react';
import { acknowledgeRequest, resolveRequest, deleteRequest } from '@/lib/waiter-actions';

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const calculateDuration = () => {
    const createdAt = new Date(request.created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;

    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ${diffMins % 60} minutes`;
  };

  const handleAccept = async () => {
    setUpdating(true);
    setError(null);

    try {
      await acknowledgeRequest(request.id);
      onStatusChange();
    } catch (err) {
      setError((err as Error).message || 'Failed to accept request');
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
      setError((err as Error).message || 'Failed to resolve request');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this request?')) return;

    setUpdating(true);
    setError(null);

    try {
      await deleteRequest(request.id);
      onStatusChange();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to delete request');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-md w-full md:max-h-[90vh] overflow-y-auto md:rounded-lg rounded-t-lg">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 flex items-center justify-between p-6 bg-gradient-to-r from-red-600/10 to-orange-600/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {requestTypeEmoji[request.request_type]} {request.request_type.toUpperCase()}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Table {request.table_number}</p>
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
              <AlertIcon className="text-red-400" size={20} />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Status */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-2">Status</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{statusEmoji[request.status]}</span>
              <p className="text-white font-bold text-lg capitalize">{request.status}</p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-2">Request Message</p>
            <p className="text-white font-medium text-lg leading-relaxed">{request.message}</p>
          </div>

          {/* Timeline */}
          <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
            <p className="text-slate-400 text-sm font-medium">Timeline</p>

            <div className="flex items-center gap-3">
              <Clock className="text-amber-600" size={18} />
              <div>
                <p className="text-slate-300 text-sm">
                  Created {formatTime(request.created_at)}
                </p>
                <p className="text-slate-400 text-xs">{calculateDuration()} ago</p>
              </div>
            </div>

            {request.accepted_at && (
              <div className="flex items-center gap-3">
                <span className="text-lg">🟡</span>
                <div>
                  <p className="text-slate-300 text-sm">Accepted {formatTime(request.accepted_at)}</p>
                  <p className="text-slate-400 text-xs">
                    {new Date(request.accepted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {request.resolved_at && (
              <div className="flex items-center gap-3">
                <span className="text-lg">🟢</span>
                <div>
                  <p className="text-slate-300 text-sm">
                    Resolved {formatTime(request.resolved_at)}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {new Date(request.resolved_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-700">
            {request.status === 'new' && (
              <button
                onClick={handleAccept}
                disabled={updating}
                className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Accept Request
              </button>
            )}

            {request.status !== 'resolved' && (
              <button
                onClick={handleResolve}
                disabled={updating}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Resolved
              </button>
            )}

            <button
              onClick={handleDelete}
              disabled={updating}
              className="w-full px-4 py-3 bg-red-600/50 hover:bg-red-600 text-red-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
