export interface ProductVariant {
  id: string;
  name: string; // e.g., "Color: Cosmic Black", "Storage: 256GB"
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
  colorHex?: string;
}

export interface ProductReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  title?: string;
  comment: string;
  verifiedPurchase?: boolean;
  images?: string[];
  phone?: string;
  email?: string;
  productName?: string;
  productSlug?: string;
  productImage?: string;
  adminResponse?: string;
}

export interface ReviewRatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  [key: number]: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: ReviewRatingDistribution;
  distribution?: ReviewRatingDistribution;
}

export interface ReviewPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
  stats?: ReviewStats;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewEligibilityResponse {
  eligible: boolean;
  message?: string;
  reason?: string;
  orderItemId?: string;
  availableSlots?: number;
  qualifyingOrderIds?: string[];
}

export interface ReviewFormState {
  name: string;
  phone?: string;
  email?: string;
  rating: number;
  title: string;
  comment: string;
  images: File[];
}

export interface ReviewSubmissionPayload {
  name: string;
  mobile: string;
  email?: string;
  rating: number;
  reviewHeadline?: string;
  reviewComment: string;
  images?: string[];
}

export interface FeaturedReview extends ProductReview {
  productName?: string;
  productSlug?: string;
  productImage?: string;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  brand: string;
  brandId?: string;
  brandSlug?: string;
  category: string;
  categoryId: string;
  categorySlug?: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  features: string[];
  specifications: ProductSpecification[];
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isDealOfDay?: boolean;
  dealEndTime?: string; // ISO date string
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  tags?: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  itemCount: number;
  iconName?: string;
  parentId?: string | null;
  subcategories?: { id: string; name: string; slug: string }[];
  children?: any[];
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: string;
  description?: string;
  featuredProductCount?: number;
  itemCount?: number;
}

export interface CartItem {
  id: string; // unique item id in cart
  productId: string;
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  appliedCoupon?: string;
  shippingFee?: number;
  estimatedTax: number;
  total: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomerAddress {
  id: string;
  customerId?: string;
  label?: string | null;
  fullName: string;
  email?: string;
  phone: string;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AddressFormData = Omit<CustomerAddress, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>;

export type OrderStatus = 'Placed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface OrderTrackingStep {
  status: OrderStatus;
  label: string;
  timestamp?: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string; // Order ID e.g. "ORD-94821"
  orderNumber?: string;
  createdAt: string;
  status: OrderStatus;
  orderStatus?: OrderStatus | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee?: number;
  tax: number;
  totalAmount: number;
  total?: number;
  trackingNumber?: string;
  trackingSteps?: OrderTrackingStep[];
  estimatedDeliveryDate?: string;
  returnStatus?: 'Not Requested' | 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  refundStatus?: 'None' | 'Pending' | 'Processed' | 'Failed';
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  items: {
    productId: string;
    quantity: number;
    reason: string;
    condition: string;
  }[];
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  createdAt: string;
}

export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  status: 'Pending' | 'Processed' | 'Failed';
  provider: string;
  reason: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  defaultAddress?: ShippingAddress;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSubtotal?: number;
  description: string;
}

export interface StoreBranding {
  siteName?: string | null;
  siteTitle?: string | null;
  siteTagline?: string | null;
  logoUrl: string;
  logoDarkUrl?: string | null;
  faviconUrl: string;
  adminPanelName?: string | null;
  adminPanelLogo?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  footerText?: string | null;
  defaultLanguage?: string;
  defaultCurrency?: string;
  defaultTimezone?: string;
}

export interface StoreSEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogImageUrl?: string;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  twitterHandle?: string | null;
  customHeadCode?: string | null;
}

export interface StoreShipping {
  freeShippingThreshold: number;
  flatRateShippingFee: number;
  insideDhakaCharge?: number;
  outsideDhakaCharge?: number;
  freeShippingEnabled?: boolean;
  estimatedDeliveryDays: string;
  currency?: string;
}

export interface StoreTax {
  taxEnabled: boolean;
  taxRate: number; // e.g. 0.08 for 8%
  defaultTaxRate?: number;
  pricesIncludeTax: boolean;
  enableTax?: boolean;
}

export interface StoreMarketing {
  gtmContainerId?: string;
  gtmId?: string;
  ga4MeasurementId?: string;
  ga4Id?: string;
  metaPixelId?: string;
  pixelId?: string;
  googleAdsId?: string;
  adsId?: string;
  googleAdsConversionId?: string;
  googleAdsConversionLabel?: string;
  tiktokPixelId?: string;
  hotjarId?: string;
}

export interface AnalyticsConfig {
  ga4MeasurementId: string;
  gtmContainerId: string;
  metaPixelId: string;
  googleAdsId: string;
  googleAdsConversionId: string;
  googleAdsConversionLabel: string;
  tiktokPixelId: string;
  hotjarId: string;
  enableAnalytics: boolean;
}

export interface StoreGeneral {
  siteName: string;
  siteTitle: string;
  currency: string;
  currencySymbol: string;
  storePhone: string;
  storeEmail: string;
  storeAddress?: string;
  whatsappOrderNumber?: string;
  callOrderNumber?: string;
}

export interface PublicSettings {
  branding: StoreBranding;
  seo: StoreSEO;
  shipping: StoreShipping;
  tax: StoreTax;
  general: StoreGeneral;
  marketing?: StoreMarketing;
  store?: {
    whatsappOrderNumber?: string;
    callOrderNumber?: string;
    supportPhone?: string;
    supportEmail?: string;
    address?: string;
    city?: string;
    country?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    tiktokUrl?: string;
    linkedinUrl?: string;
  };
  whatsappOrderNumber?: string;
  callOrderNumber?: string;
  // Deprecated fields kept for backward compatibility during migration
  siteName: string;
  siteTitle: string;
  logoUrl: string;
  faviconUrl: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  supportEmail: string;
  supportPhone: string;
  announcementBanner?: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
    whatsapp?: string;
    x?: string;
  };
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  relatedArticleSlugs?: string[];
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  lastUpdated?: string;
  status?: string;
  publishedAt?: string;
  updatedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Banner {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  price?: string;
  comparePrice?: string;
  discount?: string;
  image: string;
  desktopImage?: string;
  mobileImage?: string;
  buttonText?: string;
  ctaText?: string;
  linkUrl?: string;
  productSlug?: string;
  categorySlug?: string;
  type?: 'hero' | 'promo' | 'offer' | string;
  bgColor?: string;
  priority?: number;
  isActive?: boolean;
}

export interface SearchFacetCategory {
  slug: string;
  name: string;
  count: number;
}

export interface SearchFacetBrand {
  slug: string;
  name: string;
  count: number;
}

export interface SearchFacetsResponse {
  categories: SearchFacetCategory[];
  brands: SearchFacetBrand[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface SearchResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
  suggestions?: {
    categories?: Category[];
    brands?: Brand[];
  };
}

export interface ProductFilterState {
  searchQuery: string;
  categorySlug: string | null;
  brandSlugs: string[];
  minPrice: number;
  maxPrice: number;
  ratingMin: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
  page: number;
  pageSize: number;
}
