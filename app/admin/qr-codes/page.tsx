'use client';

import { useState, useEffect } from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import QRCodesGrid from '@/components/QRCodesGrid';
import { fetchQRCodes, fetchTablesCount, generateAllQRCodes, generateQRCode } from '@/lib/qr-actions';
import { MENU_QR_URL_PREFIX } from '@/lib/menu-url';
import { ar, formatNumberAr } from '@/lib/ar';

interface QRCode {
  id?: number;
  table_id: number;
  table_number: number;
  qr_data?: string;
  qr_image: string;
  generated_at?: string;
}

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [tablesCount, setTablesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, count] = await Promise.all([fetchQRCodes(), fetchTablesCount()]);
      setQRCodes(data || []);
      setTablesCount(count);
    } catch (err) {
      setError((err as Error).message || 'فشل تحميل رموز QR');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQRCodes();
  }, []);

  const handleGenerateAll = async () => {
    if (
      !window.confirm(
        `إنشاء رموز QR لجميع الطاولات (${formatNumberAr(tablesCount)} طاولة)؟`
      )
    )
      return;

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await generateAllQRCodes();
      await loadQRCodes();
      if (result.failed.length) {
        setSuccess(
          `تم إنشاء ${formatNumberAr(result.generated)} رمز. فشل ${formatNumberAr(result.failed.length)} طاولة.`
        );
      } else {
        setSuccess(`تم إنشاء ${formatNumberAr(result.generated)} رمز QR بنجاح.`);
      }
    } catch (err) {
      setError((err as Error).message || 'فشل إنشاء رموز QR');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async (tableId: number, tableNumber: number) => {
    if (!window.confirm(`إعادة إنشاء رمز QR للطاولة ${tableNumber}؟`)) return;

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      await generateQRCode(tableId, tableNumber);
      await loadQRCodes();
      setSuccess(`تم تجديد رمز QR للطاولة ${tableNumber}.`);
    } catch (err) {
      setError((err as Error).message || 'فشل إعادة إنشاء رمز QR');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const progress =
    tablesCount > 0 ? Math.round((qrCodes.length / tablesCount) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">إدارة رموز QR</h1>
          <p className="mt-1 text-sm text-slate-400">
            أنشئ ونزّل واطبع رموز QR لجميع الطاولات.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerateAll}
          disabled={generating || tablesCount === 0}
          className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-amber-600 px-6 py-3 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Zap size={20} />
          إنشاء الكل ({formatNumberAr(tablesCount)} طاولة)
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 text-right">
          <p className="text-sm text-slate-400">إجمالي رموز QR</p>
          <p className="text-3xl font-bold text-amber-600">{formatNumberAr(qrCodes.length)}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 text-right">
          <p className="text-sm text-slate-400">إجمالي الطاولات</p>
          <p className="text-3xl font-bold text-blue-400">{formatNumberAr(tablesCount)}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 text-right">
          <p className="text-sm text-slate-400">التقدّم</p>
          <p className="text-3xl font-bold text-green-400">{formatNumberAr(progress)}%</p>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-12 text-center">
          <p className="text-lg text-slate-400">{ar.loading}</p>
        </div>
      )}

      {!loading && (
        <QRCodesGrid
          qrCodes={qrCodes}
          onRegenerate={handleRegenerate}
          onDelete={() => loadQRCodes()}
          loading={generating}
        />
      )}

      <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6 text-right">
        <h3 className="mb-3 font-semibold text-white">📋 التعليمات</h3>
        <ul className="space-y-2 text-sm text-blue-200">
          <li>✓ انقر «إنشاء الكل» لإنشاء رموز QR لجميع الطاولات دفعة واحدة</li>
          <li>
            ✓ شكل الرابط:{' '}
            <span className="text-amber-400" dir="ltr">
              {MENU_QR_URL_PREFIX}
              {'{qr_token}'}
            </span>
          </li>
          <li>✓ يربط كل رمز QR بمنيو الزبون للطاولة عبر التوكن الآمن</li>
          <li>✓ نزّل كصورة PNG للحفظ الرقمي أو الطباعة</li>
          <li>✓ استخدم «طباعة» لطباعة رمز QR فردي مباشرةً</li>
          <li>✓ استخدم «تجديد» لإنشاء رمز QR جديد عند الحاجة</li>
        </ul>
      </div>
    </div>
  );
}
