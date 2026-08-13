import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { Brand } from '../types/storefront';

export function normalizeBrand(raw: any): Brand {
  if (!raw) {
    return {
      id: '',
      slug: '',
      name: 'Brand',
      logo: ''
    };
  }
  return {
    id: String(raw.id || raw._id || ''),
    slug: String(raw.slug || raw.id || ''),
    name: String(raw.name || 'Brand'),
    logo: String(raw.logo || raw.logoUrl || raw.image || ''),
    description: raw.description || undefined,
    featuredProductCount: raw.featuredProductCount ? Number(raw.featuredProductCount) : undefined,
    itemCount: raw.itemCount ? Number(raw.itemCount) : undefined
  };
}

export const brandService = {
  // GET /brands
  getBrands: async (): Promise<ApiResponse<Brand[]>> => {
    try {
      const res = await apiClient.get('/brands');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'error', message: unwrapped.message || 'Failed to fetch brands', data: [] };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.brands || []);
      const brands = list.map(normalizeBrand);
      return { status: 'success', message: null, data: brands };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch brands');
      return {
        status: 'error', message, errors, data: []
      };
    }
  }
};

