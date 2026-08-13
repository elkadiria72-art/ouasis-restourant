'use client';



import { useState, useEffect } from 'react';

import { GripVertical, Pencil, Trash2, Plus, AlertCircle } from 'lucide-react';

import {

  fetchCategories,

  addCategory,

  updateCategory,

  deleteCategory,

  reorderCategories,

} from '@/lib/menu-actions';

import { ar } from '@/lib/ar';



interface Category {

  id: number;

  name: string;

  order_index: number;

}



interface CategoriesManagerProps {

  initialCategories: Category[];

}



export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {

  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingName, setEditingName] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');

  const [draggingId, setDraggingId] = useState<number | null>(null);



  useEffect(() => {

    setCategories(initialCategories);

  }, [initialCategories]);



  const [loading, setLoading] = useState(false);



  const handleAddCategory = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!newCategoryName.trim()) return;



    setLoading(true);

    setError(null);



    try {

      const maxOrder = Math.max(...categories.map((c) => c.order_index), -1);

      await addCategory({

        name: newCategoryName,

        order_index: maxOrder + 1,

      });



      const updated = await fetchCategories();

      setCategories(updated);

      setNewCategoryName('');

    } catch (err) {

      setError((err as Error).message || 'فشل إضافة التصنيف');

    } finally {

      setLoading(false);

    }

  };



  const handleUpdateCategory = async (id: number) => {

    if (!editingName.trim()) return;



    setLoading(true);

    setError(null);



    try {

      await updateCategory(id, { name: editingName });

      setCategories(categories.map((c) => (c.id === id ? { ...c, name: editingName } : c)));

      setEditingId(null);

      setEditingName('');

    } catch (err) {

      setError((err as Error).message || 'فشل تحديث التصنيف');

    } finally {

      setLoading(false);

    }

  };



  const handleDeleteCategory = async (id: number) => {

    if (!window.confirm('حذف هذا التصنيف؟ لن تتأثر المنتجات في هذا التصنيف.')) return;



    setLoading(true);

    setError(null);



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



  return (

    <div className="space-y-6">

      {error && (

        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">

          <AlertCircle className="text-red-400" size={20} />

          <p className="text-red-300">{error}</p>

        </div>

      )}



      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">

        <h3 className="mb-4 text-lg font-semibold text-white">إضافة تصنيف</h3>

        <form onSubmit={handleAddCategory} className="flex gap-3">

          <button

            type="submit"

            disabled={loading}

            className="flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"

          >

            <Plus size={18} />

            إضافة

          </button>

          <input

            type="text"

            dir="rtl"

            value={newCategoryName}

            onChange={(e) => setNewCategoryName(e.target.value)}

            placeholder="مثال: مقبلات"

            className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white transition-colors focus:border-amber-600 focus:outline-none"

          />

        </form>

      </div>



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

                          setEditingName('');

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

                          setEditingName(category.name);

                        }}

                        className="rounded bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"

                      >

                        <Pencil size={16} />

                      </button>

                    </>

                  )}

                </div>



                {editingId === category.id ? (

                  <input

                    type="text"

                    dir="rtl"

                    value={editingName}

                    onChange={(e) => setEditingName(e.target.value)}

                    autoFocus

                    className="flex-1 rounded border border-slate-600 bg-slate-700 px-3 py-1 text-white focus:border-amber-600 focus:outline-none"

                  />

                ) : (

                  <div className="flex-1 text-right">

                    <p className="font-medium text-white">{category.name}</p>

                    <p className="text-xs text-slate-400">الترتيب: {index + 1}</p>

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


