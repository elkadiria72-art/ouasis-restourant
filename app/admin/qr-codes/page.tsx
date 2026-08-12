'use client';

import { useState, useEffect } from 'react';
import { Zap, AlertCircle, RefreshCw } from 'lucide-react';
import QRCodesGrid from '@/components/QRCodesGrid';
import { fetchQRCodes, generateAllQRCodes, generateQRCode } from '@/lib/qr-actions';

interface QRCode {
  id?: number;
  table_id: number;
  table_number: number;
  qr_image: string;
  generated_at?: string;
}

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchQRCodes();
      setQRCodes(data || []);
    } catch (err) {
      setError((err as Error).message || 'Failed to load QR codes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQRCodes();
  }, []);

  const handleGenerateAll = async () => {
    if (!window.confirm('Generate QR codes for all 50 tables?')) return;

    setGenerating(true);
    setError(null);

    try {
      await generateAllQRCodes();
      await loadQRCodes();
    } catch (err) {
      setError((err as Error).message || 'Failed to generate QR codes');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async (tableId: number, tableNumber: number) => {
    setGenerating(true);
    setError(null);

    try {
      await generateQRCode(tableId, tableNumber);
      await loadQRCodes();
    } catch (err) {
      setError((err as Error).message || 'Failed to regenerate QR code');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">QR Codes Management</h1>
          <p className="text-slate-400 mt-1">Generate, download, and print QR codes for all tables.</p>
        </div>
        <button
          onClick={handleGenerateAll}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Zap size={20} />
          Generate All (50 Tables)
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
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Total QR Codes</p>
          <p className="text-3xl font-bold text-amber-600">{qrCodes.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Total Tables</p>
          <p className="text-3xl font-bold text-blue-400">50</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Progress</p>
          <p className="text-3xl font-bold text-green-400">{Math.round((qrCodes.length / 50) * 100)}%</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-slate-400 text-lg">Loading QR codes...</p>
        </div>
      )}

      {/* QR Codes Grid */}
      {!loading && (
        <QRCodesGrid
          qrCodes={qrCodes}
          onRegenerate={handleRegenerate}
          onDelete={() => loadQRCodes()}
          loading={generating}
        />
      )}

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3">📋 Instructions</h3>
        <ul className="text-blue-200 space-y-2 text-sm">
          <li>✓ Click "Generate All" to create QR codes for all 50 tables at once</li>
          <li>✓ Each QR code links directly to the customer menu for that table</li>
          <li>✓ Download as PNG to store digitally or print</li>
          <li>✓ Use Print to directly print individual QR codes</li>
          <li>✓ Regenerate to create new QR codes if needed</li>
        </ul>
      </div>
    </div>
  );
}
