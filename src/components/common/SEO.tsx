'use client';

import React, { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  structuredData?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  structuredData
}) => {
  const { seo, general, branding } = useSettings();

  const siteName = general?.siteName || 'Vyzobd';
  const fullTitle = title ? `${title} | ${siteName}` : (seo?.metaTitle || general?.siteTitle || siteName);
  const metaDescription = description || seo?.metaDescription || '';
  const metaImage = ogImage || seo?.ogImageUrl || branding?.logoUrl || '';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update document title
    if (fullTitle) {
      document.title = fullTitle;
    }

    // Helper to update or create meta tag
    const setMetaTag = (nameAttr: 'name' | 'property', nameValue: string, content: string) => {
      if (!content) return;
      let element = document.querySelector(`meta[${nameAttr}="${nameValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, nameValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', metaDescription);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDescription);
    if (metaImage) setMetaTag('property', 'og:image', metaImage);
    setMetaTag('property', 'og:site_name', siteName);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', metaDescription);
    if (metaImage) setMetaTag('name', 'twitter:image', metaImage);

    // Update canonical link
    if (canonical || window.location.href) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical || window.location.href);
    }

    // Inject structured data
    if (structuredData) {
      let scriptTag = document.getElementById('json-ld-structured-data');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'json-ld-structured-data';
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    }
  }, [fullTitle, metaDescription, metaImage, siteName, ogType, noindex, canonical, structuredData]);

  return null;
};

