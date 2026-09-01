import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { Banner, BlogArticle, CMSPage } from '../types/storefront';

let cachedBanners: Banner[] | null = null;
let cachedBannersTimestamp = 0;
let inFlightBannersPromise: Promise<ApiResponse<Banner[]>> | null = null;
const BANNER_CACHE_TTL_MS = 30000; // 30 seconds

export const contentService = {
  // Helper: Normalize raw banner data from backend API
  normalizeBanner(raw: any): Banner | null {
    if (!raw) return null;
    const desktopImage = String(raw.desktopImage || raw.desktopImageUrl || raw.image || raw.imageUrl || '');
    const mobileImage = String(raw.mobileImage || raw.mobileImageUrl || desktopImage);
    const image = String(raw.image || raw.imageUrl || desktopImage || mobileImage);

    const ctaText = raw.ctaText || raw.buttonText || raw.ctaLabel || raw.buttonLabel || undefined;
    const buttonText = raw.buttonText || raw.ctaText || raw.buttonLabel || raw.ctaLabel || undefined;

    return {
      id: String(raw.id || raw._id || Math.random().toString(36).substring(2, 9)),
      badge: raw.badge || raw.tag || raw.label || undefined,
      title: String(raw.title || raw.heading || ''),
      subtitle: raw.subtitle || raw.description || raw.subheading || undefined,
      description: raw.description || raw.subtitle || undefined,
      price: raw.price ? String(raw.price) : undefined,
      comparePrice: raw.comparePrice ? String(raw.comparePrice) : undefined,
      discount: raw.discount || undefined,
      image,
      desktopImage: desktopImage || image,
      mobileImage: mobileImage || desktopImage || image,
      buttonText,
      ctaText,
      linkUrl: raw.linkUrl || raw.url || raw.link || undefined,
      productSlug: raw.productSlug || raw.product?.slug || undefined,
      categorySlug: raw.categorySlug || raw.category?.slug || undefined,
      type: raw.type || 'hero',
      bgColor: raw.bgColor || raw.backgroundColor || undefined,
      priority: (() => {
        const p = raw.priority ?? raw.sortOrder ?? raw.order;
        if (typeof p === 'number' && !isNaN(p)) return p;
        if (typeof p === 'string' && p.trim() !== '' && !isNaN(Number(p))) return Number(p);
        return undefined;
      })(),
      isActive: typeof raw.isActive === 'boolean' ? raw.isActive : true,
    };
  },

  // GET /banners
  getBanners: async (type?: 'hero' | 'promo' | 'offer', bypassCache = false): Promise<ApiResponse<Banner[]>> => {
    const now = Date.now();
    
    // Fetch all active banners from backend with deduplication and caching
    const fetchAllBanners = async (): Promise<Banner[]> => {
      if (!bypassCache && cachedBanners && (now - cachedBannersTimestamp < BANNER_CACHE_TTL_MS)) {
        return cachedBanners;
      }

      if (!bypassCache && inFlightBannersPromise) {
        const res = await inFlightBannersPromise;
        return res.data || [];
      }

      const fetchPromise = (async (): Promise<ApiResponse<Banner[]>> => {
        try {
          const res = await apiClient.get('/banners');
          const unwrapped = unwrapApiResponse<any>(res);

          if (unwrapped.status === 'error') {
            return { status: 'success', message: null, data: [] };
          }

          const list = Array.isArray(unwrapped.data) 
            ? unwrapped.data 
            : (unwrapped.data?.banners || unwrapped.data?.data || []);
          
          const normalizedList = list
            .map((item: any) => contentService.normalizeBanner(item))
            .filter((item: Banner | null): item is Banner => item !== null && (item.isActive ?? true));

          // Sort by priority ascending (undefined priority placed at the end)
          normalizedList.sort((a, b) => {
            const pA = a.priority !== undefined ? a.priority : 9999;
            const pB = b.priority !== undefined ? b.priority : 9999;
            return pA - pB;
          });

          cachedBanners = normalizedList;
          cachedBannersTimestamp = Date.now();
          return { status: 'success', message: null, data: normalizedList };
        } catch {
          return { status: 'success', message: null, data: [] };
        } finally {
          inFlightBannersPromise = null;
        }
      })();

      inFlightBannersPromise = fetchPromise;
      const response = await fetchPromise;
      return response.data || [];
    };

    try {
      const allBanners = await fetchAllBanners();

      if (type === 'hero') {
        // Strict business rule: priority 99 must NEVER appear in hero slider
        const heroBanners = allBanners.filter(
          b => b.priority === undefined || b.priority === null || Number(b.priority) !== 99
        );
        return { status: 'success', message: null, data: heroBanners };
      }

      if (type === 'offer') {
        // Return full list for offer filtering or offer-specific items
        return { status: 'success', message: null, data: allBanners };
      }

      return { status: 'success', message: null, data: allBanners };
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

  // GET /pages
  getCMSPages: async (): Promise<ApiResponse<CMSPage[]>> => {
    try {
      const res = await apiClient.get('/pages');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'error', message: unwrapped.message || 'Failed to fetch pages', data: [] };
      }

      const list = Array.isArray(unwrapped.data) 
        ? unwrapped.data 
        : (unwrapped.data?.pages || unwrapped.data?.data || []);

      return { status: 'success', message: null, data: list };
    } catch (err: any) {
      return { status: 'error', message: err?.message || 'Failed to fetch pages', data: [] };
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

