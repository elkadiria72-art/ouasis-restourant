'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, AlertCircle } from 'lucide-react';
import { toggleProductAvailability, deleteProduct } from '@/lib/menu-actions';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onRefresh: () => void;
}

export default function ProductsTable({ products, onEdit, onRefresh }: ProductsTableProps) {
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleAvailability = async (product: Product) => {
    setToggling(product.id);
    setError(null);

    try {
      await toggleProductAvailability(product.id, !product.is_available);
      onRefresh();
    } catch (err) {
      setError('Failed to update availability');
      console.error(err);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setDeleting(id);
    setError(null);

    try {
      await deleteProduct(id);
      onRefresh();
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors"
          >
            {/* Image */}
            <div className="aspect-video bg-slate-900 overflow-hidden relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No Image
                </div>
              )}
              
              {/* Availability Badge */}
              <button
                onClick={() => handleToggleAvailability(product)}
                disabled={toggling === product.id}
                className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  product.is_available
                    ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                    : 'bg-red-500/20 text-red-300 border border-red-500/50'
                } ${toggling === product.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-30 cursor-pointer'}`}
              >
                {toggling === product.id ? '...' : product.is_available ? '🟢 Available' : '🔴 Out of Stock'}
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                <p className="text-sm text-slate-400">{product.category}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-amber-600">{product.price} DH</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-700">
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={deleting === product.id}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No products yet. Create your first dish!</p>
        </div>
      )}
    </div>
  );
}
