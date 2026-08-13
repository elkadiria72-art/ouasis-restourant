'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import ProductsTable from '@/components/ProductsTable';
import ProductForm from '@/components/ProductForm';
import { fetchProducts } from '@/lib/menu-actions';
import { useAdminSearch } from '@/components/AdminSearchContext';
import { matchesSearch } from '@/lib/search-utils';
import { ar } from '@/lib/ar';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

export default function MenuProductsPage() {
  const { query } = useAdminSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data || []);
    } catch (err) {
      setError((err as Error).message || 'فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        matchesSearch(query, p.name, p.category, p.price, p.id)
      ),
    [products, query]
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">إدارة المنتجات</h1>
          <p className="mt-1 text-sm text-slate-400">أضف وعدّل وأدر أصناف المنيو.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-3 font-medium text-white transition-colors hover:bg-amber-700"
        >
          <Plus size={20} />
          إضافة طبق
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
          <AlertCircle className="text-red-400" size={20} />
          <div>
            <p className="font-medium text-red-300">{ar.error}</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center">
          <p className="text-slate-400">{ar.loading}</p>
        </div>
      )}

      {!loading && (
        <>
          {query && (
            <p className="text-sm text-slate-400">
              {filteredProducts.length} نتيجة للبحث «{query}»
            </p>
          )}
          <ProductsTable
            products={filteredProducts}
            onEdit={(product) => {
              setEditingProduct(product);
              setShowForm(true);
            }}
            onRefresh={loadProducts}
          />
        </>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
