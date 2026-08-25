'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { storefrontApi } from '../services/storefrontApi';
import { 
  getGA4Id, 
  getGTMId, 
  getMetaPixelId, 
  getGoogleAdsId, 
  getGoogleAdsConversionId,
  getGoogleAdsConversionLabel,
  getTikTokPixelId,
  getHotjarId,
  pushToDataLayer, 
  trackMetaEvent,
  trackTikTokPageView
} from '../utils/analytics';

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
    trackMetaEvent('PageView');
    
    // Track TikTok PageView
    trackTikTokPageView();
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
  const tiktokPixelId = isEnabled ? getTikTokPixelId(analyticsConfig) : '';
  const hotjarId = isEnabled ? getHotjarId(analyticsConfig) : '';
  
  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <>
      {/* SPA Route Navigation Tracker */}
      <Suspense fallback={null}>
        <AnalyticsRouteTracker />
      </Suspense>

      {/* Hotjar */}
      {hotjarId && (
        <Script
          id="hotjar-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:${hotjarId},hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      )}

      {/* TikTok Pixel */}
      {tiktokPixelId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${tiktokPixelId}');
                if (window.ttq && window.ttq.length > 0) {
                  for (var i = 0; i < window.ttq.length; i++) {
                    ttq.push(window.ttq[i]);
                  }
                }
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

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
                if (window._meta_q) {
                  for (var i = 0; i < window._meta_q.length; i++) {
                    fbq.apply(null, window._meta_q[i]);
                  }
                  window._meta_q = [];
                }
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
