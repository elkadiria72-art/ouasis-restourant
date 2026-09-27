'use client';

import { useEffect, useState } from 'react';
import { GripVertical, Pencil, Trash2, Plus, AlertCircle, Languages } from 'lucide-react';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '@/lib/menu-actions';
import { ar } from '@/lib/ar';

export interface AdminCategory {
  id: number;
  name: string;
  name_fr?: string | null;
  name_en?: string | null;
  order_index: number;
}

interface CategoriesManagerProps {
  initialCategories: AdminCategory[];
}

type FormState = { name: string; name_fr: string; name_en: string };
const emptyForm: FormState = { name: '', name_fr: '', name_en: '' };

/** Translation columns may not exist yet (pre-migration); send them only when set. */
function stripEmptyTranslations(payload: FormState & { order_index?: number }) {
  const result: Record<string, string | number> = { name: payload.name };
  if (payload.order_index !== undefined) result.order_index = payload.order_index;
  if (payload.name_fr.trim()) result.name_fr = payload.name_fr.trim();
  if (payload.name_en.trim()) result.name_en = payload.name_en.trim();
  return result;
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState<FormState>(emptyForm);
  const [newForm, setNewForm] = useState<FormState>(emptyForm);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const maxOrder = Math.max(...categories.map((c) => c.order_index ?? 0), -1);
      const payload = stripEmptyTranslations({ ...newForm, order_index: maxOrder + 1 });
      await addCategory(payload as Parameters<typeof addCategory>[0]);

      const updated = await fetchCategories();
      setCategories(updated);
      setNewForm(emptyForm);
      setNotice('تم حفظ التصنيف في قاعدة البيانات.');
    } catch (err) {
      const message = (err as Error).message || 'فشل إضافة التصنيف';
      // Translation columns missing (migration not applied yet) — retry with the
      // Arabic name only so creation still succeeds before the migration runs.
      if (/name_fr|name_en|PGRST204/i.test(message)) {
        await addCategory({ name: newForm.name.trim(), order_index: Math.max(...categories.map((c) => c.order_index ?? 0), -1) });
        const updated = await fetchCategories();
        setCategories(updated);
        setNewForm(emptyForm);
        setNotice('حُفظ الاسم العربي. لتخزين FR/EN نفّذ سكريبت أعمدة الترجمة أولاً.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editingForm.name.trim()) return;

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const payload = stripEmptyTranslations(editingForm);
      await updateCategory(id, payload);
      const updated = await fetchCategories();
      setCategories(updated);
      setEditingId(null);
      setEditingForm(emptyForm);
      setNotice('تم تحديث التصنيف.');
    } catch (err) {
      const message = (err as Error).message || 'فشل تحديث التصنيف';
      // Column missing (migration not applied yet) — save Arabic name only.
      if (/name_fr|name_en|PGRST204/i.test(message)) {
        await updateCategory(id, { name: editingForm.name.trim() });
        const updated = await fetchCategories();
        setCategories(updated);
        setEditingId(null);
        setEditingForm(emptyForm);
        setNotice('حُفظ الاسم العربي. لتخزين FR/EN نفّذ سكريبت أعمدة الترجمة أولاً.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('حذف هذا التصنيف؟ لن تتأثر المنتجات في هذا التصنيف.')) return;

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      setError((err as Error).message || 'فشل حذف التصنيف');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newOrder = [...categories];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);

    setCategories(newOrder);

    try {
      const reorderPayload = newOrder.map((cat, idx) => ({
        id: cat.id,
        order_index: idx,
      }));
      await reorderCategories(reorderPayload);
    } catch (err) {
      setError((err as Error).message || 'فشل إعادة ترتيب التصنيفات');
      setCategories(initialCategories);
    }
  };

  const translationBadges = (category: AdminCategory) => (
    <span className="flex flex-wrap items-center gap-1 text-[11px]">
      {category.name_fr ? (
        <span className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-200" title="الترجمة الفرنسية">FR ✓</span>
      ) : (
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-500">FR —</span>
      )}
      {category.name_en ? (
        <span className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-200" title="الترجمة الإنجليزية">EN ✓</span>
      ) : (
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-500">EN —</span>
      )}
    </span>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}
      {notice && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/20 p-4 text-sm text-green-300">{notice}</div>
      )}

      {/* Add category: AR (required) + FR/EN translations */}
      <form onSubmit={handleAddCategory} className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-white">
          <Plus size={18} /> إضافة تصنيف جديد
        </h3>
        <p className="mb-4 text-sm text-slate-400">الاسم العربي إلزامي — الترجمتان اختياريتان وتُخزنان في قاعدة البيانات.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-300">العربية (AR) *</span>
            <input
              type="text"
              dir="rtl"
              required
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              placeholder="مثال: مشاوي"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white transition-colors focus:border-amber-600 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-300">Français (FR)</span>
            <input
              type="text"
              dir="ltr"
              value={newForm.name_fr}
              onChange={(e) => setNewForm({ ...newForm, name_fr: e.target.value })}
              placeholder="Grillades"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white transition-colors focus:border-amber-600 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-300">English (EN)</span>
            <input
              type="text"
              dir="ltr"
              value={newForm.name_en}
              onChange={(e) => setNewForm({ ...newForm, name_en: e.target.value })}
              placeholder="Grills"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white transition-colors focus:border-amber-600 focus:outline-none"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          حفظ التصنيف
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
        <div className="border-b border-slate-700 p-6 text-right">
          <h3 className="text-lg font-semibold text-white">التصنيفات ({categories.length})</h3>
          <p className="mt-1 text-sm text-slate-400">اسحب لإعادة الترتيب • تُزامَن التغييرات فوراً مع قاعدة البيانات</p>
        </div>

        <div className="divide-y divide-slate-700">
          {categories.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              لا توجد تصنيفات بعد. أنشئ تصنيفاً للبدء!
            </div>
          ) : (
            categories.map((category, index) => (
              <div
                key={category.id}
                draggable
                onDragStart={() => setDraggingId(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggingId !== null && draggingId !== index) {
                    handleReorder(draggingId, index);
                  }
                  setDraggingId(null);
                }}
                className={`flex cursor-move items-center gap-4 p-4 ${
                  draggingId === index ? 'bg-amber-600/20' : 'hover:bg-slate-700/50'
                } transition-colors`}
              >
                <div className="flex gap-2">
                  {editingId === category.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditingForm(emptyForm);
                        }}
                        className="rounded bg-slate-700 px-3 py-1 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600"
                      >
                        {ar.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateCategory(category.id)}
                        disabled={loading}
                        className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        {ar.save}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="rounded bg-red-600 p-2 text-white transition-colors hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingForm({
                            name: category.name,
                            name_fr: category.name_fr || '',
                            name_en: category.name_en || '',
                          });
                        }}
                        className="rounded bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
                      >
                        <Pencil size={16} />
                      </button>
                    </>
                  )}
                </div>

                {editingId === category.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      dir="rtl"
                      value={editingForm.name}
                      onChange={(e) => setEditingForm({ ...editingForm, name: e.target.value })}
                      autoFocus
                      className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-1.5 text-white focus:border-amber-600 focus:outline-none"
                      placeholder="العربية"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        dir="ltr"
                        value={editingForm.name_fr}
                        onChange={(e) => setEditingForm({ ...editingForm, name_fr: e.target.value })}
                        className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-1.5 text-white focus:border-amber-600 focus:outline-none"
                        placeholder="Français"
                      />
                      <input
                        type="text"
                        dir="ltr"
                        value={editingForm.name_en}
                        onChange={(e) => setEditingForm({ ...editingForm, name_en: e.target.value })}
                        className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-1.5 text-white focus:border-amber-600 focus:outline-none"
                        placeholder="English"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-right">
                    <p className="font-medium text-white">{category.name}</p>
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <span className="text-xs text-slate-400">الترتيب: {index + 1}</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Languages size={12} />
                      </span>
                      {translationBadges(category)}
                    </div>
                  </div>
                )}

                <GripVertical className="text-slate-500" size={20} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
