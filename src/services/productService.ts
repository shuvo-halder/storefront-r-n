import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { Product, ProductFilterState } from '../types/storefront';

export function normalizeProduct(raw: any): Product {
  if (!raw) {
    return {
      id: '',
      slug: '',
      name: '',
      brand: '',
      category: '',
      categoryId: '',
      price: 0,
      rating: 5,
      reviewCount: 0,
      images: [],
      description: '',
      features: [],
      specifications: [],
      stock: 0
    };
  }

  const categoryName = typeof raw.category === 'string' ? raw.category : (raw.category?.name || '');
  const categoryId = typeof raw.category === 'object' ? raw.category?.id || '' : (raw.categoryId || '');
  const brandName = typeof raw.brand === 'string' ? raw.brand : (raw.brand?.name || '');
  const brandId = typeof raw.brand === 'object' ? raw.brand?.id || '' : (raw.brandId || '');

  const rawImages = Array.isArray(raw.images) && raw.images.length > 0
    ? raw.images.map((img: any) => typeof img === 'string' ? img : (img.url || img.src || ''))
    : (raw.imageUrl || raw.primaryImage?.url || raw.thumbnail ? [raw.imageUrl || raw.primaryImage?.url || raw.thumbnail] : []);

  return {
    id: String(raw.id || raw._id || ''),
    slug: String(raw.slug || raw.id || ''),
    name: String(raw.name || 'Untitled Product'),
    subtitle: raw.subtitle || raw.shortDescription || undefined,
    brand: brandName,
    brandId: brandId || undefined,
    category: categoryName,
    categoryId: categoryId,
    price: Number(raw.price ?? 0),
    compareAtPrice: raw.compareAtPrice ? Number(raw.compareAtPrice) : undefined,
    discountPercent: raw.discountPercent ? Number(raw.discountPercent) : undefined,
    rating: Number(raw.rating ?? 5),
    reviewCount: Number(raw.reviewCount ?? 0),
    images: rawImages.filter(Boolean),
    description: String(raw.description || raw.shortDescription || ''),
    features: Array.isArray(raw.features) ? raw.features : [],
    specifications: Array.isArray(raw.specifications) ? raw.specifications : [],
    stock: Number(raw.stock ?? (raw.inStock ? 10 : 0)),
    isNew: Boolean(raw.isNew),
    isFeatured: Boolean(raw.isFeatured),
    isBestSeller: Boolean(raw.isBestSeller),
    isDealOfDay: Boolean(raw.isDealOfDay),
    dealEndTime: raw.dealEndTime || undefined,
    variants: Array.isArray(raw.variants) ? raw.variants.map((v: any) => ({
      id: String(v.id || v.sku || ''),
      name: v.name || v.sku || 'Variant',
      sku: v.sku || '',
      price: Number(v.price ?? raw.price ?? 0),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      stock: Number(v.stock ?? 10),
      image: v.image || undefined,
      colorHex: v.colorHex || undefined
    })) : [],
    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    tags: Array.isArray(raw.tags) ? raw.tags : []
  };
}

export const productService = {
  // GET /products
  getProducts: async (filters?: Partial<ProductFilterState>): Promise<ApiResult<{ products: Product[]; total: number }>> => {
    try {
      const params: Record<string, any> = {};
      if (filters) {
        if (filters.searchQuery) params.q = filters.searchQuery;
        if (filters.categorySlug) params.category = filters.categorySlug;
        if (filters.brandSlugs && filters.brandSlugs.length > 0) params.brand = filters.brandSlugs.join(',');
        if (filters.minPrice !== undefined && filters.minPrice > 0) params.minPrice = filters.minPrice;
        if (filters.maxPrice !== undefined && filters.maxPrice < 100000) params.maxPrice = filters.maxPrice;
        if (filters.ratingMin !== undefined && filters.ratingMin > 0) params.minRating = filters.ratingMin;
        if (filters.inStockOnly) params.inStock = true;
        if (filters.sortBy) params.sort = filters.sortBy;
        if (filters.page) params.page = filters.page;
        if (filters.pageSize) params.limit = filters.pageSize;
      }

      const res = await apiClient.get('/products', { params });
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success) {
        return { success: false, data: { products: [], total: 0 }, error: unwrapped.error };
      }

      let rawList: any[] = [];
      let totalCount = 0;

      if (Array.isArray(unwrapped.data)) {
        rawList = unwrapped.data;
        totalCount = unwrapped.meta?.total || rawList.length;
      } else if (unwrapped.data && Array.isArray(unwrapped.data.products)) {
        rawList = unwrapped.data.products;
        totalCount = unwrapped.data.total ?? unwrapped.meta?.total ?? rawList.length;
      }

      const products = rawList.map(normalizeProduct);
      return {
        success: true,
        data: { products, total: totalCount },
        error: null,
        meta: unwrapped.meta
      };
    } catch (err: any) {
      return {
        success: false,
        data: { products: [], total: 0 },
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch products' }
      };
    }
  },

  // GET /products/:slug
  getProductBySlug: async (slug: string): Promise<ApiResult<Product>> => {
    try {
      const res = await apiClient.get(`/products/${encodeURIComponent(slug)}`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return { success: false, data: null, error: unwrapped.error || { message: 'Product not found' } };
      }

      const product = normalizeProduct(unwrapped.data);
      return { success: true, data: product, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { message: err.response?.data?.message || err.message || `Failed to fetch product '${slug}'` }
      };
    }
  }
};
