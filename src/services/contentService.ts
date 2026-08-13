import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { Banner, BlogArticle, CMSPage } from '../types/storefront';

export const contentService = {
  // GET /banners
  getBanners: async (type?: 'hero' | 'promo' | 'offer'): Promise<ApiResponse<Banner[]>> => {
    try {
      const res = await apiClient.get('/banners', { params: { type } });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'success', message: null, data: [] };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.banners || []);
      return { status: 'success', message: null, data: list };
    } catch {
      return { status: 'success', message: null, data: [] };
    }
  },

  // GET /popups
  getPopups: async (): Promise<ApiResponse<any[]>> => {
    try {
      const res = await apiClient.get('/popups');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'success', message: null, data: [] };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.popups || []);
      return { status: 'success', message: null, data: list };
    } catch {
      return { status: 'success', message: null, data: [] };
    }
  },

  // GET /faqs
  getFAQs: async (): Promise<ApiResponse<any[]>> => {
    try {
      const res = await apiClient.get('/faqs');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'success', message: null, data: [] };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.faqs || []);
      return { status: 'success', message: null, data: list };
    } catch {
      return { status: 'success', message: null, data: [] };
    }
  },

  // Helper: Normalize raw blog article
  normalizeBlogArticle(raw: any): BlogArticle | null {
    if (!raw) return null;
    const coverImage = raw.coverImage || raw.featuredImage?.secureUrl || raw.featuredImage?.url || raw.image || '/placeholder-blog.png';
    const authorName = typeof raw.author === 'string' ? raw.author : (raw.author?.fullName || raw.author?.name || 'Vyzobd Editorial');
    const catName = typeof raw.category === 'string' ? raw.category : (raw.category?.name || 'Journal');

    let publishedDate = 'Recent';
    if (raw.date) {
      publishedDate = raw.date;
    } else if (raw.publishedAt || raw.createdAt) {
      try {
        publishedDate = new Date(raw.publishedAt || raw.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      } catch {
        publishedDate = 'Recent';
      }
    }

    const words = (raw.content || raw.excerpt || '').split(/\s+/).length;
    const readTime = raw.readTime || `${Math.max(1, Math.ceil(words / 200))} min read`;

    return {
      id: String(raw.id || raw.slug || ''),
      slug: String(raw.slug || ''),
      title: raw.title || 'Untitled Article',
      excerpt: raw.excerpt || raw.description || '',
      content: raw.content || raw.body || '',
      coverImage,
      author: authorName,
      date: publishedDate,
      readTime,
      category: catName,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      relatedArticleSlugs: Array.isArray(raw.relatedArticleSlugs) ? raw.relatedArticleSlugs : []
    };
  },

  // GET /blog
  getBlogPosts: async (): Promise<ApiResponse<BlogArticle[]>> => {
    try {
      const res = await apiClient.get('/blog');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'error', message: unwrapped.message || 'Failed to fetch blog posts', data: [] };
      }

      const list = Array.isArray(unwrapped.data) 
        ? unwrapped.data 
        : (unwrapped.data?.posts || unwrapped.data?.articles || unwrapped.data?.data || []);
      
      const normalized = list.map((item: any) => contentService.normalizeBlogArticle(item)).filter(Boolean) as BlogArticle[];
      return { status: 'success', message: null, data: normalized };
    } catch (err: any) {
      return { status: 'error', message: err?.message || 'Failed to fetch blog posts', data: [] };
    }
  },

  // GET /blog/:slug
  getBlogPostBySlug: async (slug: string): Promise<ApiResponse<BlogArticle>> => {
    try {
      const res = await apiClient.get(`/blog/${encodeURIComponent(slug)}`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Blog article not found', data: null as any };
      }

      const normalized = contentService.normalizeBlogArticle(unwrapped.data);
      if (!normalized) {
        return { status: 'error', message: 'Blog article not found', data: null as any };
      }

      return { status: 'success', message: null, data: normalized };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, `Failed to fetch blog post '${slug}'`);
      return {
        status: 'error', message, errors, data: null as any
      };
    }
  },

  // GET /pages/:slug
  getPageBySlug: async (slug: string): Promise<ApiResponse<CMSPage>> => {
    try {
      const res = await apiClient.get(`/pages/${encodeURIComponent(slug)}`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Page not found', data: null as any };
      }

      return { status: 'success', message: null, data: unwrapped.data };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, `Failed to fetch page '${slug}'`);
      return {
        status: 'error', message, errors, data: null as any
      };
    }
  }
};

