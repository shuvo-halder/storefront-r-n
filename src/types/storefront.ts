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
  title: string;
  comment: string;
  verifiedPurchase: boolean;
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
  category: string;
  categoryId: string;
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
  subcategories?: { id: string; name: string; slug: string }[];
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: string;
  description?: string;
  featuredProductCount?: number;
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
  shippingFee: number;
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
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  trackingNumber?: string;
  trackingSteps?: OrderTrackingStep[];
  estimatedDeliveryDate?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  defaultAddress?: ShippingAddress;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSubtotal?: number;
  description: string;
}

export interface PublicSettings {
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
}

export interface ProductFilterState {
  searchQuery: string;
  categorySlug: string | null;
  brandSlugs: string[];
  minPrice: number;
  maxPrice: number;
  ratingMin: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
