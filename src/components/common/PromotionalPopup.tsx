'use client';

import React, { useEffect, useState } from 'react';
import { X, Tag, Check, Sparkles, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Popup } from '../../types/storefront';
import { storefrontApi } from '../../services/storefrontApi';
import { SmartImage } from './SmartImage';
import { RichTextRenderer } from './RichTextRenderer';
import { useStorefront } from '../../context/StorefrontContext';

export const PromotionalPopup: React.FC = () => {
  const pathname = usePathname();
  const { navigateTo } = useStorefront();
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    // Reset state on route change
    setIsOpen(false);
    setActivePopup(null);

    function getContextFromPathname(path: string | null): string {
      if (!path || path === '/') return 'homepage';
      if (
        path.startsWith('/products') ||
        path.startsWith('/categories') ||
        path.startsWith('/brands') ||
        path.startsWith('/shop') ||
        path.startsWith('/search') ||
        path.startsWith('/deals')
      ) {
        return 'product';
      }
      return 'other';
    }

    async function loadPopups() {
      try {
        const pageContext = getContextFromPathname(pathname);
        // Do not show popup if context is not mapped to an active type yet (e.g. cart/checkout)
        if (pageContext === 'other') return;

        const popups = await storefrontApi.getPopups();
        if (!isMounted || !Array.isArray(popups) || popups.length === 0) {
          return;
        }

        // Filter for popups matching the current page context
        const eligible = popups.filter((p) => {
          if (!p || !p.id) return false;
          const pType = (p.type || '').toLowerCase();
          return pType === pageContext;
        });

        if (eligible.length === 0) return;

        // Select the first unseen popup using sessionStorage
        const unseenPopup = eligible.find((p) => {
          try {
            return !sessionStorage.getItem(`popup_seen_${p.id}`);
          } catch {
            return true;
          }
        });

        if (!unseenPopup) return;

        setActivePopup(unseenPopup);

        // Determine delay (default 3 seconds if missing/null/invalid)
        const delayInSec = typeof unseenPopup.delaySeconds === 'number' && unseenPopup.delaySeconds >= 0
          ? unseenPopup.delaySeconds
          : 3;

        timer = setTimeout(() => {
          if (isMounted) {
            setIsOpen(true);
          }
        }, delayInSec * 1000);
      } catch (error) {
        console.error('[PromotionalPopup] Failed to load popups:', error);
      }
    }

    loadPopups();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    if (activePopup) {
      try {
        sessionStorage.setItem(`popup_seen_${activePopup.id}`, 'true');
      } catch {
        // ignore sessionStorage errors
      }
    }
    setIsOpen(false);
  };

  const handleCopyCoupon = async () => {
    if (!activePopup?.couponCode) return;
    try {
      await navigator.clipboard.writeText(activePopup.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy strategy
      const textArea = document.createElement('textarea');
      textArea.value = activePopup.couponCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAction = () => {
    handleClose();
    if (activePopup?.targetUrl) {
      if (activePopup.targetUrl.startsWith('http://') || activePopup.targetUrl.startsWith('https://')) {
        window.open(activePopup.targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        navigateTo('shop');
      }
    } else {
      navigateTo('shop');
    }
  };

  if (!isOpen || !activePopup) {
    return null;
  }

  const isHtmlBody = activePopup.body ? /<[a-z][\s\S]*>/i.test(activePopup.body) : false;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div
        className="relative w-full max-w-lg min-h-[400px] sm:min-h-[480px] bg-slate-900 rounded-3xl shadow-2xl overflow-hidden transition-all transform animate-in zoom-in-95 duration-300 flex flex-col justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Image */}
        {activePopup.imageUrl && (
          <div className="absolute inset-0 z-0">
            <SmartImage
              src={activePopup.imageUrl}
              alt={activePopup.title || 'Promotional Offer'}
              fallbackType="banner"
              objectFit="cover"
              priority
              containerClassName="w-full h-full"
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}

        {/* Subtle Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 mix-blend-multiply" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close offer popup"
          className="absolute top-4 right-4 z-30 p-2.5 text-white hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md shadow-xs border border-white/10 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-white/50"
        >
          <X size={18} />
        </button>

        {/* Content Area */}
        <div className="relative z-10 p-6 sm:p-10 text-center flex flex-col items-center justify-end h-full">
          <div className="w-full max-w-sm space-y-5 flex flex-col items-center">
            {/* Badge / Subtitle */}
            {activePopup.title && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
                <Sparkles size={12} className="shrink-0 text-white" />
                <span>{activePopup.title}</span>
              </div>
            )}

            {/* Headline */}
            {activePopup.headline && (
              <h2 id="popup-title" className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                {activePopup.headline}
              </h2>
            )}

            {/* Body Text */}
            {activePopup.body && (
              <div className="text-sm sm:text-base text-white/90 font-medium leading-relaxed drop-shadow-sm max-w-xs mx-auto">
                {isHtmlBody ? (
                  <RichTextRenderer content={activePopup.body} inline />
                ) : (
                  <p>{activePopup.body}</p>
                )}
              </div>
            )}

            {/* Coupon Code Container */}
            {activePopup.couponCode && (
              <div className="w-full p-2 pl-4 pr-2 bg-white/15 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg flex items-center justify-between gap-3 mt-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Tag size={18} className="text-white/80 shrink-0" />
                  <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider truncate select-all">
                    {activePopup.couponCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyCoupon}
                  type="button"
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-gray-100 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Call to Action Button */}
            <div className="w-full pt-1">
              <button
                onClick={handleAction}
                type="button"
                className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-98"
              >
                <span>{activePopup.couponCode ? 'Shop Now' : 'Claim Offer'}</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
