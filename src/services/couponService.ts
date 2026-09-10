import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { Coupon } from '../types/storefront';

export const couponService = {
  /**
   * GET /coupons
   * Fetches active storefront coupons available for customers
   */
  getCoupons: async (): Promise<ApiResponse<Coupon[]>> => {
    try {
      const res = await apiClient.get('/coupons');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch coupons',
          errors: unwrapped.errors,
          data: []
        };
      }

      const rawList = Array.isArray(unwrapped.data) ? unwrapped.data : [];
      const coupons: Coupon[] = rawList.map((item: any) => ({
        id: item.id ? String(item.id) : undefined,
        code: String(item.code || '').toUpperCase(),
        discountType: item.discountType,
        discountValue: item.discountValue !== undefined ? Number(item.discountValue) : undefined,
        discountPercent: item.discountType === 'percentage' ? Number(item.discountValue) : undefined,
        discountAmount: item.discountType === 'fixed' ? Number(item.discountValue) : undefined,
        minOrderAmount: item.minOrderAmount !== undefined ? Number(item.minOrderAmount) : undefined,
        minSubtotal: item.minOrderAmount !== undefined ? Number(item.minOrderAmount) : (item.minSubtotal !== undefined ? Number(item.minSubtotal) : undefined),
        validUntil: item.validUntil ? String(item.validUntil) : undefined,
        description: item.description || (item.discountValue ? `${item.discountValue}${item.discountType === 'percentage' ? '%' : ' BDT'} OFF${item.minOrderAmount ? ` on orders over BDT ${item.minOrderAmount}` : ''}` : 'Special promotional discount')
      }));

      return { status: 'success', message: unwrapped.message || null, data: coupons };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch coupons');
      return {
        status: 'error', message, errors, data: []
      };
    }
  }
};
