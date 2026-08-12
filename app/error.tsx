'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Uncaught error in Next.js App Router:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold font-display text-primary mb-3">
        Something went wrong!
      </h2>
      <p className="text-slate-600 max-w-md mb-8 text-sm">
        We encountered an unexpected error while loading this page. Our technical team has been notified.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="btn-accent flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <a
          href="/"
          className="btn-primary flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </a>
      </div>
    </div>
  );
}
