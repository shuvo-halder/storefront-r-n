'use client';

import React, { useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { Send, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const { addToast } = useStorefront();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast({
        title: 'Valid Email Required',
        description: 'Please enter a valid email address to subscribe.',
        type: 'error',
      });
      return;
    }

    setIsSubscribed(true);
    addToast({
      title: 'Subscription Confirmed!',
      description: 'Your 10% discount promo code TECH20 has been activated.',
      type: 'success',
    });
    setEmail('');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-8 sm:p-14 text-center relative overflow-hidden shadow-xs">
        
        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#DC2B53]">
              <Mail size={13} className="text-[#DC2B53]" />
              <span>Newsletter</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight leading-tight">
              Subscribe for Deals & Updates
            </h2>

            <p className="text-sm text-[#6B7280] font-normal leading-relaxed">
              Get exclusive access to new product drops, firmware releases, and private discounts directly in your inbox.
            </p>
          </div>

          {isSubscribed ? (
            <div className="p-6 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
              <CheckCircle2 size={32} className="text-[#16A34A] mx-auto" />
              <h4 className="font-bold text-lg text-[#111827]">You're on the list</h4>
              <p className="text-xs text-[#6B7280]">
                Check your inbox for your welcome discount code.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-4 pr-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#DC2B53] focus:ring-1 focus:ring-[#DC2B53] transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-6 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-[#6B7280]">
                No spam. You can unsubscribe at any time.
              </p>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
