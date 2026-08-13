'use client';

import { useState } from 'react';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800 transition-colors hover:border-slate-600"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-900">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  لا توجد صورة
                </div>
              )}

              <button
                type="button"
                onClick={() => handleToggleAvailability(product)}
                disabled={toggling === product.id}
                className={`absolute left-2 top-2 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  product.is_available
                    ? 'border-green-500/50 bg-green-500/20 text-green-300'
                    : 'border-red-500/50 bg-red-500/20 text-red-300'
                } ${toggling === product.id ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-opacity-30'}`}
              >
                {toggling === product.id
                  ? '...'
                  : product.is_available
                    ? '🟢 متوفر'
                    : '🔴 غير متوفر'}
              </button>
            </div>

            <div className="space-y-3 p-4 text-right">
              <div>
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                <p className="text-sm text-slate-400">{product.category}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-amber-600">
                  {formatNumberAr(product.price)} {ar.dh}
                </p>
              </div>

              <div className="flex gap-2 border-t border-slate-700 pt-2">
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  disabled={deleting === product.id}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Pencil size={16} />
                  {ar.edit}
                </button>
              </div>
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
