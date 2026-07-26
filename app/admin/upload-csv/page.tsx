'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function UploadCSV() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/products/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Upload failed');
        return;
      }

      const data = await res.json();
      setSuccess(`${data.count} products imported successfully!`);
      setFile(null);
      setTimeout(() => router.push('/admin/dashboard'), 2000);
    } catch (err) {
      setError('Failed to upload CSV');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Products</h1>
          <p className="text-slate-400 mb-8">
            Import products from a CSV file. See the template below for the required format.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-input"
              />
              <label
                htmlFor="csv-input"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload size={32} className="text-slate-400" />
                <div>
                  <p className="text-white font-medium">
                    {file ? file.name : 'Click to upload CSV file'}
                  </p>
                  <p className="text-sm text-slate-400">or drag and drop</p>
                </div>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Products'}
            </Button>
          </form>

          {/* CSV Template */}
          <div className="mt-12 pt-8 border-t border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">CSV Template</h2>
            <div className="bg-slate-900 rounded p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words">
{`name,brand,price,originalPrice,rating,reviews,category,image,images,description,specs_material,specs_weight,specs_comfort,sizes,inStock
Geen-barett,MP4,245,280,4.8,342,Performance,/products/brown-boy.jpeg,/products/brown-boy.jpeg;/products/brown-boy.jpeg,Ultimate performance palms,Premium Mesh & Suede,285g,Ultra-responsive cushioning,6;7;8;9;10;11;12;13,true
Choco Sandal,MP4,189,,4.7,218,Classic,/products/choco-sandal.jpeg,/products/choco-sandal.jpeg;/products/choco-sandal.jpeg,Timeless design meets modern comfort,Full Grain Leather,310g,Padded insole technology,6;7;8;9;10;11;12;13,true`}
              </pre>
            </div>
            <p className="text-sm text-slate-400 mt-4">
              <strong>Notes:</strong> Use semicolons to separate multiple values in image and sizes fields. originalPrice is optional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
