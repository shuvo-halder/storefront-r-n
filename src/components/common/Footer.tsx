import React, { useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { 
  Send, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  Lock, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { publicSettings, navigateTo, addToast } = useStorefront();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;

    setSubscribed(true);
    addToast({
      title: 'Subscribed Successfully!',
      description: 'Check your inbox for a 10% discount promo code.',
      type: 'success',
    });
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      
      {/* Trust Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free Express Delivery</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                On all orders over ${publicSettings?.freeShippingThreshold || 99}. Dispatched within 24h.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">30-Day Money Back</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Hassle-free returns & instant exchange policy on all gear.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">2-Year Official Warranty</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Full hardware coverage & dedicated tech support specialists.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
              <Headphones size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Expert Support</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Get live help with device compatibility, setup, or order queries.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
        
        {/* Col 1: Brand Info */}
        <div className="lg:col-span-2 space-y-4">
          <div 
            onClick={() => navigateTo('home')} 
            className="cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white font-black text-xl tracking-tight shadow-lg shadow-rose-600/30">
              A
            </div>
            <div className="font-extrabold text-xl text-white tracking-tight">
              AURA<span className="text-rose-500">TECH</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Engineers of next-generation audio equipment, GaN IV fast chargers, aerospace titanium wearables, and high-performance workstation peripherals.
          </p>

          <div className="space-y-2 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-2.5">
              <Phone size={14} className="text-rose-500" />
              <span>{publicSettings?.supportPhone || '+1 (800) 555-2872'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-rose-500" />
              <span>{publicSettings?.supportEmail || 'support@auratech.com'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={14} className="text-rose-500" />
              <span>San Francisco HQ • 500 Howard St, Suite 400</span>
            </div>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-2.5">
            Storefront
          </h4>
          <ul className="space-y-2.5 text-xs">
            {[
              { label: 'All Products', view: 'shop' },
              { label: 'Audio & Headphones', view: 'shop' },
              { label: 'Smart Wearables', view: 'shop' },
              { label: 'Power & Charging', view: 'shop' },
              { label: 'Special Deals & Offers', view: 'deals' },
              { label: 'Tech Blog & Articles', view: 'blog' },
            ].map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => navigateTo(link.view as any)}
                  className="hover:text-rose-400 transition-colors text-slate-400"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Customer Care & Policies */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-2.5">
            Customer Care
          </h4>
          <ul className="space-y-2.5 text-xs">
            {[
              { label: 'Shipping & Delivery Policy', view: 'cms-page', type: 'shipping' },
              { label: 'Returns & Exchange', view: 'cms-page', type: 'returns' },
              { label: 'Warranty Registration', view: 'cms-page', type: 'about' },
              { label: 'Privacy & Data Terms', view: 'cms-page', type: 'privacy' },
              { label: 'Terms of Service', view: 'cms-page', type: 'terms' },
              { label: 'Help & FAQ', view: 'cms-page', type: 'faq' },
            ].map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => navigateTo(link.view as any, { cmsPageType: link.type as any })}
                  className="hover:text-rose-400 transition-colors text-slate-400"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-2.5">
            Insider Newsletter
          </h4>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Subscribe to get early access to hardware drops and an instant 10% off coupon.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="w-full py-2.5 pl-3.5 pr-10 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
            {subscribed && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 size={12} />
                <span>Coupon code sent to email!</span>
              </div>
            )}
          </form>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-500">
            <Lock size={12} className="text-rose-500" />
            <span>256-bit SSL Encrypted Checkout</span>
          </div>
        </div>

      </div>

      {/* Bottom Copyright & Payment Icons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} {publicSettings?.siteName || 'AuraTech Storefront'}. All rights reserved. Designed for Next-Gen E-Commerce.
        </div>

        {/* Payment Badges */}
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700 text-[10px] font-bold text-slate-300">
            VISA
          </span>
          <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700 text-[10px] font-bold text-slate-300">
            MasterCard
          </span>
          <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700 text-[10px] font-bold text-slate-300">
            Apple Pay
          </span>
          <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700 text-[10px] font-bold text-slate-300">
            PayPal
          </span>
        </div>
      </div>

    </footer>
  );
};
