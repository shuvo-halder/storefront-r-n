import { Product } from '../types/storefront';

export interface SmartSearchOptions {
  category?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  inStockOnly?: boolean;
  ratingMin?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
}

export interface SmartSearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  suggestions?: {
    categories?: Array<{ name: string; slug: string }>;
    brands?: Array<{ name: string; slug: string }>;
  };
}

/**
 * Computes a fuzzy/partial relevance score for a product against a search query.
 * Matches across name, slug, brand, category, description, features, specifications, tags, and variants/SKUs.
 */
export function scoreAndMatchProduct(product: Product, query: string): { matches: boolean; score: number } {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    return { matches: true, score: 1 };
  }

  // Tokenize query into distinct search words
  const tokens = q.split(/[\s,+/_\-:]+/).filter(Boolean);
  if (tokens.length === 0) {
    return { matches: true, score: 1 };
  }

  const name = (product.name || '').toLowerCase();
  const slug = (product.slug || '').toLowerCase();
  const brand = (typeof product.brand === 'string' ? product.brand : (product.brand as any)?.name || '').toLowerCase();
  const brandId = (product.brandId || (product.brand as any)?.slug || '').toLowerCase();
  const category = (typeof product.category === 'string' ? product.category : (product.category as any)?.name || '').toLowerCase();
  const categoryId = (product.categoryId || (product.category as any)?.slug || '').toLowerCase();
  const desc = (product.description || product.subtitle || '').toLowerCase();
  const features = (product.features || []).join(' ').toLowerCase();
  const specs = (product.specifications || []).map(s => `${s.key} ${s.value}`).join(' ').toLowerCase();
  const tags = (product.tags || []).join(' ').toLowerCase();
  const variants = (product.variants || []).map(v => `${v.sku || ''} ${v.name || ''}`).join(' ').toLowerCase();

  let score = 0;
  let matchedTokensCount = 0;

  // 1. Full phrase matches
  if (name.includes(q)) {
    score += 1000;
  } else if (brand.includes(q) || brandId.includes(q)) {
    score += 600;
  } else if (category.includes(q) || categoryId.includes(q)) {
    score += 500;
  } else if (slug.includes(q)) {
    score += 400;
  } else if (tags.includes(q) || features.includes(q) || desc.includes(q) || specs.includes(q) || variants.includes(q)) {
    score += 250;
  }

  // 2. Token-level partial and word matching
  tokens.forEach(tok => {
    let tokScore = 0;

    if (name.includes(tok)) {
      tokScore += 150;
      if (name.split(/\s+/).some(w => w.startsWith(tok))) tokScore += 50;
      if (name.split(/\s+/).some(w => w === tok)) tokScore += 50;
    }
    if (brand.includes(tok) || brandId.includes(tok)) {
      tokScore += 120;
      if (brand.split(/\s+/).some(w => w === tok)) tokScore += 40;
    }
    if (category.includes(tok) || categoryId.includes(tok)) {
      tokScore += 100;
      if (category.split(/\s+/).some(w => w === tok)) tokScore += 30;
    }
    if (slug.includes(tok)) {
      tokScore += 80;
    }
    if (tags.includes(tok)) {
      tokScore += 70;
    }
    if (variants.includes(tok)) {
      tokScore += 60;
    }
    if (features.includes(tok)) {
      tokScore += 50;
    }
    if (specs.includes(tok)) {
      tokScore += 40;
    }
    if (desc.includes(tok)) {
      tokScore += 30;
    }

    if (tokScore > 0) {
      score += tokScore;
      matchedTokensCount++;
    }
  });

  if (matchedTokensCount === 0 && score === 0) {
    return { matches: false, score: 0 };
  }

  // Boost products that match a higher proportion of search tokens
  const tokenMatchRatio = matchedTokensCount / tokens.length;
  score *= (1 + tokenMatchRatio);

  return { matches: true, score };
}

/**
 * Filter, rank, and paginate a list of products based on smart partial search and facet options.
 */
