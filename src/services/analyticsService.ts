import { apiClient } from './apiClient';
import { ApiResponse } from '../lib/api';
import { AnalyticsConfig } from '../types/storefront';

const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  ga4MeasurementId: '',
  gtmContainerId: '',
  metaPixelId: '',
  googleAdsId: '',
  googleAdsConversionId: '',
  googleAdsConversionLabel: '',
  tiktokPixelId: '',
  hotjarId: '',
  enableAnalytics: false,
};

let cachedConfig: AnalyticsConfig = DEFAULT_ANALYTICS_CONFIG;

export const analyticsService = {
  /**
   * GET /api/storefront/v1/analytics/config
   * Reads dynamic marketing and analytics IDs from backend.
   * Fails gracefully without throwing or breaking client-side execution.
   */
  getAnalyticsConfig: async (): Promise<ApiResponse<AnalyticsConfig>> => {
    try {
      const res = await apiClient.get('/analytics/config');
      if (res.data && res.data.data) {
        const raw = res.data.data;
        const config: AnalyticsConfig = {
          ga4MeasurementId: String(raw.ga4MeasurementId || raw.googleAnalyticsId || raw.ga4Id || '').trim(),
          gtmContainerId: String(raw.gtmContainerId || raw.googleTagManagerId || raw.gtmId || '').trim(),
          metaPixelId: String(raw.metaPixelId || raw.facebookPixelId || raw.pixelId || '').trim(),
          googleAdsId: String(raw.googleAdsId || raw.googleAdsConversionId || raw.adsId || '').trim(),
          googleAdsConversionId: String(raw.googleAdsConversionId || raw.googleAdsId || raw.adsId || '').trim(),
          googleAdsConversionLabel: String(raw.googleAdsConversionLabel || '').trim(),
          tiktokPixelId: String(raw.tiktokPixelId || '').trim(),
          hotjarId: String(raw.hotjarId || '').trim(),
          enableAnalytics: raw.enableAnalytics !== undefined ? Boolean(raw.enableAnalytics) : true,
        };
        cachedConfig = config;
        return {
          status: 'success',
          message: null,
          data: config,
        };
      }
      cachedConfig = DEFAULT_ANALYTICS_CONFIG;
      return {
        status: 'success',
        message: null,
        data: DEFAULT_ANALYTICS_CONFIG,
      };
    } catch (err: any) {
      cachedConfig = DEFAULT_ANALYTICS_CONFIG;
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Analytics Service] Failed to fetch analytics config:', err?.message || err);
      }
      return {
        status: 'error',
        message: err?.message || 'Failed to fetch analytics config',
        data: DEFAULT_ANALYTICS_CONFIG,
      };
    }
  },

  getCachedConfig: (): AnalyticsConfig => {
    return cachedConfig;
  },

  setCachedConfig: (config: AnalyticsConfig) => {
    if (config) {
      cachedConfig = { ...cachedConfig, ...config };
    }
  },

  isAnalyticsEnabled: (): boolean => {
    return Boolean(cachedConfig.enableAnalytics);
  },
};

