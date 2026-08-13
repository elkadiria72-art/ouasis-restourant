'use client';

import { Download, Printer, RotateCcw, AlertCircle } from 'lucide-react';

interface QRCode {
  id?: number;
  table_id: number;
  table_number: number;
  qr_image: string;
  generated_at?: string;
}

interface QRCodesGridProps {
  qrCodes: QRCode[];
  onRegenerate: (tableId: number, tableNumber: number) => void;
  onDelete: (tableId: number) => void;
  loading: boolean;
}

export default function QRCodesGrid({
  qrCodes,
  onRegenerate,
  onDelete,
  loading,
}: QRCodesGridProps) {
  const handleDownload = (qrCode: QRCode) => {
    const link = document.createElement('a');
    link.href = qrCode.qr_image;
    link.download = `table-${qrCode.table_number}-qr.png`;
    link.click();
  };

  const handlePrint = (qrCode: QRCode) => {
    const printWindow = window.open('', '', 'width=400,height=500');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl" lang="ar">
          <head>
            <title>رمز QR — طاولة ${qrCode.table_number}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: white; font-family: Tajawal, sans-serif; }
              img { max-width: 100%; }
              h2 { margin-top: 20px; }
            </style>
          </head>
          <body>
            <h2>طاولة ${qrCode.table_number}</h2>
            <img src="${qrCode.qr_image}" alt="رمز QR" />
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  if (qrCodes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-12 text-center">
        <AlertCircle className="mx-auto mb-4 text-slate-500" size={32} />
        <p className="text-lg text-slate-400">لم يتم إنشاء رموز QR بعد</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {qrCodes.map((qrCode) => (
        <div
          key={qrCode.table_id}
          className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800 transition-colors hover:border-amber-600"
        >
          <div className="flex aspect-square items-center justify-center bg-white p-4">
            <img
              src={qrCode.qr_image}
              alt={`رمز QR — طاولة ${qrCode.table_number}`}
              className="max-h-full max-w-full"
            />
          </div>

          <div className="space-y-3 p-4 text-center">
            <h3 className="text-lg font-semibold text-white">
              طاولة {String(qrCode.table_number).padStart(2, '0')}
            </h3>

            {qrCode.generated_at && (
              <p className="text-xs text-slate-400">
                تاريخ الإنشاء:{' '}
                {new Date(qrCode.generated_at).toLocaleDateString('ar-MA')}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 border-t border-slate-700 pt-2">
              <button
                type="button"
                onClick={() => handleDownload(qrCode)}
                disabled={loading}
                className="flex items-center justify-center gap-1 rounded bg-blue-600 px-2 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                title="تنزيل"
              >
                <Download size={14} />
                <span className="hidden sm:inline">تنزيل</span>
              </button>
              <button
                type="button"
                onClick={() => handlePrint(qrCode)}
                disabled={loading}
                className="flex items-center justify-center gap-1 rounded bg-green-600 px-2 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                title="طباعة"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">طباعة</span>
              </button>
              <button
                type="button"
                onClick={() => onRegenerate(qrCode.table_id, qrCode.table_number)}
                disabled={loading}
                className="flex items-center justify-center gap-1 rounded bg-amber-600 px-2 py-2 text-xs font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                title="إعادة الإنشاء"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">تجديد</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
