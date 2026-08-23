import type { Metadata } from 'next';
import { storefrontApi } from '../services/storefrontApi';

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vyzobd.com';

export async function getPublicSiteSettings() {
  try {
    const settings = await storefrontApi.getPublicSettings();
    return settings;
  } catch (err) {
    return null;
  }
}

export function getSiteName(settings: any): string {
  return (
    settings?.general?.siteName ||
    settings?.siteName ||
    settings?.branding?.siteName ||
    settings?.general?.siteTitle ||
    settings?.siteTitle ||
    'Vyzobd'
  );
}

export function getFaviconUrl(settings: any): string {
  return settings?.branding?.faviconUrl || settings?.faviconUrl || '/favicon.svg';
}

/**
 * 1. Homepage Metadata
 */
export async function getHomepageMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const title =
    settings?.seo?.metaTitle ||
    settings?.general?.siteTitle ||
    settings?.branding?.siteTitle ||
    settings?.siteTitle ||
    `${siteName} — Next-Gen Audio Equipment & Tech Hardware`;
  const description =
    settings?.seo?.metaDescription ||
    'Engineers of next-generation audio equipment, GaN fast chargers, and high-performance workstation peripherals for the modern professional.';
  
  const rawKeywords = settings?.seo?.metaKeywords || (settings?.seo as any)?.keywords;
  const keywords = rawKeywords
    ? String(rawKeywords).split(',').map((k: string) => k.trim())
    : ['audio equipment', 'tech hardware', siteName, 'workstation peripherals', 'headphone DAC', 'chargers'];

  const ogTitle = settings?.seo?.ogTitle || title;
  const ogDescription = settings?.seo?.ogDescription || description;
  const ogImage =
    settings?.seo?.ogImageUrl ||
    settings?.seo?.ogImage ||
    settings?.branding?.logoUrl ||
    settings?.logoUrl ||
    `${DEFAULT_BASE_URL}/favicon.svg`;

  const twitterTitle = settings?.seo?.twitterTitle || title;
  const twitterDescription = settings?.seo?.twitterDescription || description;
  const twitterImage = settings?.seo?.twitterImage || ogImage;

  const favicon = getFaviconUrl(settings);

  return {
    metadataBase: new URL(DEFAULT_BASE_URL),
    title,
    description,
    keywords,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: DEFAULT_BASE_URL,
      siteName,
      images: [{ url: ogImage }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      images: [twitterImage],
    },
    alternates: {
      canonical: DEFAULT_BASE_URL,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * 2. Products Listing Metadata
 */
export async function getProductsListingMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const title = `All Products | ${siteName}`;
  const description = `Browse the complete collection of high-performance audio equipment, workstation accessories, and power solutions at ${siteName}.`;
  const canonical = `${DEFAULT_BASE_URL}/products`;
  const favicon = getFaviconUrl(settings);

  return {
    title,
    description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical },
  };
}

/**
 * Categories Index Metadata
 */
export async function getCategoriesIndexMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const title = `Hardware Categories | ${siteName}`;
  const description = `Browse specialized departments for precision workstation gear and audio hardware at ${siteName}.`;
  const canonical = `${DEFAULT_BASE_URL}/categories`;
  const favicon = getFaviconUrl(settings);

  return {
    title,
    description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: { title, description, url: canonical, siteName, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical },
  };
}

/**
 * Brands Index Metadata
 */
export async function getBrandsIndexMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const title = `Official Brands | ${siteName}`;
  const description = `Explore hardware and audio equipment from verified technology manufacturers at ${siteName}.`;
  const canonical = `${DEFAULT_BASE_URL}/brands`;
  const favicon = getFaviconUrl(settings);

  return {
    title,
    description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: { title, description, url: canonical, siteName, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical },
  };
}

/**
 * Blog Index Metadata
 */
export async function getBlogIndexMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const title = `Journal & Articles | ${siteName}`;
  const description = `Read the latest technology guides, audio hardware reviews, and news at ${siteName}.`;
  const canonical = `${DEFAULT_BASE_URL}/blog`;
  const favicon = getFaviconUrl(settings);

  return {
    title,
    description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: { title, description, url: canonical, siteName, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical },
  };
}

/**
 * 3. Product Detail Metadata
 */
