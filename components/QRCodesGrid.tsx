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
        <html>
          <head>
            <title>Table ${qrCode.table_number} QR Code</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: white; }
              img { max-width: 100%; }
              h2 { margin-top: 20px; font-family: Arial; }
            </style>
          </head>
          <body>
            <h2>Table ${qrCode.table_number}</h2>
            <img src="${qrCode.qr_image}" alt="QR Code" />
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  if (qrCodes.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <AlertCircle className="mx-auto mb-4 text-slate-500" size={32} />
        <p className="text-slate-400 text-lg">No QR codes generated yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {qrCodes.map((qrCode) => (
        <div
          key={qrCode.table_id}
          className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-amber-600 transition-colors"
        >
          {/* QR Image */}
          <div className="bg-white p-4 flex items-center justify-center aspect-square">
            <img
              src={qrCode.qr_image}
              alt={`Table ${qrCode.table_number} QR`}
              className="max-w-full max-h-full"
            />
          </div>

          {/* Info */}
          <div className="p-4 space-y-3">
            <h3 className="text-lg font-semibold text-white text-center">
              Table {String(qrCode.table_number).padStart(2, '0')}
            </h3>

            {qrCode.generated_at && (
              <p className="text-xs text-slate-400 text-center">
                Generated: {new Date(qrCode.generated_at).toLocaleDateString()}
              </p>
            )}

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700">
              <button
                onClick={() => handleDownload(qrCode)}
                disabled={loading}
                className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                title="Download QR"
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => handlePrint(qrCode)}
                disabled={loading}
                className="flex items-center justify-center gap-1 px-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                title="Print QR"
              >
                <Printer size={14} />
              </button>
              <button
                onClick={() => onRegenerate(qrCode.table_id, qrCode.table_number)}
                disabled={loading}
                className="flex items-center justify-center gap-1 px-2 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                title="Regenerate QR"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
