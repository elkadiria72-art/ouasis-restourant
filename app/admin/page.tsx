'use client';

import { useEffect, useRef, useState } from 'react';
import { PencilLine, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { addMenuItem, deleteMenuItem, updateMenuItem } from '@/lib/actions';
import { supabase } from '@/lib/supabase';

type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
};

type FormState = {
  name: string;
  price: string;
  category: string;
  image_url: string;
  image_file: File | null;
};

const emptyForm: FormState = {
  name: '',
  price: '',
  category: '',
  image_url: '',
  image_file: null,
};

export default function AdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.from('menu_items').select('*').order('id', { ascending: false });

    if (!error && data) {
      setItems(data as MenuItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      if (!supabase) {
        throw new Error('لم يتم تهيئة Supabase بعد.');
      }

      let imageUrl = form.image_url || null;

      if (!editingId && !form.image_file) {
        throw new Error('يرجى اختيار صورة للطبق الجديد.');
      }

      if (form.image_file) {
        setUploading(true);
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${form.image_file.name.split('.').pop()?.toLowerCase() || 'jpg'}`;
        const { data, error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, form.image_file, {
          cacheControl: '3600',
          upsert: false,
        });

        if (uploadError || !data?.path) {
          throw new Error('تعذر رفع الصورة.');
        }

        const { data: publicUrlData } = supabase.storage.from('menu-images').getPublicUrl(data.path);
        imageUrl = publicUrlData.publicUrl;
      }

      const payload = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        image_url: imageUrl,
        is_available: true,
      };

      if (editingId) {
        const { error } = await updateMenuItem(editingId, payload);
        if (!error) {
          setEditingId(null);
          setForm(emptyForm);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          await fetchItems();
        }
      } else {
        const { error } = await addMenuItem(payload);
        if (!error) {
          setForm(emptyForm);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          await fetchItems();
        }
      }
    } catch (error) {
      console.error(error);
      setSubmitError('تعذر رفع الصورة أو حفظ الطبق. يرجى المحاولة مرة أخرى.');
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
      image_url: item.image_url ?? '',
      image_file: null,
    });
  };

  const handleDelete = async (id: number) => {
    const { error } = await deleteMenuItem(id);
    if (!error) {
      await fetchItems();
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 text-right text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-400">إدارة المطعم</p>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">لوحة تحكم إدارة المنيو</h1>
            </div>
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-amber-300">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-black/20 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">عناصر المنيو</h2>
                <p className="text-sm text-slate-400">أدر منيوك من هاتفك</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">
                {items.length} عنصر
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">جاري تحميل العناصر...</div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
                لا توجد عناصر في المنيو بعد. أضف أول طبق أدناه.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <article key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-800">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-500">IMG</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="text-sm text-slate-400">{item.category}</p>
                        <p className="text-sm text-amber-300">${Number(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-xl border border-sky-400/30 bg-sky-500/10 p-2 text-sky-300 transition hover:bg-sky-500/20"
                        aria-label={`تعديل ${item.name}`}
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20"
                        aria-label={`حذف ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-black/20 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{editingId ? 'تعديل الطبق' : 'إضافة طبق جديد'}</h2>
                <p className="text-sm text-slate-400">أكمل بيانات الطبق</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2 text-slate-300">
                <Plus className="h-5 w-5" />
              </div>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="اسم الطبق"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-right text-sm outline-none ring-0"
              />
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="السعر"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-right text-sm outline-none ring-0"
              />
              <input
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="التصنيف"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-right text-sm outline-none ring-0"
              />
              <label className="block text-sm text-slate-400">
                <span className="mb-1.5 block">صورة الطبق</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => setForm({ ...form, image_file: e.target.files?.[0] ?? null })}
                  className="block w-full cursor-pointer rounded-2xl border border-dashed border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-amber-500/20 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-300"
                />
                <span className="mt-1.5 block text-xs text-slate-500">الصور المسموح بها: JPG, PNG, JPEG</span>
              </label>

              {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full rounded-2xl bg-amber-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {uploading ? 'جاري الرفع...' : submitting ? 'جاري الحفظ...' : editingId ? 'تحديث الطبق' : 'إضافة الطبق'}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm"
                >
                  إلغاء التعديل
                </button>
              ) : null}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
