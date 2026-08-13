import type { MetadataRoute } from 'next';

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vyzobd.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account/', '/cart', '/checkout/'],
      },
    ],
    sitemap: `${DEFAULT_BASE_URL}/sitemap.xml`,
  };
}
