'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import WaiterRequestCards from '@/components/WaiterRequestCards';
import WaiterRequestDetails from '@/components/WaiterRequestDetails';
import { fetchWaiterRequests } from '@/lib/waiter-actions';

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
  const [requests, setRequests] = useState<WaiterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<WaiterRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'accepted' | 'resolved'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWaiterRequests(statusFilter === 'all' ? undefined : statusFilter);
      setRequests(data || []);

      // Play sound if there are new requests
      if (!hasPlayedSound && data && data.some((r: any) => r.status === 'new')) {
        playNotificationSound();
        setHasPlayedSound(true);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    // Using Web Audio API to create a notification sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.log('Audio notification not available');
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      setRefreshing(true);
      await loadRequests();
      setRefreshing(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [statusFilter, hasPlayedSound]);

  const stats = {
    new: requests.filter((r) => r.status === 'new').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    resolved: requests.filter((r) => r.status === 'resolved').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Bell className="text-red-500" size={32} />
            Waiter Requests
          </h1>
          <p className="text-slate-400 mt-1">Real-time customer service requests and calls.</p>
        </div>
        <button
          onClick={() => loadRequests()}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-slate-300 text-sm">New Requests</p>
          <p className="text-3xl font-bold text-red-300">{stats.new}</p>
          {stats.new > 0 && <p className="text-xs text-red-400 mt-1">⚠️ Action Required</p>}
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-slate-300 text-sm">Accepted</p>
          <p className="text-3xl font-bold text-yellow-300">{stats.accepted}</p>
        </div>
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-slate-300 text-sm">Resolved</p>
          <p className="text-3xl font-bold text-green-300">{stats.resolved}</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'new', 'accepted', 'resolved'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              statusFilter === filter
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {filter === 'all' ? 'All' : filter}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-slate-400 text-lg">Loading waiter requests...</p>
        </div>
      )}

      {/* Requests */}
      {!loading && (
        <div>
          <div className="mb-4">
            <p className="text-slate-400 text-sm">
              Showing <span className="text-amber-600 font-semibold">{requests.length}</span> request(s)
            </p>
          </div>
          <WaiterRequestCards requests={requests} onSelectRequest={setSelectedRequest} />
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <WaiterRequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={loadRequests}
        />
      )}

      {/* Instructions */}
      <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3">📞 How It Works</h3>
        <ul className="text-purple-200 space-y-2 text-sm">
          <li>✓ Customers use the QR menu to call for waiter, request bill, or report issues</li>
          <li>✓ Requests appear here in real-time with audio notification</li>
          <li>✓ Red pulsing cards indicate NEW requests requiring immediate attention</li>
          <li>✓ Click any request to view details, accept, and mark as resolved</li>
          <li>✓ Filter by status to track request progress</li>
          <li>✓ Auto-refreshes every 10 seconds for real-time updates</li>
        </ul>
      </div>
    </div>
  );
}
