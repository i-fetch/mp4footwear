/*
  CSV Upload page commented out per admin UI update.
  Original implementation preserved below for reference.

  (Commented out content removed to disable CSV upload UI.)

  If you want to re-enable, restore the original file content above.
*/

import Link from 'next/link';

export default function UploadCSVDisabled() {
  return (
    <div className="min-h-screen bg-slate-900 p-4 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg p-8 max-w-xl text-center">
        <h1 className="text-2xl font-bold text-white mb-4">CSV Upload Disabled</h1>
        <p className="text-slate-300 mb-6">The CSV upload page has been disabled. If you need to re-enable it, restore the implementation.</p>
        <Link href="/admin/dashboard" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
