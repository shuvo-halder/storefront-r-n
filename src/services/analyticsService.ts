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
          ga4MeasurementId: String(raw.ga4MeasurementId || raw.ga4Id || raw.googleAnalyticsId || '').trim(),
          gtmContainerId: String(raw.gtmContainerId || raw.gtmId || raw.googleTagManagerId || '').trim(),
          metaPixelId: String(raw.metaPixelId || raw.pixelId || raw.facebookPixelId || '').trim(),
          googleAdsId: String(raw.googleAdsId || raw.adsId || '').trim(),
          googleAdsConversionId: String(raw.googleAdsConversionId || '').trim(),
          googleAdsConversionLabel: String(raw.googleAdsConversionLabel || '').trim(),
          tiktokPixelId: String(raw.tiktokPixelId || '').trim(),
          hotjarId: String(raw.hotjarId || '').trim(),
          enableAnalytics: raw.enableAnalytics !== undefined ? Boolean(raw.enableAnalytics) : true,
        };
        return {
          status: 'success',
          message: null,
          data: config,
        };
      }
      return {
        status: 'success',
        message: null,
        data: DEFAULT_ANALYTICS_CONFIG,
      };
    } catch (err: any) {
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
};
