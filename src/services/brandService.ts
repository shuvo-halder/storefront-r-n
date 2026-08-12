import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { Brand } from '../types/storefront';

export function normalizeBrand(raw: any): Brand {
  return {
    id: String(raw.id || raw._id || ''),
    slug: String(raw.slug || raw.id || ''),
    name: String(raw.name || 'Brand'),
    logo: String(raw.logo || raw.logoUrl || ''),
    description: raw.description || undefined,
    featuredProductCount: raw.featuredProductCount ? Number(raw.featuredProductCount) : undefined,
    itemCount: raw.itemCount ? Number(raw.itemCount) : undefined
  };
}

export const brandService = {
  // GET /brands
  getBrands: async (): Promise<ApiResult<Brand[]>> => {
    try {
      const res = await apiClient.get('/brands');
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success) {
        return { success: false, data: [], error: unwrapped.error };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : [];
      const brands = list.map(normalizeBrand);
      return { success: true, data: brands, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch brands' }
      };
    }
  }
};
