import { Product, BlogArticle, CMSPage, StoreGeneral } from '../types/storefront';

export const getOrganizationSchema = (general: StoreGeneral | null) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': general?.siteName || 'Vyzobd',
  'url': typeof window !== 'undefined' ? window.location.origin : '',
  'logo': '', // Add logo URL if available
  'contactPoint': {
    '@type': 'ContactPoint',
    'telephone': general?.storePhone || '',
    'contactType': 'customer service',
    'email': general?.storeEmail || ''
  }
});

export const getWebsiteSchema = (general: StoreGeneral | null) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': general?.siteName || 'Vyzobd',
  'url': typeof window !== 'undefined' ? window.location.origin : '',
  'potentialAction': {
    '@type': 'SearchAction',
    'target': `${typeof window !== 'undefined' ? window.location.origin : ''}/#search?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
});

export const getProductSchema = (product: Product, currency: string = 'BDT', baseUrl?: string) => {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://vyzobd.com');
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'image': product.images && product.images.length > 0 ? product.images : [`${origin}/favicon.svg`],
    'description': product.description || product.subtitle || product.name,
    'sku': product.variants?.[0]?.sku || `SKU-${product.id}`,
    'offers': {
      '@type': 'Offer',
      'url': `${origin}/products/${product.slug}`,
      'priceCurrency': currency,
      'price': product.price,
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };

  if (product.brand) {
    schema.brand = {
      '@type': 'Brand',
      'name': product.brand
    };
  }

  if (product.category) {
    schema.category = product.category;
  }

  if (product.rating && product.rating > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': product.rating,
      'reviewCount': Math.max(product.reviewCount || 1, 1),
      'bestRating': 5,
      'worstRating': 1
    };
  }

  return schema;
};

export const getArticleSchema = (article: BlogArticle) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  'headline': article.title,
  'image': [article.coverImage],
  'datePublished': article.date,
  'author': [{
    '@type': 'Person',
    'name': article.author
  }]
});

export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': items.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.name,
    'item': item.url
  }))
});
