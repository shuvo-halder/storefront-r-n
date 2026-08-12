import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { PublicSettings } from '../types/storefront';

export const settingsService = {
  // GET /settings/public
  getPublicSettings: async (): Promise<ApiResult<PublicSettings>> => {
    try {
      const res = await apiClient.get('/settings/public');
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        // Safe default fallback shape for settings if endpoint is empty
        const defaultSettings: PublicSettings = {
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
        return { success: true, data: defaultSettings, error: null };
      }

      const raw = unwrapped.data;
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
          storeAddress: raw.general?.storeAddress
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

      return { success: true, data: settings, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch public settings' }
      };
    }
  }
};
