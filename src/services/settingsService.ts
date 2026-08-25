import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { PublicSettings } from '../types/storefront';

const DEFAULT_SETTINGS: PublicSettings = {
  branding: {
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#0f172a'
  },
  seo: {
    metaTitle: 'Vyzobd Store',
    metaDescription: 'Quality products, trusted service, and a seamless shopping experience.'
  },
  shipping: {
    freeShippingThreshold: 2000,
    flatRateShippingFee: 60,
    insideDhakaCharge: 60,
    outsideDhakaCharge: 120,
    freeShippingEnabled: true,
    estimatedDeliveryDays: '3-5 business days'
  },
  tax: {
    taxEnabled: true,
    taxRate: 0.10,
    pricesIncludeTax: false
  },
  general: {
    siteName: 'Vyzobd',
    siteTitle: 'Vyzobd Store',
    currency: 'BDT',
    currencySymbol: '৳',
    storePhone: '',
    storeEmail: 'support@vyzobd.com'
  },
  marketing: {
    gtmContainerId: '',
    ga4MeasurementId: '',
    metaPixelId: '',
    googleAdsId: ''
  },
  siteName: 'Vyzobd',
  siteTitle: 'Vyzobd Store',
  logoUrl: '',
  faviconUrl: '',
  currency: 'BDT',
  currencySymbol: '৳',
  freeShippingThreshold: 2000,
  supportEmail: 'support@vyzobd.com',
  supportPhone: ''
};

let cachedSettings: PublicSettings | null = null;
let cachedTimestamp = 0;
let inFlightSettingsPromise: Promise<ApiResponse<PublicSettings>> | null = null;
const CACHE_TTL_MS = 30000; // 30 seconds

