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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [draggingId, setDraggingId] = useState<number | null>(null);

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
      setError((err as Error).message || 'Failed to add category');
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
      setError((err as Error).message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Delete this category? Products in this category will not be affected.'))
      return;

    setLoading(true);
    setError(null);

    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      setError((err as Error).message || 'Failed to delete category');
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
      setError((err as Error).message || 'Failed to reorder categories');
      // Revert to previous order
      setCategories(initialCategories);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Add Category Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Add New Category</h3>
        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g., Appetizers"
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-600 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Categories ({categories.length})</h3>
          <p className="text-sm text-slate-400 mt-1">Drag to reorder • Changes sync instantly to database</p>
        </div>

        <div className="divide-y divide-slate-700">
          {categories.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              No categories yet. Create one to get started!
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
                className={`p-4 flex items-center gap-4 ${
                  draggingId === index ? 'bg-amber-600/20' : 'hover:bg-slate-700/50'
                } transition-colors cursor-move`}
              >
                {/* Drag Handle */}
                <GripVertical className="text-slate-500" size={20} />

                {/* Category Info */}
                {editingId === category.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                    className="flex-1 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-amber-600"
                  />
                ) : (
                  <div className="flex-1">
                    <p className="text-white font-medium">{category.name}</p>
                    <p className="text-xs text-slate-400">Order: {index + 1}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {editingId === category.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateCategory(category.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName('');
                        }}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingName(category.name);
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
