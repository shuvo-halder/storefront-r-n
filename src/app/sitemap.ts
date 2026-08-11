export default async function sitemap() {
  const baseUrl = 'https://ais-dev-y3sr6cgyjnc4jmfcjlybeh-129344856109.asia-southeast1.run.app';

  // In a real Next.js app, we would fetch dynamic routes from the API
  const staticRoutes = [
    '',
    '#shop',
    '#blog',
    '#faq',
    '#deals',
    '#cms-page?cmsPageType=about-us',
    '#cms-page?cmsPageType=contact-us'
  ].map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    // Add dynamic products, articles etc. here in a production environment
  ];
}
