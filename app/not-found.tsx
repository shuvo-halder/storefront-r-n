import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-6 font-display font-bold text-3xl">
        404
      </div>
      <h2 className="text-3xl font-bold font-display text-primary mb-3">
        Page Not Found
      </h2>
      <p className="text-slate-600 max-w-md mb-8 text-sm">
        The page or product you are looking for does not exist or has been moved to a new URL.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="btn-accent flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="btn-primary flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
