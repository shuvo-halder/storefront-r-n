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
    metaDescription: 'Modern Hardware & E-commerce Storefront'
  },
  shipping: {
    freeShippingThreshold: 100,
    flatRateShippingFee: 15,
    estimatedDeliveryDays: '3-5 business days'
  },
  tax: {
    taxEnabled: true,
    taxRate: 0.05,
    pricesIncludeTax: false
  },
  general: {
    siteName: 'Vyzobd',
    siteTitle: 'Vyzobd Store',
    currency: 'USD',
    currencySymbol: '$',
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
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 100,
  supportEmail: 'support@vyzobd.com',
  supportPhone: ''
};

export const settingsService = {
  // GET /settings/public
  getPublicSettings: async (): Promise<ApiResponse<PublicSettings>> => {
    try {
      const res = await apiClient.get('/settings/public');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'success', message: null, data: DEFAULT_SETTINGS };
      }

      const raw = unwrapped.data;
      const whatsappOrderNumber = raw.store?.whatsappOrderNumber || raw.general?.whatsappOrderNumber || raw.whatsappOrderNumber || '';
      const callOrderNumber = raw.store?.callOrderNumber || raw.general?.callOrderNumber || raw.callOrderNumber || '';

      const settings: PublicSettings = {
        branding: {
          logoUrl: raw.branding?.logoUrl || raw.logoUrl || '',
          logoDarkUrl: raw.branding?.logoDarkUrl,
          faviconUrl: raw.branding?.faviconUrl || raw.faviconUrl || '',
          primaryColor: raw.branding?.primaryColor || '#0f172a',
          secondaryColor: raw.branding?.secondaryColor
        },
        seo: {
          metaTitle: raw.seo?.metaTitle || raw.metaTitle || 'Vyzobd Store',
          metaDescription: raw.seo?.metaDescription || raw.metaDescription || '',
          ogImageUrl: raw.seo?.ogImageUrl,
          twitterHandle: raw.seo?.twitterHandle
        },
        shipping: {
          freeShippingThreshold: Number(raw.shipping?.freeShippingThreshold ?? raw.freeShippingThreshold ?? 100),
          flatRateShippingFee: Number(raw.shipping?.flatRateShippingFee ?? raw.flatRateShippingFee ?? 15),
          estimatedDeliveryDays: raw.shipping?.estimatedDeliveryDays || '3-5 business days'
        },
        tax: {
          taxEnabled: Boolean(raw.tax?.taxEnabled ?? true),
          taxRate: Number(raw.tax?.taxRate ?? 0.05),
          pricesIncludeTax: Boolean(raw.tax?.pricesIncludeTax ?? false)
        },
        general: {
          siteName: raw.general?.siteName || raw.branding?.siteName || raw.siteName || 'Vyzobd',
          siteTitle: raw.general?.siteTitle || raw.branding?.siteTitle || raw.siteTitle || 'Vyzobd Store',
          currency: raw.general?.currency || raw.branding?.defaultCurrency || raw.currency || 'USD',
          currencySymbol: raw.general?.currencySymbol || (raw.general?.currency === 'BDT' ? '৳' : '$'),
          storePhone: raw.general?.storePhone || raw.supportPhone || '',
          storeEmail: raw.general?.storeEmail || raw.supportEmail || 'support@vyzobd.com',
          storeAddress: raw.general?.storeAddress,
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
          gtmContainerId: raw.marketing?.gtmContainerId || raw.marketing?.gtmId || raw.gtmId || raw.gtmContainerId || '',
          gtmId: raw.marketing?.gtmId || raw.marketing?.gtmContainerId || raw.gtmId || raw.gtmContainerId || '',
          ga4MeasurementId: raw.marketing?.ga4MeasurementId || raw.marketing?.ga4Id || raw.ga4MeasurementId || raw.ga4Id || '',
          ga4Id: raw.marketing?.ga4Id || raw.marketing?.ga4MeasurementId || raw.ga4Id || raw.ga4MeasurementId || '',
          metaPixelId: raw.marketing?.metaPixelId || raw.marketing?.pixelId || raw.metaPixelId || raw.pixelId || '',
          pixelId: raw.marketing?.pixelId || raw.marketing?.metaPixelId || raw.pixelId || raw.metaPixelId || '',
          googleAdsId: raw.marketing?.googleAdsId || raw.marketing?.adsId || raw.googleAdsId || raw.adsId || '',
          adsId: raw.marketing?.adsId || raw.marketing?.googleAdsId || raw.adsId || raw.googleAdsId || ''
        },
        siteName: raw.branding?.siteName || raw.siteName || 'Vyzobd',
        siteTitle: raw.branding?.siteTitle || raw.siteTitle || 'Vyzobd Store',
        logoUrl: raw.branding?.logoUrl || raw.logoUrl || '',
        faviconUrl: raw.branding?.faviconUrl || raw.faviconUrl || '',
        currency: raw.branding?.defaultCurrency || raw.currency || 'USD',
        currencySymbol: raw.general?.currencySymbol || '$',
        freeShippingThreshold: Number(raw.shipping?.freeShippingThreshold ?? 100),
        supportEmail: raw.general?.storeEmail || raw.supportEmail || 'support@vyzobd.com',
        supportPhone: raw.general?.storePhone || raw.supportPhone || ''
      };

      return { status: 'success', message: null, data: settings };
    } catch {
      return {
        status: 'success', message: null, data: DEFAULT_SETTINGS
      };
    }
  }
};

