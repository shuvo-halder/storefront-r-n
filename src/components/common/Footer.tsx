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
    <footer className="bg-[#101A25] text-slate-400 pt-20 pb-10">
      
      {/* Main Footer Links & Newsletter */}
      <div className="container-vyzobd grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-slate-800/60">
        
        {/* Col 1: Brand Info */}
        <div className="lg:col-span-2 space-y-8">
          <div 
            onClick={() => navigateTo('home')} 
            className="cursor-pointer flex items-center group"
          >
            <img 
              src="/logowhite.svg" 
              alt="Vyzobd" 
              className="h-9 w-auto object-contain"
            />
          </div>

          <p className="text-sm text-slate-400 leading-relaxed max-w-sm font-medium">
            {publicSettings?.seo.metaDescription || 'Engineers of next-generation audio equipment and high-performance workstation peripherals for the modern professional.'}
          </p>

          <div className="space-y-4 text-[13px] font-bold text-slate-300 pt-2 uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-accent" />
              <span>{publicSettings?.general.storePhone || '+880 1700 000000'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-accent" />
              <span className="lowercase">{publicSettings?.general.storeEmail || 'support@vyzobd.com'}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-accent" />
              <span className="capitalize">{publicSettings?.general.storeAddress || 'Dhaka, Bangladesh'}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Shop */}
        <div>
          <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-8">
            Shop
          </h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
            {[
              { label: 'All Products', view: 'shop' },
              { label: 'Featured Gear', view: 'shop' },
              { label: 'New Arrivals', view: 'shop' },
              { label: 'Best Sellers', view: 'shop' },
              { label: 'Flash Deals', view: 'deals' },
            ].map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => navigateTo(link.view as any)}
                  className="hover:text-accent transition-colors text-slate-400"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Customer Service */}
        <div>
          <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-8">
            Service
          </h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
            {[
              { label: 'Track Order', view: 'orders' },
              { label: 'Shipping Info', view: 'cms-page', type: 'shipping-policy' },
              { label: 'Returns & Refunds', view: 'cms-page', type: 'return-policy' },
              { label: 'Warranty Claims', view: 'faq' },
              { label: 'Help & Support', view: 'faq' },
            ].map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => navigateTo(link.view as any, link.type ? { cmsPageType: link.type as any } : {})}
                  className="hover:text-accent transition-colors text-slate-400 text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Information */}
        <div>
          <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-8">
            Information
          </h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
            {[
              { label: 'About Vyzobd', view: 'cms-page', type: 'about' },
              { label: 'Our Story', view: 'cms-page', type: 'about' },
              { label: 'Latest News', view: 'blog' },
              { label: 'Terms of Service', view: 'cms-page', type: 'terms-and-conditions' },
              { label: 'Privacy Policy', view: 'cms-page', type: 'privacy-policy' },
            ].map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => navigateTo(link.view as any, link.type ? { cmsPageType: link.type as any } : {})}
                  className="hover:text-accent transition-colors text-slate-400 text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom Copyright & Payment Icons */}
      <div className="container-vyzobd pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        <div>
          © {new Date().getFullYear()} Vyzobd. All rights reserved.
        </div>

        {/* Payment Badges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 opacity-30 grayscale grayscale-100">
             <span className="font-black italic">VISA</span>
             <span className="font-black italic">MASTERCARD</span>
             <span className="font-black italic">PAYPAL</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
