'use client';

import { useState } from 'react';
import { Pencil, Trash2, AlertCircle, ImageIcon } from 'lucide-react';
import { toggleProductAvailability, deleteProduct } from '@/lib/menu-actions';
import { ar, formatNumberAr } from '@/lib/ar';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onRefresh: () => void;
}

export default function ProductsTable({ products, onEdit, onRefresh }: ProductsTableProps) {
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleAvailability = async (product: Product) => {
    setToggling(product.id);
    setError(null);

    try {
      await toggleProductAvailability(product.id, !product.is_available);
      onRefresh();
    } catch (err) {
      setError('فشل تحديث التوفر');
      console.error(err);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    setDeleting(id);
    setError(null);

    try {
      await deleteProduct(id);
      onRefresh();
    } catch (err) {
      setError('فشل حذف المنتج');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Compact list layout: small thumbnail + name/category/price/status/actions */}
      <div className="divide-y divide-slate-700 overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-3 transition-colors hover:bg-slate-700/40"
            dir="rtl"
          >
            {/* Small fixed thumbnail (56px) — list-friendly, no big hero images */}
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-600 bg-slate-900">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  <ImageIcon size={18} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-white">{product.name}</h3>
              <p className="truncate text-xs text-slate-400">{product.category}</p>
            </div>

            <p className="shrink-0 text-lg font-bold text-amber-600">
              {formatNumberAr(product.price)} <span className="text-xs">{ar.dh}</span>
            </p>

            <button
              type="button"
              onClick={() => handleToggleAvailability(product)}
              disabled={toggling === product.id}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                product.is_available
                  ? 'border-green-500/50 bg-green-500/20 text-green-300'
                  : 'border-red-500/50 bg-red-500/20 text-red-300'
              } ${toggling === product.id ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-opacity-30'}`}
            >
              {toggling === product.id ? '...' : product.is_available ? '🟢 متوفر' : '🔴 غير متوفر'}
            </button>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => handleDelete(product.id)}
                disabled={deleting === product.id}
                aria-label="حذف"
                className="rounded-lg bg-red-600 p-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => onEdit(product)}
                aria-label="تعديل"
                className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-slate-400">لا توجد منتجات بعد. أضف أول طبق!</p>
        </div>
      )}
    </div>
  );
}
