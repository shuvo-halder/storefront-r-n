import type { MetadataRoute } from 'next';
import { storefrontApi } from '../src/services/storefrontApi';

// Automatically revalidate sitemap every 4 hours (14,400 seconds)
export const revalidate = 14400;

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://vyzobd.com'
).replace(/\/+$/, '');

function parseValidDate(dateVal: any): Date | undefined {
  if (!dateVal) return undefined;
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? undefined : d;
}

async function fetchWithTimeout<T>(fn: () => Promise<T>, timeoutMs = 8000): Promise<T | null> {
  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
    const result = await Promise.race([fn(), timeoutPromise]);
    return result;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urlMap = new Map<string, MetadataRoute.Sitemap[number]>();

  const addUrl = (
    path: string,
    options?: {
      lastModified?: Date;
      changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
      priority?: number;
    }
  ) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${BASE_URL}${cleanPath}`;

    if (!urlMap.has(fullUrl)) {
      urlMap.set(fullUrl, {
        url: fullUrl,
        ...(options?.lastModified ? { lastModified: options.lastModified } : {}),
        ...(options?.changeFrequency ? { changeFrequency: options.changeFrequency } : {}),
        ...(options?.priority !== undefined ? { priority: options.priority } : {}),
      });
    }
  };

  const now = new Date();

  // 1. Core Static Indexable Storefront Routes
  addUrl('/', { lastModified: now, changeFrequency: 'daily', priority: 1.0 });
  addUrl('/shop', { lastModified: now, changeFrequency: 'daily', priority: 0.9 });
  addUrl('/products', { lastModified: now, changeFrequency: 'daily', priority: 0.9 });
  addUrl('/categories', { lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
  addUrl('/brands', { lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
  addUrl('/blog', { lastModified: now, changeFrequency: 'daily', priority: 0.8 });
  addUrl('/faq', { lastModified: now, changeFrequency: 'monthly', priority: 0.7 });

  // 2. Dynamic Products (Paginated loop to collect ALL products)
  try {
    let page = 1;
    const pageSize = 100;
    let totalFetched = 0;
    const maxPages = 100; // Safety ceiling: up to 10,000 products

    while (page <= maxPages) {
      const res = await fetchWithTimeout(() => storefrontApi.getProducts({ page, pageSize }), 10000);
      if (!res || !res.products || res.products.length === 0) break;

      res.products.forEach((product) => {
        if (product.slug && String(product.slug).trim()) {
          const cleanSlug = encodeURIComponent(String(product.slug).trim());
          const modDate = parseValidDate(
            (product as any).updatedAt ||
              (product as any).updated_at ||
              (product as any).createdAt ||
              (product as any).created_at
          );
          addUrl(`/products/${cleanSlug}`, {
            lastModified: modDate,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });

      totalFetched += res.products.length;
      if (totalFetched >= (res.total || 0) || res.products.length < pageSize) break;
      page++;
    }
  } catch {
    // Resilience: ignore temporary API failure so remaining sitemap entries render safely
  }

  // 3. Dynamic Categories (Recursive for subcategories)
  try {
    const categories = await fetchWithTimeout(() => storefrontApi.getCategories(), 10000);
    if (Array.isArray(categories)) {
      const processCategory = (cat: any) => {
        if (cat.slug && String(cat.slug).trim()) {
          const cleanSlug = encodeURIComponent(String(cat.slug).trim());
          const modDate = parseValidDate(cat.updatedAt || cat.updated_at);
          addUrl(`/categories/${cleanSlug}`, {
            lastModified: modDate,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
        if (Array.isArray(cat.subcategories)) {
          cat.subcategories.forEach(processCategory);
        }
        if (Array.isArray(cat.children)) {
          cat.children.forEach(processCategory);
        }
      };

      categories.forEach(processCategory);
    }
  } catch {
    // Resilience
  }

  // 4. Dynamic Brands
  try {
    const brands = await fetchWithTimeout(() => storefrontApi.getBrands(), 10000);
    if (Array.isArray(brands)) {
      brands.forEach((brand) => {
        if (brand.slug && String(brand.slug).trim()) {
          const cleanSlug = encodeURIComponent(String(brand.slug).trim());
          const modDate = parseValidDate((brand as any).updatedAt || (brand as any).updated_at);
          addUrl(`/brands/${cleanSlug}`, {
            lastModified: modDate,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }
  } catch {
    // Resilience
  }

  // 5. Dynamic Blog Articles
  try {
    const articles = await fetchWithTimeout(() => storefrontApi.getArticles(), 10000);
    if (Array.isArray(articles)) {
      articles.forEach((article) => {
        if (article.slug && String(article.slug).trim()) {
          const cleanSlug = encodeURIComponent(String(article.slug).trim());
          const modDate = parseValidDate(
            (article as any).updatedAt ||
              (article as any).updated_at ||
              (article as any).publishedAt ||
              article.date
          );
          addUrl(`/blog/${cleanSlug}`, {
            lastModified: modDate,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }
  } catch {
    // Resilience
  }

  // 6. Dynamic CMS Pages
  try {
    const cmsPages = await fetchWithTimeout(() => storefrontApi.getCMSPages(), 10000);
    if (Array.isArray(cmsPages)) {
      cmsPages.forEach((page) => {
        if (page.slug && String(page.slug).trim() && (page.status === undefined || page.status === 'PUBLISHED')) {
          const cleanSlug = encodeURIComponent(String(page.slug).trim());
          const modDate = parseValidDate((page as any).updatedAt || (page as any).publishedAt || (page as any).lastUpdated);
          addUrl(`/pages/${cleanSlug}`, {
            lastModified: modDate,
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      });
    }
  } catch {
    // Resilience
  }

  return Array.from(urlMap.values());
}

