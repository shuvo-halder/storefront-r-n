import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { Category } from '../types/storefront';

export function normalizeCategory(raw: any): Category {
  if (!raw) {
    return {
      id: '',
      slug: '',
      name: 'Category',
      description: '',
      image: '',
      itemCount: 0
    };
  }
  return {
    id: String(raw.id || raw._id || ''),
    slug: String(raw.slug || raw.id || ''),
    name: String(raw.name || 'Category'),
    description: String(raw.description || ''),
    image: String(raw.image || raw.imageUrl || raw.thumbnail || ''),
    itemCount: Number(raw.itemCount ?? raw.productCount ?? raw.count ?? 0),
    iconName: raw.icon || raw.iconName || undefined,
    subcategories: Array.isArray(raw.children) ? raw.children.map((child: any) => ({
      id: String(child.id || child.slug || ''),
      name: String(child.name || ''),
      slug: String(child.slug || child.id || '')
    })) : (Array.isArray(raw.subcategories) ? raw.subcategories : [])
  };
}

export const categoryService = {
  // GET /categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const res = await apiClient.get('/categories');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'error', message: unwrapped.message || 'Failed to fetch categories', data: [] };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.categories || []);
      const categories = list.map(normalizeCategory);
      return { status: 'success', message: null, data: categories };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch categories');
      return {
        status: 'error', message, errors, data: []
      };
    }
  }
};

