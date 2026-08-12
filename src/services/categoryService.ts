import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { Category } from '../types/storefront';

export function normalizeCategory(raw: any): Category {
  return {
    id: String(raw.id || raw._id || ''),
    slug: String(raw.slug || raw.id || ''),
    name: String(raw.name || 'Category'),
    description: String(raw.description || ''),
    image: String(raw.image || raw.imageUrl || ''),
    itemCount: Number(raw.itemCount ?? raw.productCount ?? 0),
    iconName: raw.icon || raw.iconName || undefined,
    subcategories: Array.isArray(raw.children) ? raw.children.map((child: any) => ({
      id: String(child.id || ''),
      name: String(child.name || ''),
      slug: String(child.slug || '')
    })) : (Array.isArray(raw.subcategories) ? raw.subcategories : [])
  };
}

export const categoryService = {
  // GET /categories
  getCategories: async (): Promise<ApiResult<Category[]>> => {
    try {
      const res = await apiClient.get('/categories');
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success) {
        return { success: false, data: [], error: unwrapped.error };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : [];
      const categories = list.map(normalizeCategory);
      return { success: true, data: categories, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch categories' }
      };
    }
  }
};
