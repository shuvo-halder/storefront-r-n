'use client';

import { Suspense } from 'react';
import { ReviewsPage } from '../../../src/components/account/ReviewsPage';
import { Loader2 } from 'lucide-react';

export default function AccountReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <ReviewsPage />
    </Suspense>
  );
}
