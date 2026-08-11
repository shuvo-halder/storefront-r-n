export default function robots() {
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
        '/forgot-password'
      ],
    },
    sitemap: 'https://ais-dev-y3sr6cgyjnc4jmfcjlybeh-129344856109.asia-southeast1.run.app/sitemap.xml',
  };
}
