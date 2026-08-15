'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, Loader2, X } from 'lucide-react';
import { addProduct, updateProduct } from '@/lib/menu-actions';
import { uploadMenuImage } from '@/lib/storage-actions';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.image_url || null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const publicUrl = await uploadMenuImage(uploadFormData);

      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      setPreviewUrl(publicUrl);
      URL.revokeObjectURL(localPreview);
    } catch (err) {
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(formData.image_url || null);
      setError((err as Error).message || 'فشل رفع الصورة');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) {
      setError('انتظر حتى يكتمل رفع الصورة قبل الحفظ.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        image_url: formData.image_url || null,
        is_available: product?.is_available ?? true,
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
            <label
              htmlFor="product-image-upload"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              صورة الطبق
            </label>
            <input
              id="product-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading || loading}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-300 file:me-3 file:rounded-md file:border-0 file:bg-amber-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-amber-700 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-slate-500">
              على الجوال: اختر من المعرض أو التقط صورة بالكاميرا
            </p>

            {uploading && (
              <div className="mt-3 flex items-center justify-end gap-2 text-sm text-amber-500">
                <Loader2 className="animate-spin" size={16} />
                <span>جاري رفع الصورة...</span>
              </div>
            )}

            {previewUrl ? (
              <div className="relative mt-3">
                <img
                  src={previewUrl}
                  alt="معاينة الصورة"
                  className="h-40 w-full rounded-lg border border-slate-600 object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                    <Loader2 className="animate-spin text-amber-500" size={32} />
                  </div>
                )}
              </div>
            ) : (
              <div
                className="mt-3 flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-600 bg-slate-900/50"
              >
                <div className="text-center text-slate-500">
                  <ImageIcon className="mx-auto mb-2" size={28} />
                  <p className="text-sm">لا توجد صورة بعد</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 border-t border-slate-700 pt-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : uploading ? 'جاري الرفع...' : product ? 'تحديث' : 'إضافة'}
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
