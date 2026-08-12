'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStorefront } from '../../context/StorefrontContext';
import { 
  Mail, 
  Phone, 
  MapPin,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { publicSettings, addToast } = useStorefront();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;

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
          <Link 
            href="/" 
            className="cursor-pointer flex items-center group inline-block"
          >
            <img 
              src="/logowhite.svg" 
              alt="Vyzobd" 
              className="h-9 w-auto object-contain"
            />
          </Link>

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
              { label: 'All Products', href: '/products' },
              { label: 'Featured Gear', href: '/products' },
              { label: 'New Arrivals', href: '/products?sort=newest' },
              { label: 'Best Sellers', href: '/products?sort=bestsellers' },
              { label: 'Flash Deals', href: '/products?deals=true' },
            ].map((link, idx) => (
              <li key={idx}>
                <Link
                  href={link.href}
                  className="hover:text-accent transition-colors text-slate-400 block"
                >
                  {link.label}
                </Link>
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
              { label: 'Track Order', href: '/account/orders' },
              { label: 'Shipping Info', href: '/pages/shipping' },
              { label: 'Returns & Refunds', href: '/account/returns' },
              { label: 'Warranty Claims', href: '/faq' },
              { label: 'Help & Support', href: '/faq' },
            ].map((link, idx) => (
              <li key={idx}>
                <Link
                  href={link.href}
                  className="hover:text-accent transition-colors text-slate-400 block"
                >
                  {link.label}
                </Link>
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
              { label: 'About Vyzobd', href: '/pages/about' },
              { label: 'Our Story', href: '/pages/about' },
              { label: 'Latest News', href: '/blog' },
              { label: 'Terms of Service', href: '/pages/terms' },
              { label: 'Privacy Policy', href: '/pages/privacy' },
            ].map((link, idx) => (
              <li key={idx}>
                <Link
                  href={link.href}
                  className="hover:text-accent transition-colors text-slate-400 block"
                >
                  {link.label}
                </Link>
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
          <div className="flex items-center gap-2 text-slate-400 opacity-30 grayscale">
             <span className="font-black italic">VISA</span>
             <span className="font-black italic">MASTERCARD</span>
             <span className="font-black italic">PAYPAL</span>
          </div>
        </div>
      </div>

    </footer>
  );
};

