'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import CategoriesManager from '@/components/CategoriesManager';
import { fetchCategories } from '@/lib/menu-actions';

interface Category {
  id: number;
  name: string;
  order_index: number;
}

export default function MenuCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategories();
      setCategories(data || []);
    } catch (err) {
      setError((err as Error).message || 'Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Categories Management</h1>
        <p className="text-slate-400 mt-1">Organize your menu with categories. Reorder to change how they appear on the QR menu.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <div>
            <p className="text-red-300 font-medium">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <p className="text-slate-400">Loading categories...</p>
        </div>
      )}

      {/* Manager */}
      {!loading && <CategoriesManager initialCategories={categories} />}
    </div>
  );
}
