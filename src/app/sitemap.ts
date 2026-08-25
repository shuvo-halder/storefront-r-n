import { MetadataRoute } from 'next';
import { storefrontApi } from '../services/storefrontApi';

// Revalidate sitemap dynamically every 1 hour (3600 seconds)
export const revalidate = 3600;

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

  // 1. Core Static Indexable Storefront Routes
  const now = new Date();
  addUrl('/', { lastModified: now, changeFrequency: 'daily', priority: 1.0 });
  addUrl('/products', { lastModified: now, changeFrequency: 'daily', priority: 0.9 });
  addUrl('/categories', { lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
  addUrl('/brands', { lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
  addUrl('/blog', { lastModified: now, changeFrequency: 'daily', priority: 0.8 });
  addUrl('/faq', { lastModified: now, changeFrequency: 'monthly', priority: 0.7 });

  // Public CMS Pages
  const cmsSlugs = ['about', 'terms', 'privacy', 'shipping', 'contact'];
  cmsSlugs.forEach((slug) => {
    addUrl(`/pages/${slug}`, { changeFrequency: 'monthly', priority: 0.6 });
  });

  // 2. Dynamic Products (Paginated)
  try {
    let page = 1;
    const pageSize = 100;
    let totalFetched = 0;

    while (page <= 50) {
      const res = await storefrontApi.getProducts({ page, pageSize });
      const products = res.products || [];
      if (products.length === 0) break;

      products.forEach((product) => {
        if (product.slug && String(product.slug).trim()) {
          const modDate = parseValidDate(
            (product as any).updatedAt ||
              (product as any).updated_at ||
              (product as any).createdAt ||
              (product as any).created_at
          );
          addUrl(`/products/${encodeURIComponent(String(product.slug).trim())}`, {
            lastModified: modDate,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });

      totalFetched += products.length;
      if (totalFetched >= res.total || products.length < pageSize) break;
      page++;
    }
  } catch {
    // Resilience: Ignore temporary API failure so remaining sitemap entries render safely
  }

  // 3. Dynamic Categories
  try {
    const categories = await storefrontApi.getCategories();
    const processCategory = (cat: any) => {
      if (cat.slug && String(cat.slug).trim()) {
        const modDate = parseValidDate(cat.updatedAt || cat.updated_at);
        addUrl(`/categories/${encodeURIComponent(String(cat.slug).trim())}`, {
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
  } catch {
    // Resilience
  }

  // 4. Dynamic Brands
  try {
    const brands = await storefrontApi.getBrands();
    brands.forEach((brand) => {
      if (brand.slug && String(brand.slug).trim()) {
        const modDate = parseValidDate((brand as any).updatedAt || (brand as any).updated_at);
        addUrl(`/brands/${encodeURIComponent(String(brand.slug).trim())}`, {
          lastModified: modDate,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });
  } catch {
    // Resilience
  }

  // 5. Dynamic Blog Articles
  try {
    const articles = await storefrontApi.getArticles();
    articles.forEach((article) => {
      if (article.slug && String(article.slug).trim()) {
        const modDate = parseValidDate(
          (article as any).updatedAt ||
            (article as any).updated_at ||
            (article as any).publishedAt ||
            article.date
        );
        addUrl(`/blog/${encodeURIComponent(String(article.slug).trim())}`, {
          lastModified: modDate,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });
  } catch {
    // Resilience
  }

  return Array.from(urlMap.values());
}
