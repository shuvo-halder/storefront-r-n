import { MetadataRoute } from 'next';

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://vyzobd.com'
).replace(/\/+$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cart',
        '/checkout',
        '/account',
        '/orders',
        '/profile',
        '/addresses',
        '/notifications',
        '/activity',
        '/login',
        '/register',
        '/forgot-password',
        '/api/*',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