export const settingsService = {
  // GET /settings/public
  getPublicSettings: async (bypassCache = false): Promise<ApiResponse<PublicSettings>> => {
    const now = Date.now();
    if (!bypassCache && cachedSettings && (now - cachedTimestamp < CACHE_TTL_MS)) {
      return { status: 'success', message: null, data: cachedSettings };
    }

    if (!bypassCache && inFlightSettingsPromise) {
      return inFlightSettingsPromise;
    }

    const fetchPromise = (async (): Promise<ApiResponse<PublicSettings>> => {
      try {
        const res = await apiClient.get('/settings/public');
        const unwrapped = unwrapApiResponse<any>(res);

        if (unwrapped.status === 'error' || !unwrapped.data) {
          return { status: 'success', message: null, data: DEFAULT_SETTINGS };
        }

        const raw = unwrapped.data;
        const whatsappOrderNumber = 
          raw.store?.whatsappOrderNumber || 
          raw.general?.whatsappOrderNumber || 
          raw.whatsappOrderNumber || 
          '';
        const callOrderNumber = 
          raw.store?.callOrderNumber || 
          raw.general?.callOrderNumber || 
          raw.callOrderNumber || 
          '';

        const storePhone = 
          raw.general?.storePhone || 
          raw.store?.callOrderNumber || 
          raw.callOrderNumber || 
          raw.supportPhone || 
          '+8801710634144';

        const storeEmail = 
          raw.general?.storeEmail || 
          raw.storeEmail || 
          raw.supportEmail || 
          'support@vyzobd.com';

        const siteName = 
          raw.branding?.siteName || 
          raw.general?.siteName || 
          raw.siteName || 
          'Vyzobd';

        const siteTitle = 
          raw.branding?.siteTitle || 
          raw.general?.siteTitle || 
          raw.seo?.metaTitle || 
          raw.siteTitle || 
          'Vyzobd Store';

        const defaultCurrency = 
          raw.branding?.defaultCurrency || 
          raw.general?.currency || 
          raw.currency || 
          'BDT';

        const currencySymbol = 
          raw.general?.currencySymbol || 
          (defaultCurrency === 'USD' ? '$' : '৳');

        const rawSocial = raw.socialLinks || raw.social || raw.socials || raw.store?.socialLinks || raw.store?.social || raw.branding?.socialLinks || raw.general?.socialLinks || {};

        const extractSocialUrl = (...keys: string[]): string | undefined => {
          for (const k of keys) {
            if (rawSocial && typeof rawSocial[k] === 'string' && rawSocial[k].trim()) return rawSocial[k].trim();
            if (raw.store && typeof raw.store[k] === 'string' && raw.store[k].trim()) return raw.store[k].trim();
            if (raw.branding && typeof raw.branding[k] === 'string' && raw.branding[k].trim()) return raw.branding[k].trim();
            if (raw.general && typeof raw.general[k] === 'string' && raw.general[k].trim()) return raw.general[k].trim();
            if (typeof raw[k] === 'string' && raw[k].trim()) return raw[k].trim();
          }
          return undefined;
        };

        const socialLinks = {
          facebook: extractSocialUrl('facebook', 'facebookUrl', 'social_facebook'),
          instagram: extractSocialUrl('instagram', 'instagramUrl', 'social_instagram'),
          youtube: extractSocialUrl('youtube', 'youtubeUrl', 'social_youtube'),
          twitter: extractSocialUrl('twitter', 'twitterUrl', 'x', 'xUrl', 'social_twitter', 'social_x'),
          linkedin: extractSocialUrl('linkedin', 'linkedinUrl', 'social_linkedin'),
          tiktok: extractSocialUrl('tiktok', 'tiktokUrl', 'social_tiktok'),
          whatsapp: extractSocialUrl('whatsapp', 'whatsappUrl', 'social_whatsapp', 'whatsappOrderNumber'),
        };

        const settings: PublicSettings = {
          branding: {
            siteName: raw.branding?.siteName || siteName,
            siteTitle: raw.branding?.siteTitle || siteTitle,
            siteTagline: raw.branding?.siteTagline || null,
            logoUrl: raw.branding?.logoUrl || raw.logoUrl || '',
            logoDarkUrl: raw.branding?.logoDarkUrl || null,
            faviconUrl: raw.branding?.faviconUrl || raw.faviconUrl || '',
            adminPanelName: raw.branding?.adminPanelName || null,
            adminPanelLogo: raw.branding?.adminPanelLogo || null,
            primaryColor: raw.branding?.primaryColor || '#0f172a',
            secondaryColor: raw.branding?.secondaryColor || null,
            footerText: raw.branding?.footerText || null,
            defaultLanguage: raw.branding?.defaultLanguage || 'en',
            defaultCurrency,
            defaultTimezone: raw.branding?.defaultTimezone || 'UTC'
          },
          seo: {
            metaTitle: raw.seo?.metaTitle || raw.metaTitle || siteTitle,
            metaDescription: raw.seo?.metaDescription || raw.metaDescription || '',
            metaKeywords: raw.seo?.metaKeywords || raw.metaKeywords || raw.seo?.keywords || null,
            ogTitle: raw.seo?.ogTitle || raw.ogTitle || null,
            ogDescription: raw.seo?.ogDescription || raw.ogDescription || null,
            ogImage: raw.seo?.ogImage || raw.seo?.ogImageUrl || raw.ogImage || null,
            ogImageUrl: raw.seo?.ogImageUrl || raw.seo?.ogImage || undefined,
            twitterTitle: raw.seo?.twitterTitle || raw.twitterTitle || null,
            twitterDescription: raw.seo?.twitterDescription || raw.twitterDescription || null,
            twitterImage: raw.seo?.twitterImage || raw.twitterImage || null,
            twitterHandle: raw.seo?.twitterHandle || undefined,
            customHeadCode: raw.seo?.customHeadCode || null,
          },
          shipping: {
            freeShippingThreshold: Number(
              raw.shipping?.freeShippingThreshold ?? 
              raw.freeShippingThreshold ?? 
              raw.shippingSettings?.freeShippingThreshold ?? 
              raw.deliverySettings?.freeShippingThreshold ??
              3000
            ),
            insideDhakaCharge: Number(
              raw.shipping?.insideDhakaCharge ??
              raw.insideDhakaCharge ??
              raw.shippingSettings?.insideDhakaCharge ??
              60
            ),
            outsideDhakaCharge: Number(
              raw.shipping?.outsideDhakaCharge ??
              raw.outsideDhakaCharge ??
              raw.shippingSettings?.outsideDhakaCharge ??
              120
            ),
            flatRateShippingFee: Number(
              raw.shipping?.flatRateShippingFee ?? 
              raw.flatRateShippingFee ?? 
              raw.shippingFee ?? 
              raw.deliveryFee ?? 
              raw.shippingCost ?? 
              raw.deliveryCost ?? 
              raw.shippingSettings?.flatRateShippingFee ?? 
              60
            ),
            freeShippingEnabled: Boolean(
              raw.shipping?.freeShippingEnabled ??
              raw.freeShippingEnabled ??
              raw.shippingSettings?.freeShippingEnabled ??
              true
            ),
            estimatedDeliveryDays: 
              raw.shipping?.estimatedDeliveryDays || 
              raw.estimatedDeliveryDays || 
              raw.shippingSettings?.estimatedDeliveryDays || 
              '3-5 business days',
            currency: raw.shipping?.currency || defaultCurrency
          },
          tax: {
            taxEnabled: Boolean(raw.tax?.taxEnabled ?? raw.tax?.enableTax ?? true),
            taxRate: Number(raw.tax?.taxRate ?? raw.tax?.defaultTaxRate ?? 0),
            defaultTaxRate: Number(raw.tax?.defaultTaxRate ?? raw.tax?.taxRate ?? 0),
            pricesIncludeTax: Boolean(raw.tax?.pricesIncludeTax ?? false),
            enableTax: Boolean(raw.tax?.enableTax ?? raw.tax?.taxEnabled ?? true)
          },
          general: {
            siteName,
            siteTitle,
            currency: defaultCurrency,
            currencySymbol,
            storePhone,
            storeEmail,
            storeAddress: raw.general?.storeAddress || raw.storeAddress || '',
            whatsappOrderNumber: whatsappOrderNumber || undefined,
            callOrderNumber: callOrderNumber || undefined
          },
          store: {
            whatsappOrderNumber: whatsappOrderNumber || undefined,
            callOrderNumber: callOrderNumber || undefined
          },
          whatsappOrderNumber: whatsappOrderNumber || undefined,
          callOrderNumber: callOrderNumber || undefined,
          marketing: {
            gtmContainerId: raw.analytics?.gtmContainerId || raw.analytics?.googleTagManagerId || raw.marketing?.gtmContainerId || raw.marketing?.gtmId || raw.gtmId || raw.gtmContainerId || '',
            gtmId: raw.analytics?.gtmContainerId || raw.analytics?.googleTagManagerId || raw.marketing?.gtmId || raw.marketing?.gtmContainerId || raw.gtmId || raw.gtmContainerId || '',
            ga4MeasurementId: raw.analytics?.ga4MeasurementId || raw.analytics?.googleAnalyticsId || raw.marketing?.ga4MeasurementId || raw.marketing?.ga4Id || raw.ga4MeasurementId || raw.ga4Id || '',
            ga4Id: raw.analytics?.ga4MeasurementId || raw.analytics?.googleAnalyticsId || raw.marketing?.ga4Id || raw.marketing?.ga4MeasurementId || raw.ga4Id || raw.ga4MeasurementId || '',
            metaPixelId: raw.analytics?.metaPixelId || raw.analytics?.facebookPixelId || raw.marketing?.metaPixelId || raw.marketing?.pixelId || raw.metaPixelId || raw.pixelId || '',
            pixelId: raw.analytics?.metaPixelId || raw.analytics?.facebookPixelId || raw.marketing?.pixelId || raw.marketing?.metaPixelId || raw.pixelId || raw.metaPixelId || '',
            googleAdsId: raw.analytics?.googleAdsId || raw.marketing?.googleAdsId || raw.marketing?.adsId || raw.googleAdsId || raw.adsId || '',
            adsId: raw.analytics?.googleAdsId || raw.marketing?.adsId || raw.marketing?.googleAdsId || raw.adsId || raw.googleAdsId || ''
          },
          siteName,
          siteTitle,
          logoUrl: raw.branding?.logoUrl || raw.logoUrl || '',
          faviconUrl: raw.branding?.faviconUrl || raw.faviconUrl || '',
          currency: defaultCurrency,
          currencySymbol,
          freeShippingThreshold: Number(
            raw.shipping?.freeShippingThreshold ?? 
            raw.freeShippingThreshold ?? 
            raw.shippingSettings?.freeShippingThreshold ?? 
            3000
          ),
          supportEmail: storeEmail,
          supportPhone: storePhone,
          socialLinks
        };

        cachedSettings = settings;
        cachedTimestamp = Date.now();
        return { status: 'success', message: null, data: settings };
      } catch {
        return {
          status: 'success', message: null, data: DEFAULT_SETTINGS
        };
      } finally {
        inFlightSettingsPromise = null;
      }
    })();

    inFlightSettingsPromise = fetchPromise;
    return fetchPromise;
  }
};

