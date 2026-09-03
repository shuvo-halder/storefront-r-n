'use client';

import React, { useEffect, useState } from 'react';
import { X, Tag, Check, Sparkles, ArrowRight } from 'lucide-react';
import { Popup } from '../../types/storefront';
import { storefrontApi } from '../../services/storefrontApi';
import { SmartImage } from './SmartImage';
import { RichTextRenderer } from './RichTextRenderer';
import { useStorefront } from '../../context/StorefrontContext';

interface PromotionalPopupProps {
  pageType?: 'homepage' | 'category' | 'product';
}

export const PromotionalPopup: React.FC<PromotionalPopupProps> = ({
  pageType = 'homepage',
}) => {
  const { navigateTo } = useStorefront();
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    async function loadPopups() {
      try {
        const popups = await storefrontApi.getPopups();
        if (!isMounted || !Array.isArray(popups) || popups.length === 0) {
          return;
        }

        // Filter for popups matching the current pageType (or default to 'homepage')
        const eligible = popups.filter((p) => {
          if (!p || !p.id) return false;
          const pType = (p.type || 'homepage').toLowerCase();
          const targetType = pageType.toLowerCase();
          return pType === targetType;
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
  }, [pageType]);

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
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transition-all transform animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close offer popup"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 text-slate-500 hover:text-slate-900 bg-white/90 hover:bg-white rounded-full backdrop-blur-md shadow-md border border-slate-100 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary/50"
        >
          <X size={18} />
        </button>

        {/* Promotional Image Header */}
        {activePopup.imageUrl && (
          <div className="relative w-full bg-slate-900/5 min-h-[160px] sm:min-h-[200px] max-h-[260px] flex items-center justify-center overflow-hidden">
            <SmartImage
              src={activePopup.imageUrl}
              alt={activePopup.title || 'Promotional Offer'}
              fallbackType="banner"
              fallbackLabel={activePopup.title}
              objectFit="contain"
              priority
              containerClassName="w-full h-full flex items-center justify-center p-4"
              className="max-h-[220px] w-auto h-auto object-contain object-center transition-transform duration-500 hover:scale-102"
            />
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 sm:p-8 text-center space-y-4">
          {/* Badge / Subtitle */}
          {activePopup.title && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20">
              <Sparkles size={12} className="shrink-0" />
              <span>{activePopup.title}</span>
            </div>
          )}

          {/* Headline */}
          {activePopup.headline && (
            <h2 id="popup-title" className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
              {activePopup.headline}
            </h2>
          )}

          {/* Body Text */}
          {activePopup.body && (
            <div className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
              {isHtmlBody ? (
                <RichTextRenderer content={activePopup.body} inline />
              ) : (
                <p>{activePopup.body}</p>
              )}
            </div>
          )}

          {/* Coupon Code Container */}
          {activePopup.couponCode && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-between gap-3 my-4">
              <div className="flex items-center gap-2 pl-2 overflow-hidden">
                <Tag size={18} className="text-primary shrink-0" />
                <span className="font-mono text-base sm:text-lg font-extrabold text-primary tracking-wider truncate select-all">
                  {activePopup.couponCode}
                </span>
              </div>
              <button
                onClick={handleCopyCoupon}
                type="button"
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Call to Action Button */}
          <div className="pt-2">
            <button
              onClick={handleAction}
              type="button"
              className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-98"
            >
              <span>{activePopup.couponCode ? 'Use Coupon & Shop Now' : 'Shop Now'}</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
