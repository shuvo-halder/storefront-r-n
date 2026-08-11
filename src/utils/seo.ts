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

export const getProductSchema = (product: Product, currency: string = 'USD') => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  'name': product.name,
  'image': product.images[0],
  'description': product.description,
  'brand': {
    '@type': 'Brand',
    'name': product.brand
  },
  'offers': {
    '@type': 'Offer',
    'url': `${typeof window !== 'undefined' ? window.location.origin : ''}/#product-detail?id=${product.id}`,
    'priceCurrency': currency,
    'price': product.price,
    'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
  }
});

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
