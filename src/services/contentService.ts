import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { Banner, BlogArticle, CMSPage } from '../types/storefront';

export const contentService = {
  // GET /banners
  getBanners: async (type?: 'hero' | 'promo' | 'offer'): Promise<ApiResult<Banner[]>> => {
    try {
      const res = await apiClient.get('/banners', { params: { type } });
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success) {
        return { success: false, data: [], error: unwrapped.error };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : [];
      return { success: true, data: list, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch banners' }
      };
    }
  },

  // GET /popups
  getPopups: async (): Promise<ApiResult<any[]>> => {
    try {
      const res = await apiClient.get('/popups');
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success) {
        return { success: false, data: [], error: unwrapped.error };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : [];
      return { success: true, data: list, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch popups' }
      };
    }
  },

  // GET /faqs
  getFAQs: async (): Promise<ApiResult<any[]>> => {
    try {
      const res = await apiClient.get('/faqs');
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success) {
        return { success: false, data: [], error: unwrapped.error };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : [];
      return { success: true, data: list, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch FAQs' }
      };
    }
  },

  // GET /blog
  getBlogPosts: async (): Promise<ApiResult<BlogArticle[]>> => {
    try {
      const res = await apiClient.get('/blog');
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success) {
        return { success: false, data: [], error: unwrapped.error };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : [];
      return { success: true, data: list, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch blog posts' }
      };
    }
  },

  // GET /blog/:slug
  getBlogPostBySlug: async (slug: string): Promise<ApiResult<BlogArticle>> => {
    try {
      const res = await apiClient.get(`/blog/${encodeURIComponent(slug)}`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return { success: false, data: null, error: unwrapped.error || { message: 'Blog article not found' } };
      }

      return { success: true, data: unwrapped.data, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { message: err.response?.data?.message || err.message || `Failed to fetch blog post '${slug}'` }
      };
    }
  },

  // GET /pages/:slug
  getPageBySlug: async (slug: string): Promise<ApiResult<CMSPage>> => {
    try {
      const res = await apiClient.get(`/pages/${encodeURIComponent(slug)}`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return { success: false, data: null, error: unwrapped.error || { message: 'Page not found' } };
      }

      return { success: true, data: unwrapped.data, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { message: err.response?.data?.message || err.message || `Failed to fetch page '${slug}'` }
      };
    }
  }
};
