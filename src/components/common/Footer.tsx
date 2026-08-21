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
  const { publicSettings } = useStorefront();

  return (
    <footer className="bg-[#111827] text-[#9CA3AF] pt-12 sm:pt-14 pb-8">
      
      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 pb-10 border-b border-gray-800">
        
        {/* Col 1: Brand Info */}
        <div className="lg:col-span-2 space-y-5">
          <Link 
            href="/" 
            className="cursor-pointer inline-flex items-center group"
          >
            <img 
              src="/logowhite.svg" 
              alt="Vyzobd" 
              className="h-8 lg:h-9 w-auto object-contain"
            />
          </Link>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm font-normal">
            {publicSettings?.seo.metaDescription || 'Quality products, trusted service, and a better shopping experience — all in one place.'}
          </p>

          <div className="space-y-2.5 text-xs font-medium text-gray-300 pt-1">
            <div className="flex items-center gap-3">
              <Phone size={14} className="text-[#DC2B53]" />
              <span>{publicSettings?.general.storePhone || '+880 1700 000000'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={14} className="text-[#DC2B53]" />
              <span className="lowercase">{publicSettings?.general.storeEmail || 'support@vyzobd.com'}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={14} className="text-[#DC2B53]" />
              <span className="capitalize">{publicSettings?.general.storeAddress || 'Dhaka, Bangladesh'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Links Grid (2 Columns on Mobile, 3 Columns on Tablet/Desktop) */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Col 2: Shop */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Shop
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-gray-400">
              {[
                { label: 'All Products', href: '/products' },
                { label: 'Popular Products', href: '/products' },
                { label: 'New Arrivals', href: '/products?sort=newest' },
                { label: 'Featured Items', href: '/products?sort=featured' },
                { label: 'Special Deals', href: '/products?deals=true' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="hover:text-[#DC2B53] transition-colors text-gray-400 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Service
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-gray-400">
              {[
                { label: 'Track Order', href: '/account/orders' },
                { label: 'Shipping Info', href: '/pages/shipping' },
                { label: 'Returns & Refunds', href: '/account/returns' },
                { label: 'Help & Support', href: '/faq' },
                { label: 'FAQ', href: '/faq' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="hover:text-[#DC2B53] transition-colors text-gray-400 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Information */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Information
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-gray-400">
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
                    className="hover:text-[#DC2B53] transition-colors text-gray-400 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom Copyright & Payment Icons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-400">
        <div>
          © {new Date().getFullYear()} Vyzobd. All rights reserved.
        </div>

        {/* Payment Gateway / SSLCOMMERZ Banner */}
        <div className="flex items-center justify-start sm:justify-end shrink-0 w-full sm:w-auto">
          <img 
            src="/images/sslcommerz-banner.svg" 
            alt="Secure Payment Gateway powered by SSLCOMMERZ - Visa, Mastercard, bKash, Nagad, AMEX" 
            className="h-7 sm:h-8 max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] md:max-w-[400px] w-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

    </footer>
  );
};

