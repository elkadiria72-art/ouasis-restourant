'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import ProductsTable from '@/components/ProductsTable';
import ProductForm from '@/components/ProductForm';
import { fetchProducts, fetchCategories } from '@/lib/menu-actions';
import { useAdminSearch } from '@/components/AdminSearchContext';
import { matchesSearch } from '@/lib/search-utils';
import { ar } from '@/lib/ar';
import { loadCachedDataset } from '@/lib/offline-cache';
import { useAdminRealtime } from '@/components/useAdminRealtime';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

interface Category {
  id: number;
  name: string;
  order_index: number;
  name_fr?: string | null;
  name_en?: string | null;
}

const normalizeCategory = (value: string) => value.trim().toLowerCase();

export default function MenuProductsPage() {
  const { query } = useAdminSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(products.length === 0);
      setError(null);
      const result = await loadCachedDataset<Product[]>('menu:products', fetchProducts, (cached) => {
        setProducts(cached.data || []);
        setLoading(false);
      });
      setProducts(result.data || []);
    } catch (err) {
      setError((err as Error).message || 'فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const rows = await fetchCategories();
      setCategories((rows as Category[]) || []);
    } catch {
      // Category chips are an enhancement; the table still lists products if
      // the categories table is unavailable.
      setCategories([]);
    }
  };

  useEffect(() => {
    void loadProducts();
    void loadCategories();
    const handleReconnect = () => { void loadProducts(); void loadCategories(); };
    window.addEventListener('admin-connection-restored', handleReconnect);
    return () => window.removeEventListener('admin-connection-restored', handleReconnect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAdminRealtime({ onMenuItemsChange: () => void loadProducts(), onCategoriesChange: () => void loadCategories() });

  // Real filter chips: categories table first, plus any category string that
  // exists on products but is missing from the table (legacy data stays visible).
  const categoryChips = useMemo(() => {
    const chips: string[] = categories.map((c) => c.name).filter(Boolean);
    const known = new Set(chips.map(normalizeCategory));
    for (const product of products) {
      const name = product.category?.trim();
      if (name && !known.has(normalizeCategory(name))) {
        known.add(normalizeCategory(name));
        chips.push(name);
      }
    }
    return chips;
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    const byCategory = selectedCategory === 'ALL'
      ? products
      : products.filter((p) => normalizeCategory(p.category || '') === normalizeCategory(selectedCategory));
    return byCategory.filter((p) => matchesSearch(query, p.name, p.category, p.price, p.id));
  }, [products, selectedCategory, query]);

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

      {/* Category filter — from the database, synced live */}
      <div className="flex flex-wrap items-center gap-2" dir="rtl">
        <button
          type="button"
          onClick={() => setSelectedCategory('ALL')}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === 'ALL'
              ? 'border-amber-600 bg-amber-600 text-white'
              : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-amber-600/60 hover:text-amber-400'
          }`}
        >
          الكل ({products.length})
        </button>
        {categoryChips.map((name) => {
          const count = products.filter((p) => normalizeCategory(p.category || '') === normalizeCategory(name)).length;
          const active = normalizeCategory(selectedCategory) === normalizeCategory(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedCategory(name)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-amber-600 bg-amber-600 text-white'
                  : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-amber-600/60 hover:text-amber-400'
              }`}
            >
              {name} ({count})
            </button>
          );
        })}
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
