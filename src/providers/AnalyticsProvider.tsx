'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { storefrontApi } from '../services/storefrontApi';
import { getGA4Id, getGTMId, getMetaPixelId, getGoogleAdsId, pushToDataLayer } from '../utils/analytics';

/**
 * Route Tracker for SPA transitions in Next.js App Router
 * Safely guards against React StrictMode duplicate pageviews
 */
function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrlRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const queryStr = searchParams?.toString();
    const currentUrl = `${pathname || '/'}${queryStr ? `?${queryStr}` : ''}`;

    // Prevent duplicate pageview tracking for the same URL (e.g. Strict Mode remounts)
    if (lastTrackedUrlRef.current === currentUrl) {
      return;
    }
    lastTrackedUrlRef.current = currentUrl;

    const pageLocation = window.location.href;
    const pageTitle = typeof document !== 'undefined' ? document.title : '';

    // Push standard page_view to dataLayer and standalone GA4 gtag
    pushToDataLayer({
      event: 'page_view',
      page_location: pageLocation,
      page_path: currentUrl,
      page_title: pageTitle,
    });

    // Track Meta Pixel PageView on SPA route change
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider({ children }: { children?: React.ReactNode }) {
  // Query backend analytics config with 1 hour staleTime
  const { data: analyticsConfig, isLoading } = useQuery({
    queryKey: ['analytics_config'],
    queryFn: storefrontApi.getAnalyticsConfig,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // If analytics config explicitly disables analytics, render nothing
  const isEnabled = analyticsConfig ? analyticsConfig.enableAnalytics : true;

  // Resolve IDs with priority: Backend Config API > Environment Fallback > empty string
  const gtmId = isEnabled ? getGTMId(analyticsConfig) : '';
  const gaId = isEnabled ? getGA4Id(analyticsConfig) : '';
  const metaPixelId = isEnabled ? getMetaPixelId(analyticsConfig) : '';
  const googleAdsId = isEnabled ? getGoogleAdsId(analyticsConfig) : '';

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <>
      {/* SPA Route Navigation Tracker */}
      <Suspense fallback={null}>
        <AnalyticsRouteTracker />
      </Suspense>

      {/* 1. Google Tag Manager (GTM) */}
      {gtmId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* 2. Standalone Google Analytics 4 (GA4) - Loaded ONLY when GTM is absent */}
      {gaId && !gtmId && (
        <>
          <Script
            id="ga4-script"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  send_page_view: false
                });
              `,
            }}
          />
        </>
      )}

      {/* 3. Google Ads (AW-XXXXX) Base Config - Standalone when GTM is absent */}
      {googleAdsId && !gtmId && (
        <>
          {!gaId && (
            <Script
              id="google-ads-script"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            />
          )}
          <Script
            id="google-ads-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('config', '${googleAdsId}');
              `,
            }}
          />
        </>
      )}

      {/* 4. Meta Pixel (fbq) */}
      {metaPixelId && (
        <>
          <Script
            id="meta-pixel-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {children}
    </>
  );
}
export default AnalyticsProvider;
