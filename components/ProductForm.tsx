'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { addProduct, updateProduct } from '@/lib/menu-actions';
import { ar } from '@/lib/ar';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    category: product?.category || '',
    image_url: product?.image_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        image_url: formData.image_url || null,
        is_available: true,
      };

      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await addProduct(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'فشل حفظ المنتج');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-700 p-6">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-300"
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-semibold text-white">
            {product ? 'تعديل الطبق' : 'إضافة طبق جديد'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 text-right">
          {error && (
            <div className="rounded border border-red-500/50 bg-red-500/20 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              اسم الطبق *
            </label>
            <input
              type="text"
              required
              dir="rtl"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white transition-colors focus:border-amber-600 focus:outline-none"
              placeholder="مثال: كابتشينو"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              السعر ({ar.dh}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white transition-colors focus:border-amber-600 focus:outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              التصنيف *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white transition-colors focus:border-amber-600 focus:outline-none"
            >
              <option value="">اختر تصنيفاً</option>
              <option value="Coffee">قهوة</option>
              <option value="Burgers">برغر</option>
              <option value="Pizza">بيتزا</option>
              <option value="Salads">سلطات</option>
              <option value="Desserts">حلويات</option>
              <option value="Drinks">مشروبات</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              رابط الصورة
            </label>
            <input
              type="url"
              dir="ltr"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white transition-colors focus:border-amber-600 focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="معاينة"
                className="mt-2 h-32 w-full rounded-lg object-cover"
                onError={() => setError('رابط الصورة غير صالح')}
              />
            )}
          </div>

          <div className="flex gap-3 border-t border-slate-700 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : product ? 'تحديث' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-100 transition-colors hover:bg-slate-600"
            >
              {ar.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
