"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Upload } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
      toast.success('Product deleted');
    } catch (err) {
      setError('Failed to delete product');
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Action Buttons */}
        <div className="flex gap-4 mb-8 mt-6">
          <Link href="/admin/add-product">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus size={18} />
              Add Product
            </Button>
          </Link>
          <Link href="/admin/upload-csv">
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Upload size={18} />
              Upload CSV
            </Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Products Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No products yet. Add one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {products.map((product) => {
                    const productId = (product as any)._id ?? (product as any).id ?? '';
                    return (
                      <tr
                        key={productId}
                        className="hover:bg-slate-700 transition"
                      >
                        <td className="px-6 py-4 text-sm text-white">
                          <div className="max-w-[220px] truncate font-medium">
                            {product.name ?? productId}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {product.brand}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-medium">
                          ₦{product.price}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              product.inStock
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <Link href={`/admin/edit-product/${productId}`}>
                            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition">
                              Edit
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(productId)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
