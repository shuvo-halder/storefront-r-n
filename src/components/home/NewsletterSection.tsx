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
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 sm:p-20 text-center relative overflow-hidden shadow-premium">
        
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none opacity-50" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Mail size={14} className="text-accent" />
              <span>Vyzobd Insider</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-black text-[#101A25] tracking-tighter uppercase leading-[0.95]">
              Subscribe for Early Access <br /> & Tech Insights
            </h2>

            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Join our community of over 50,000 tech enthusiasts. Get exclusive access to hardware drops, firmware updates, and private VIP discount codes.
            </p>
          </div>

          {isSubscribed ? (
            <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle2 size={40} className="text-accent mx-auto" />
              <h4 className="font-display font-black text-xl text-[#101A25] uppercase tracking-tighter">You're on the list</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Check your inbox for your welcome code.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="ENTER YOUR EMAIL ADDRESS"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-6 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#101A25] placeholder-slate-400 focus:outline-none focus:border-accent transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="h-14 px-8 bg-[#101A25] hover:bg-accent text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-95 cursor-pointer"
                >
                  Join Now
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Secure SSL Encrypted. No spam. 1-click unsubscribe.
              </p>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
