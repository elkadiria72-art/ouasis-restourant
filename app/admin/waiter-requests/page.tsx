'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Bell, AlertCircle, RefreshCw } from 'lucide-react';
import WaiterRequestCards from '@/components/WaiterRequestCards';
import WaiterRequestDetails from '@/components/WaiterRequestDetails';
import { fetchWaiterRequests } from '@/lib/waiter-actions';
import { useAdminSearch } from '@/components/AdminSearchContext';
import { matchesSearch } from '@/lib/search-utils';
import { useNotificationSounds } from '@/components/useNotificationSounds';
import { playSoundUrl } from '@/lib/play-sound';
import { useAdminRealtime } from '@/components/useAdminRealtime';
import { ar, formatNumberAr } from '@/lib/ar';

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

export default function WaiterRequestsPage() {
  const { query } = useAdminSearch();
  const { waiterCallSoundUrl } = useNotificationSounds();
  const [requests, setRequests] = useState<WaiterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<WaiterRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'accepted' | 'resolved'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const knownNewRequestIds = useRef<Set<number>>(new Set());
  const isInitialLoad = useRef(true);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWaiterRequests(statusFilter === 'all' ? undefined : statusFilter);
      const list = data || [];
      const newOnes = list.filter((r: WaiterRequest) => r.status === 'new');

      if (!isInitialLoad.current) {
        const hasFresh = newOnes.some((r) => !knownNewRequestIds.current.has(r.id));
        if (hasFresh) void playSoundUrl(waiterCallSoundUrl);
      }

      knownNewRequestIds.current = new Set(newOnes.map((r) => r.id));
      isInitialLoad.current = false;
      setRequests(list);
    } catch (err) {
      setError((err as Error).message || 'فشل تحميل الطلبات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    isInitialLoad.current = true;
    knownNewRequestIds.current = new Set();
    loadRequests();
  }, [statusFilter]);

  useEffect(() => {
    const interval = setInterval(async () => {
      setRefreshing(true);
      await loadRequests();
      setRefreshing(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [statusFilter, waiterCallSoundUrl]);

  useAdminRealtime({ onWaiterCallsChange: () => void loadRequests() });

  const filteredRequests = useMemo(
    () =>
      requests.filter((r) =>
        matchesSearch(
          query,
          r.table_number,
          r.message,
          r.request_type,
          r.status,
          ar.waiterType[r.request_type],
          ar.waiterStatus[r.status]
        )
      ),
    [requests, query]
  );

  const stats = {
    new: requests.filter((r) => r.status === 'new').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    resolved: requests.filter((r) => r.status === 'resolved').length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-right">
          <h1 className="flex items-center justify-end gap-2 text-2xl font-bold text-white sm:text-3xl">
            {ar.nav.waiterRequests}
            <Bell className="text-red-500" size={32} />
          </h1>
          <p className="mt-1 text-sm text-slate-400">طلبات خدمة العملاء ونداءات النادل لحظياً.</p>
        </div>
        <button
          type="button"
          onClick={() => loadRequests()}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          {ar.refresh}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-right">
          <p className="text-sm text-slate-300">طلبات جديدة</p>
          <p className="text-3xl font-bold text-red-300">{formatNumberAr(stats.new)}</p>
          {stats.new > 0 && <p className="mt-1 text-xs text-red-400">⚠️ يتطلب إجراءً</p>}
        </div>
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/20 p-4 text-right">
          <p className="text-sm text-slate-300">{ar.waiterStatus.accepted}</p>
          <p className="text-3xl font-bold text-yellow-300">{formatNumberAr(stats.accepted)}</p>
        </div>
        <div className="rounded-lg border border-green-500/50 bg-green-500/20 p-4 text-right">
          <p className="text-sm text-slate-300">{ar.waiterStatus.resolved}</p>
          <p className="text-3xl font-bold text-green-300">{formatNumberAr(stats.resolved)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'accepted', 'resolved'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              statusFilter === filter
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {ar.waiterStatus[filter]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-12 text-center">
          <p className="text-lg text-slate-400">{ar.loading}</p>
        </div>
      )}

      {!loading && (
        <div>
          <div className="mb-4 text-right">
            <p className="text-sm text-slate-400">
              {query ? (
                <>
                  <span className="font-semibold text-amber-600">{formatNumberAr(filteredRequests.length)}</span>{' '}
                  نتيجة للبحث «{query}»
                </>
              ) : (
                <>
                  عرض{' '}
                  <span className="font-semibold text-amber-600">{formatNumberAr(requests.length)}</span>{' '}
                  طلب
                </>
              )}
            </p>
          </div>
          <WaiterRequestCards requests={filteredRequests} onSelectRequest={setSelectedRequest} />
        </div>
      )}

      {selectedRequest && (
        <WaiterRequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={loadRequests}
        />
      )}

      <div className="rounded-lg border border-purple-500/50 bg-purple-500/10 p-6 text-right">
        <h3 className="mb-3 font-semibold text-white">📞 كيف يعمل النظام</h3>
        <ul className="space-y-2 text-sm text-purple-200">
          <li>✓ يستخدم الزبناء منيو QR لنداء النادل أو طلب الحساب أو الإبلاغ عن مشكلة</li>
          <li>✓ تظهر الطلبات هنا لحظياً مع إشعار صوتي</li>
          <li>✓ البطاقات الحمراء النابضة تشير إلى طلبات جديدة تتطلب اهتماماً فورياً</li>
          <li>✓ انقر على أي طلب لعرض التفاصيل والقبول وتحديده كـ تم الحل</li>
          <li>✓ صفِّ حسب الحالة لتتبّع تقدّم الطلبات</li>
          <li>✓ يُحدَّث تلقائياً كل 10 ثوانٍ</li>
        </ul>
      </div>
    </div>
  );
}
