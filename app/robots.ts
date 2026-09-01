import type { MetadataRoute } from 'next';

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://vyzobd.com'
).replace(/\/+$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/account/',
          '/cart',
          '/checkout',
          '/wishlist',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/order-confirmation',
          '/search',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