export function smartFilterAndRankProducts(
  products: Product[],
  query?: string,
  options?: SmartSearchOptions
): SmartSearchResult {
  const q = (query || '').trim();
  const opts = options || {};

  // 1. Score and filter by search query
  let scoredItems: Array<{ product: Product; score: number }> = [];

  for (const prod of products) {
    if (!prod) continue;
    const { matches, score } = scoreAndMatchProduct(prod, q);
    if (matches) {
      scoredItems.push({ product: prod, score });
    }
  }

  // 2. Filter by Category
  if (opts.category && opts.category.trim() !== '' && opts.category !== 'All Categories' && opts.category !== 'all') {
    const targetCat = opts.category.trim().toLowerCase();
    scoredItems = scoredItems.filter(({ product }) => {
      const catName = (typeof product.category === 'string' ? product.category : (product.category as any)?.name || '').toLowerCase();
      const catId = (product.categoryId || (product.category as any)?.slug || (product.category as any)?.id || '').toLowerCase();
      return catName === targetCat || catId === targetCat || catName.includes(targetCat) || catId.includes(targetCat);
    });
  }

  // 3. Filter by Brand
  if (opts.brand) {
    const brandsArr: string[] = Array.isArray(opts.brand)
      ? opts.brand.map(b => b.trim().toLowerCase()).filter(Boolean)
      : typeof opts.brand === 'string'
        ? opts.brand.split(',').map(b => b.trim().toLowerCase()).filter(Boolean)
        : [];

    if (brandsArr.length > 0) {
      scoredItems = scoredItems.filter(({ product }) => {
        const bName = (typeof product.brand === 'string' ? product.brand : (product.brand as any)?.name || '').toLowerCase();
        const bId = (product.brandId || (product.brand as any)?.slug || (product.brand as any)?.id || '').toLowerCase();
        return brandsArr.some(targetBrand => 
          bName === targetBrand || bId === targetBrand || bName.includes(targetBrand) || bId.includes(targetBrand)
        );
      });
    }
  }

  // 4. Filter by Price Range
  if (opts.minPrice !== undefined && opts.minPrice > 0) {
    const minP = Number(opts.minPrice);
    scoredItems = scoredItems.filter(({ product }) => Number(product.price || 0) >= minP);
  }
  if (opts.maxPrice !== undefined && opts.maxPrice < 100000) {
    const maxP = Number(opts.maxPrice);
    scoredItems = scoredItems.filter(({ product }) => Number(product.price || 0) <= maxP);
  }

  // 5. Filter by Stock Availability
  if (opts.inStock || opts.inStockOnly) {
    scoredItems = scoredItems.filter(({ product }) => Number(product.stock || 0) > 0);
  }

  // 6. Filter by Rating
  if (opts.ratingMin !== undefined && opts.ratingMin > 0) {
    const minR = Number(opts.ratingMin);
    scoredItems = scoredItems.filter(({ product }) => Number(product.rating || 0) >= minR);
  }

  // 7. Sort
  const sort = opts.sort || 'featured';
  if (sort === 'price-asc') {
    scoredItems.sort((a, b) => (a.product.price || 0) - (b.product.price || 0));
  } else if (sort === 'price-desc') {
    scoredItems.sort((a, b) => (b.product.price || 0) - (a.product.price || 0));
  } else if (sort === 'rating') {
    scoredItems.sort((a, b) => (b.product.rating || 0) - (a.product.rating || 0));
  } else if (sort === 'newest') {
    scoredItems.sort((a, b) => (b.product.isNew ? 1 : 0) - (a.product.isNew ? 1 : 0));
  } else {
    // Default: relevance / featured score descending, ties broken by rating
    scoredItems.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.product.rating || 0) - (a.product.rating || 0);
    });
  }

  const total = scoredItems.length;
  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.max(1, opts.pageSize || opts.limit || 20);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const startIndex = (page - 1) * pageSize;
  const paginatedProducts = scoredItems.slice(startIndex, startIndex + pageSize).map(item => item.product);

  return {
    products: paginatedProducts,
    total,
    page,
    pageSize,
    totalPages
  };
}
