'use client';

import React from 'react';
import Link from 'next/link';
import { useStorefront } from '../../context/StorefrontContext';
import { 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  X,
} from 'lucide-react';

// Custom crisp SVG for TikTok
const TikTokIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.33 22a6.34 6.34 0 0 0 6.34-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.85 4.85 0 0 1-.85-.43z"/>
  </svg>
);

// Custom crisp SVG for WhatsApp
const WhatsAppIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function sanitizeSocialUrl(url: string | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Disallow javascript: or data: or invalid protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return null;

  // Handle whatsapp phone numbers or URLs
  if (trimmed.startsWith('wa.me/') || trimmed.startsWith('whatsapp://')) {
    return `https://${trimmed.replace(/^whatsapp:\/\//, '')}`;
  }

  if (/^\+?[0-9\s\-()]{7,15}$/.test(trimmed)) {
    const cleaned = trimmed.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleaned}`;
  }

  // Ensure protocol
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export const Footer: React.FC = () => {
  const { publicSettings } = useStorefront();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const socialPlatforms = [
    { id: 'facebook', label: 'Facebook', url: publicSettings?.socialLinks?.facebook, Icon: Facebook, iconColor: '#1877F2', buttonClass: 'hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10' },
    { id: 'instagram', label: 'Instagram', url: publicSettings?.socialLinks?.instagram, Icon: Instagram, iconColor: '#E4405F', buttonClass: 'hover:border-[#E4405F]/50 hover:bg-[#E4405F]/10' },
    { id: 'youtube', label: 'YouTube', url: publicSettings?.socialLinks?.youtube, Icon: Youtube, iconColor: '#FF0000', buttonClass: 'hover:border-[#FF0000]/50 hover:bg-[#FF0000]/10' },
    { id: 'twitter', label: 'X (Twitter)', url: publicSettings?.socialLinks?.twitter || publicSettings?.socialLinks?.x, Icon: X, iconColor: '#1DA1F2', buttonClass: 'hover:border-[#1DA1F2]/50 hover:bg-[#1DA1F2]/10' },
    { id: 'linkedin', label: 'LinkedIn', url: publicSettings?.socialLinks?.linkedin, Icon: Linkedin, iconColor: '#0A66C2', buttonClass: 'hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10' },
    { id: 'tiktok', label: 'TikTok', url: publicSettings?.socialLinks?.tiktok, Icon: TikTokIcon, iconColor: '#EE1D52', buttonClass: 'hover:border-[#EE1D52]/50 hover:bg-[#EE1D52]/10' },
    { id: 'whatsapp', label: 'WhatsApp', url: publicSettings?.socialLinks?.whatsapp, Icon: WhatsAppIcon, iconColor: '#25D366', buttonClass: 'hover:border-[#25D366]/50 hover:bg-[#25D366]/10' },
  ];

  const activeSocialLinks = socialPlatforms
    .map((platform) => ({
      ...platform,
      sanitizedUrl: sanitizeSocialUrl(platform.url),
    }))
    .filter((platform): platform is typeof platform & { sanitizedUrl: string } => Boolean(platform.sanitizedUrl));

  return (
    <footer className="bg-[#111827] text-[#9CA3AF] pt-12 sm:pt-14 pb-5">
      
      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 pb-10 border-b border-gray-800">
        
        {/* Col 1: Brand Info */}
        <div className="lg:col-span-2 space-y-5">
          <Link 
            href="/" 
            className="cursor-pointer inline-flex items-center group"
          >
            <img 
              src={publicSettings?.branding?.logoDarkUrl || "/logowhite.svg"} 
              alt={publicSettings?.general?.siteName || "Vyzobd"} 
              className="h-8 lg:h-9 w-auto object-contain"
            />
          </Link>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm font-normal">
            {publicSettings?.seo?.metaDescription || 'Quality products, trusted service, and a better shopping experience — all in one place.'}
          </p>

          <div className="grid grid-cols-[1fr_auto] lg:flex lg:flex-col items-start justify-between lg:justify-start gap-4 pt-1 w-full">
            <div className="space-y-2.5 text-xs font-medium text-gray-300 min-w-0">
              {(publicSettings?.supportPhone || publicSettings?.general?.storePhone || publicSettings?.store?.supportPhone || publicSettings?.store?.callOrderNumber) && (
                <div className="flex items-center gap-3 min-w-0">
                  <Phone size={14} className="text-[#DC2B53] shrink-0" />
                  <span className="truncate">{publicSettings?.supportPhone || publicSettings?.general?.storePhone || publicSettings?.store?.supportPhone || publicSettings?.store?.callOrderNumber}</span>
                </div>
              )}
              {(publicSettings?.supportEmail || publicSettings?.general?.storeEmail || publicSettings?.store?.supportEmail) && (
                <div className="flex items-center gap-3 min-w-0">
                  <Mail size={14} className="text-[#DC2B53] shrink-0" />
                  <span className="lowercase truncate">{publicSettings?.supportEmail || publicSettings?.general?.storeEmail || publicSettings?.store?.supportEmail}</span>
                </div>
              )}
              {(publicSettings?.general?.storeAddress || publicSettings?.store?.address) && (
                <div className="flex items-center gap-3 min-w-0">
                  <MapPin size={14} className="text-[#DC2B53] shrink-0" />
                  <span className="capitalize truncate">{publicSettings?.general?.storeAddress || publicSettings?.store?.address}</span>
                </div>
              )}
            </div>

            {/* Social Media Icons (Mobile: right side of contact info in a 2-column grid; Desktop: horizontal row below contact info) */}
            {mounted && activeSocialLinks.length > 0 && (
              <div className="flex justify-end lg:justify-start shrink-0">
                <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 pt-0.5 lg:pt-2">
                  {activeSocialLinks.map((social) => (
                    <a
                      key={social.id}
                      href={social.sanitizedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`w-8 h-8 rounded-lg bg-gray-800/90 border border-gray-700/80 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#DC2B53]/50 shrink-0 ${social.buttonClass}`}
                    >
                      <social.Icon className="w-4 h-4 shrink-0" style={{ color: social.iconColor }} />
                    </a>
                  ))}
                </div>
              </div>
            )}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex flex-col-reverse md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-400">
        <div className="text-center md:text-left text-xs sm:text-sm text-gray-400 font-normal leading-relaxed md:shrink-0">
          © {new Date().getFullYear()} {publicSettings?.general?.siteName || "Vyzobd"}. All rights reserved.
        </div>

        {/* Payment Gateway / SSLCOMMERZ Banner */}
        <div className="flex items-center justify-center md:justify-end shrink-0 w-full md:w-auto">
          <img 
            src="/images/sslcommerz-banner.png" 
            alt="Secure Payment Gateway powered by SSLCOMMERZ - Visa, Mastercard, bKash, Nagad, AMEX" 
            className="w-full max-w-[494px] h-auto md:w-[494px] md:h-[72px] object-contain select-none transition-opacity duration-200"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

    </footer>
  );
};