export async function getProductDetailMetadata(slug: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const canonical = `${DEFAULT_BASE_URL}/products/${slug}`;

  try {
    const product = await storefrontApi.getProductBySlug(slug);
    if (!product) {
      const missingTitle = `Product Not Found | ${siteName}`;
      const missingDesc = `The requested product could not be found on ${siteName}.`;
      return {
        title: missingTitle,
        description: missingDesc,
        icons: { icon: favicon, shortcut: favicon, apple: favicon },
        openGraph: { title: missingTitle, description: missingDesc, url: canonical, siteName },
        twitter: { card: 'summary_large_image', title: missingTitle, description: missingDesc },
        alternates: { canonical },
      };
    }

    const rawProduct = product as any;
    const entityTitle = product.name || rawProduct.title || rawProduct.seoTitle || rawProduct.productName || (product.slug ? product.slug.replace(/[-_]/g, ' ') : 'Product');
    const pageTitle = `${entityTitle} | ${siteName}`;
    const description = rawProduct.seoDescription || product.description || product.subtitle || `Buy ${entityTitle} at ${siteName}. High performance tech hardware and audio equipment.`;
    const image = rawProduct.ogImage || (product.images && product.images.length > 0 ? product.images[0] : rawProduct.thumbnail) || `${DEFAULT_BASE_URL}/favicon.svg`;

    return {
      title: pageTitle,
      description: description.substring(0, 160),
      keywords: product.tags && product.tags.length > 0 ? product.tags : [entityTitle, product.category, product.brand, siteName].filter(Boolean),
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: {
        title: pageTitle,
        description: description.substring(0, 160),
        url: canonical,
        siteName,
        images: [{ url: image, alt: entityTitle }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description.substring(0, 160),
        images: [image],
      },
      alternates: { canonical },
    };
  } catch (err) {
    const errorTitle = `Product Not Found | ${siteName}`;
    return {
      title: errorTitle,
      description: `The requested product could not be found on ${siteName}.`,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: { title: errorTitle, url: canonical, siteName },
      alternates: { canonical },
    };
  }
}

/**
 * 4. Category Detail Metadata
 */
export async function getCategoryDetailMetadata(slug: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const canonical = `${DEFAULT_BASE_URL}/categories/${slug}`;

  try {
    const categories = await storefrontApi.getCategories();
    const findCat = (cats: any[]): any => {
      for (const c of cats) {
        if (c.slug === slug || c.id === slug) return c;
        if (c.children && c.children.length > 0) {
          const sub = findCat(c.children);
          if (sub) return sub;
        }
        if (c.subcategories && c.subcategories.length > 0) {
          const sub = findCat(c.subcategories);
          if (sub) return sub;
        }
      }
      return null;
    };
    const category = findCat(categories);

    if (!category) {
      const missingTitle = `Category Not Found | ${siteName}`;
      const missingDesc = `The requested category could not be found on ${siteName}.`;
      return {
        title: missingTitle,
        description: missingDesc,
        icons: { icon: favicon, shortcut: favicon, apple: favicon },
        openGraph: { title: missingTitle, description: missingDesc, url: canonical, siteName },
        twitter: { card: 'summary_large_image', title: missingTitle, description: missingDesc },
        alternates: { canonical },
      };
    }

    const entityTitle = category.seoTitle || category.name || slug;
    const pageTitle = `${entityTitle} | ${siteName}`;
    const description = category.seoDescription || category.description || `Shop the latest ${entityTitle} products and audio hardware at ${siteName}.`;
    const image = category.ogImage || category.image || `${DEFAULT_BASE_URL}/favicon.svg`;

    return {
      title: pageTitle,
      description: description.substring(0, 160),
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: {
        title: pageTitle,
        description: description.substring(0, 160),
        url: canonical,
        siteName,
        images: [{ url: image, alt: entityTitle }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description.substring(0, 160),
        images: [image],
      },
      alternates: { canonical },
    };
  } catch (err) {
    const errorTitle = `Category Not Found | ${siteName}`;
    return {
      title: errorTitle,
      description: `The requested category could not be found on ${siteName}.`,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: { title: errorTitle, url: canonical, siteName },
      alternates: { canonical },
    };
  }
}

/**
 * 5. Brand Detail Metadata
 */
export async function getBrandDetailMetadata(slug: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const canonical = `${DEFAULT_BASE_URL}/brands/${slug}`;

  try {
    const brands = await storefrontApi.getBrands();
    const brand = brands.find(b => b.slug === slug || b.id === slug) as any;

    if (!brand) {
      const missingTitle = `Brand Not Found | ${siteName}`;
      const missingDesc = `The requested brand could not be found on ${siteName}.`;
      return {
        title: missingTitle,
        description: missingDesc,
        icons: { icon: favicon, shortcut: favicon, apple: favicon },
        openGraph: { title: missingTitle, description: missingDesc, url: canonical, siteName },
        twitter: { card: 'summary_large_image', title: missingTitle, description: missingDesc },
        alternates: { canonical },
      };
    }

    const entityTitle = brand.seoTitle || brand.name || slug;
    const pageTitle = `${entityTitle} | ${siteName}`;
    const description = brand.seoDescription || brand.description || `Discover hardware and accessories from ${entityTitle} at ${siteName}.`;
    const image = brand.ogImage || brand.logo || brand.logoUrl || `${DEFAULT_BASE_URL}/favicon.svg`;

    return {
      title: pageTitle,
      description: description.substring(0, 160),
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: {
        title: pageTitle,
        description: description.substring(0, 160),
        url: canonical,
        siteName,
        images: [{ url: image, alt: entityTitle }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description.substring(0, 160),
        images: [image],
      },
      alternates: { canonical },
    };
  } catch (err) {
    const errorTitle = `Brand Not Found | ${siteName}`;
    return {
      title: errorTitle,
      description: `The requested brand could not be found on ${siteName}.`,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: { title: errorTitle, url: canonical, siteName },
      alternates: { canonical },
    };
  }
}

/**
 * 6. Blog Detail Metadata
 */
export async function getBlogDetailMetadata(slug: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const canonical = `${DEFAULT_BASE_URL}/blog/${slug}`;

  try {
    const article = await storefrontApi.getArticleBySlug(slug) as any;

    if (!article) {
      const missingTitle = `Article Not Found | ${siteName}`;
      const missingDesc = `The requested journal article could not be found on ${siteName}.`;
      return {
        title: missingTitle,
        description: missingDesc,
        icons: { icon: favicon, shortcut: favicon, apple: favicon },
        openGraph: { title: missingTitle, description: missingDesc, url: canonical, siteName },
        twitter: { card: 'summary_large_image', title: missingTitle, description: missingDesc },
        alternates: { canonical },
      };
    }

    const entityTitle = article.title || 'Journal Article';
    const pageTitle = `${entityTitle} | ${siteName}`;
    const description = article.excerpt || article.content?.substring(0, 160) || `Read ${entityTitle} on the ${siteName} journal.`;
    const image = article.coverImage || article.featuredImage?.secureUrl || article.featuredImage?.url || `${DEFAULT_BASE_URL}/favicon.svg`;

    return {
      title: pageTitle,
      description: description.substring(0, 160),
      keywords: article.tags && article.tags.length > 0 ? article.tags : ['journal', article.category, siteName].filter(Boolean),
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: {
        title: pageTitle,
        description: description.substring(0, 160),
        url: canonical,
        siteName,
        images: [{ url: image, alt: entityTitle }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description.substring(0, 160),
        images: [image],
      },
      alternates: { canonical },
    };
  } catch (err) {
    const errorTitle = `Article Not Found | ${siteName}`;
    return {
      title: errorTitle,
      description: `The requested article could not be found on ${siteName}.`,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: { title: errorTitle, url: canonical, siteName },
      alternates: { canonical },
    };
  }
}

/**
 * 7. CMS Page Metadata
 */
export async function getCMSPageMetadata(slug: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const canonical = `${DEFAULT_BASE_URL}/pages/${slug}`;

  try {
    const page = await storefrontApi.getCMSPageBySlug(slug) as any;

    if (!page) {
      const missingTitle = `Page Not Found | ${siteName}`;
      const missingDesc = `The requested page could not be found on ${siteName}.`;
      return {
        title: missingTitle,
        description: missingDesc,
        icons: { icon: favicon, shortcut: favicon, apple: favicon },
        openGraph: { title: missingTitle, description: missingDesc, url: canonical, siteName },
        twitter: { card: 'summary_large_image', title: missingTitle, description: missingDesc },
        alternates: { canonical },
      };
    }

    const entityTitle = page.metaTitle || page.title || slug;
    const pageTitle = `${entityTitle} | ${siteName}`;
    const description = page.metaDescription || page.content?.substring(0, 160) || `Learn more about ${entityTitle} at ${siteName}.`;

    return {
      title: pageTitle,
      description,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: {
        title: pageTitle,
        description,
        url: canonical,
        siteName,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description,
      },
      alternates: { canonical },
    };
  } catch (err) {
    const errorTitle = `Page Not Found | ${siteName}`;
    return {
      title: errorTitle,
      description: `The requested page could not be found on ${siteName}.`,
      icons: { icon: favicon, shortcut: favicon, apple: favicon },
      openGraph: { title: errorTitle, url: canonical, siteName },
      alternates: { canonical },
    };
  }
}

/**
 * 8. Search Page Metadata
 */
export async function getSearchPageMetadata(query?: string): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = getSiteName(settings);
  const favicon = getFaviconUrl(settings);
  const q = query?.trim();

  const title = q ? `Search results for "${q}" | ${siteName}` : `Search Products | ${siteName}`;
  const description = q 
    ? `Browse search results for "${q}" across precision audio equipment and tech hardware at ${siteName}.` 
    : `Search our entire catalog of workstation gear, audio hardware, and tech accessories at ${siteName}.`;
  
  const canonical = q 
    ? `${DEFAULT_BASE_URL}/search?q=${encodeURIComponent(q)}` 
    : `${DEFAULT_BASE_URL}/search`;

  return {
    title,
    description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical },
  };
}
