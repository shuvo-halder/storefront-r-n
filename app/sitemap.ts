import type { MetadataRoute } from 'next';
import { storefrontApi } from '../src/services/storefrontApi';

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vyzobd.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: DEFAULT_BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${DEFAULT_BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${DEFAULT_BASE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${DEFAULT_BASE_URL}/brands`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${DEFAULT_BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${DEFAULT_BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const productsRes = await storefrontApi.getProducts({});
    if (productsRes?.products) {
      productsRes.products.forEach(p => {
        if (p.slug) {
          const rawP = p as any;
          routes.push({
            url: `${DEFAULT_BASE_URL}/products/${p.slug}`,
            lastModified: new Date(rawP.updatedAt || rawP.createdAt || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    }
  } catch (e) {
    // Graceful fallback
  }

  try {
    const categories = await storefrontApi.getCategories();
    if (Array.isArray(categories)) {
      categories.forEach(c => {
        if (c.slug) {
          routes.push({
            url: `${DEFAULT_BASE_URL}/categories/${c.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }
  } catch (e) {
    // Graceful fallback
  }

  try {
    const brands = await storefrontApi.getBrands();
    if (Array.isArray(brands)) {
      brands.forEach(b => {
        if (b.slug) {
          routes.push({
            url: `${DEFAULT_BASE_URL}/brands/${b.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      });
    }
  } catch (e) {
    // Graceful fallback
  }

  try {
    const articles = await storefrontApi.getArticles();
    if (Array.isArray(articles)) {
      articles.forEach(a => {
        if (a.slug) {
          const rawA = a as any;
          routes.push({
            url: `${DEFAULT_BASE_URL}/blog/${a.slug}`,
            lastModified: new Date(rawA.publishedAt || rawA.createdAt || Date.now()),
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      });
    }
  } catch (e) {
    // Graceful fallback
  }

  return routes;
}
