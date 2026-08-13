'use client';

import { useState } from 'react';
import { X, AlertCircle, Clock } from 'lucide-react';
import { clearTable, acknowledgeWaiterCall } from '@/lib/tables-actions';
import { ar, formatNumberAr } from '@/lib/ar';

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
    if (!window.confirm(`تفريغ الطاولة ${table.table_number}؟ سيتم تحديدها كفارغة.`)) return;

    setUpdating(true);
    setError(null);

    try {
      await clearTable(table.id);
      onUpdate();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'فشل تفريغ الطاولة');
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
      setError((err as Error).message || 'فشل تأكيد النداء');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-lg border border-slate-700 bg-slate-800 md:rounded-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-700 bg-slate-800 p-6">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-300"
          >
            <X size={28} />
          </button>
          <h2 className="text-2xl font-bold text-white">طاولة {table.table_number}</h2>
        </div>

        <div className="space-y-4 p-6 text-right">
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-3 rounded-lg bg-slate-700/50 p-4">
            <p className="text-sm font-medium text-slate-400">الحالة</p>
            <div className="flex items-center justify-end gap-3">
              <p className="text-lg font-bold text-white">{ar.tableStatus[table.status]}</p>
              {table.status === 'empty' && <span className="text-3xl">🟢</span>}
              {table.status === 'occupied' && <span className="text-3xl">🟡</span>}
              {table.status === 'needs_attention' && <span className="text-3xl">🔴</span>}
            </div>
          </div>

          {table.waiter_call && (
            <div className="space-y-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
              <div className="flex items-center justify-end gap-2">
                <p className="font-semibold text-red-300">نداء نادل نشط</p>
                <span className="text-2xl">🔔</span>
              </div>
              <button
                type="button"
                onClick={handleAcknowledgeCall}
                disabled={updating}
                className="w-full rounded bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                تأكيد وإزالة النداء
              </button>
            </div>
          )}

          {table.status !== 'empty' && table.duration_minutes !== undefined && (
            <div className="flex items-center justify-end gap-3 rounded-lg bg-slate-700/50 p-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">المدة</p>
                <p className="font-semibold text-white">{table.duration_minutes} دقيقة</p>
              </div>
              <Clock className="text-amber-600" size={20} />
            </div>
          )}

          {table.current_order_amount && table.current_order_amount > 0 && (
            <div className="rounded-lg border border-amber-600/50 bg-amber-600/20 p-4">
              <p className="mb-2 text-sm text-slate-300">إجمالي الطلب الحالي</p>
              <p className="text-3xl font-bold text-amber-600">
                {formatNumberAr(table.current_order_amount)} {ar.dh}
              </p>
            </div>
          )}

          {table.status !== 'empty' && (
            <div className="rounded-lg bg-slate-700/50 p-4">
              <p className="mb-2 text-sm text-slate-300">الطلب النشط</p>
              <p className="font-semibold text-white">← عرض تفاصيل الطلب في صفحة الطلبات</p>
            </div>
          )}

          <div className="space-y-2 border-t border-slate-700 pt-4">
            {table.status !== 'empty' && (
              <button
                type="button"
                onClick={handleClearTable}
                disabled={updating}
                className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                تفريغ الطاولة
              </button>
            )}

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
