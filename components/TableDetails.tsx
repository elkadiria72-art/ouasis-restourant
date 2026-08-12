'use client';

import { useState } from 'react';
import { X, AlertCircle, Clock } from 'lucide-react';
import { clearTable, updateTableStatus, acknowledgeWaiterCall } from '@/lib/tables-actions';

interface Table {
  id: number;
  table_number: number;
  status: 'empty' | 'occupied' | 'needs_attention';
  waiter_call: boolean;
  current_order_amount?: number;
  duration_minutes?: number;
}

interface TableDetailsProps {
  table: Table;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TableDetails({ table, onClose, onUpdate }: TableDetailsProps) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClearTable = async () => {
    if (!window.confirm(`Clear Table ${table.table_number}? This will mark it as empty.`))
      return;

    setUpdating(true);
    setError(null);

    try {
      await clearTable(table.id);
      onUpdate();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to clear table');
    } finally {
      setUpdating(false);
    }
  };

  const handleAcknowledgeCall = async () => {
    setUpdating(true);
    setError(null);

    try {
      await acknowledgeWaiterCall(table.id);
      onUpdate();
    } catch (err) {
      setError((err as Error).message || 'Failed to acknowledge call');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-md w-full md:max-h-[90vh] overflow-y-auto md:rounded-lg rounded-t-lg">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold text-white">Table {table.table_number}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Status Card */}
          <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
            <p className="text-slate-400 text-sm font-medium">Status</p>
            <div className="flex items-center gap-3">
              {table.status === 'empty' && <span className="text-3xl">🟢</span>}
              {table.status === 'occupied' && <span className="text-3xl">🟡</span>}
              {table.status === 'needs_attention' && <span className="text-3xl">🔴</span>}
              <p className="text-white font-bold text-lg capitalize">
                {table.status.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Waiter Call Alert */}
          {table.waiter_call && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                <p className="text-red-300 font-semibold">Waiter Call Active</p>
              </div>
              <button
                onClick={handleAcknowledgeCall}
                disabled={updating}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition-colors disabled:opacity-50"
              >
                Acknowledge & Clear
              </button>
            </div>
          )}

          {/* Duration */}
          {table.status !== 'empty' && table.duration_minutes !== undefined && (
            <div className="bg-slate-700/50 rounded-lg p-4 flex items-center gap-3">
              <Clock className="text-amber-600" size={20} />
              <div>
                <p className="text-slate-400 text-sm">Duration</p>
                <p className="text-white font-semibold">{table.duration_minutes} min</p>
              </div>
            </div>
          )}

          {/* Order Amount */}
          {table.current_order_amount && table.current_order_amount > 0 && (
            <div className="bg-amber-600/20 border border-amber-600/50 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-2">Current Order Total</p>
              <p className="text-3xl font-bold text-amber-600">{table.current_order_amount} DH</p>
            </div>
          )}

          {/* Order Details Link */}
          {table.status !== 'empty' && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-2">Active Order</p>
              <p className="text-white font-semibold">View order details in Orders page →</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-700">
            {table.status !== 'empty' && (
              <button
                onClick={handleClearTable}
                disabled={updating}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Table
              </button>
            )}

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
