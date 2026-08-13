'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import CategoriesManager from '@/components/CategoriesManager';
import { fetchCategories } from '@/lib/menu-actions';
import { useAdminSearch } from '@/components/AdminSearchContext';
import { matchesSearch } from '@/lib/search-utils';
import { ar } from '@/lib/ar';

interface Category {
  id: number;
  name: string;
  order_index: number;
}

export default function MenuCategoriesPage() {
  const { query } = useAdminSearch();
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
      setError((err as Error).message || 'فشل تحميل التصنيفات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(
    () => categories.filter((c) => matchesSearch(query, c.name, c.id)),
    [categories, query]
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">إدارة التصنيفات</h1>
        <p className="mt-1 text-sm text-slate-400">
          نظّم المنيو بالتصنيفات. اسحب لإعادة الترتيب كما يظهر في منيو QR.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center">
          <p className="text-slate-400">{ar.loading}</p>
        </div>
      )}

      {!loading && (
        <CategoriesManager initialCategories={filteredCategories} />
      )}
    </div>
  );
}
