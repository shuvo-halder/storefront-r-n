// Centralized Analytics, DataLayer, Standalone GA4, Meta Pixel & Google Ads helper

import { AnalyticsConfig, PublicSettings, StoreMarketing } from '../types/storefront';
import { analyticsService } from '../services/analyticsService';
export { getGA4ClientAndSessionId, extractGA4ClientId, extractGA4SessionId, type GA4ClientAndSessionId } from '../lib/ga4';

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    _meta_q?: any[];
    ttq?: any;
  }
}

type ConfigSource = AnalyticsConfig | PublicSettings | StoreMarketing | null | undefined;

const extractMarketing = (source?: ConfigSource): any => {
  if (source && 'enableAnalytics' in source) return source; // AnalyticsConfig
  if (source && 'marketing' in source && source.marketing) return source.marketing; // PublicSettings
  if (source) return source; // StoreMarketing
  return analyticsService.getCachedConfig();
};

/**
 * Get GA4 Measurement ID safely from dynamic backend settings
 * Priority: Backend Config > empty string (NO env fallbacks)
 */
export const getGA4Id = (source?: ConfigSource): string => {
  const marketing = extractMarketing(source);
  if (marketing) {
    const backendId = marketing.ga4MeasurementId || marketing.ga4Id || marketing.googleAnalyticsId;
    if (backendId && typeof backendId === 'string' && backendId.trim()) {
      return backendId.trim();
    }
  }
  return '';
};

/**
 * Get GTM Container ID safely from dynamic backend settings
 * Priority: Backend Config > empty string (NO env fallbacks)
 */
export const getGTMId = (source?: ConfigSource): string => {
  const marketing = extractMarketing(source);
  if (marketing) {
    const backendId = marketing.gtmContainerId || marketing.gtmId || marketing.googleTagManagerId;
    if (backendId && typeof backendId === 'string' && backendId.trim()) {
      return backendId.trim();
    }
  }
  return '';
};

/**
 * Get Meta Pixel ID safely from dynamic backend settings
 * Priority: Backend Config > empty string
 */
export const getMetaPixelId = (source?: ConfigSource): string => {
  const marketing = extractMarketing(source);
  if (marketing) {
    const backendId = marketing.metaPixelId || marketing.pixelId || marketing.facebookPixelId;
    if (backendId && typeof backendId === 'string' && backendId.trim()) {
      return backendId.trim();
    }
  }
  return '';
};

/**
 * Get Google Ads ID safely from dynamic backend settings
 * Priority: Backend Config > empty string
 */
export const getGoogleAdsId = (source?: ConfigSource): string => {
  const marketing = extractMarketing(source);
  if (marketing) {
    const backendId = marketing.googleAdsId || marketing.adsId || marketing.googleAdsConversionId;
    if (backendId && typeof backendId === 'string' && backendId.trim()) {
      return backendId.trim();
    }
  }
  return '';
};

/**
 * Get Google Ads Conversion ID safely from dynamic backend settings
 */
export const getGoogleAdsConversionId = (source?: ConfigSource): string => {
  const marketing = extractMarketing(source);
  if (marketing) {
    const backendId = marketing.googleAdsConversionId || marketing.googleAdsId || marketing.adsId;
    if (backendId && typeof backendId === 'string' && backendId.trim()) {
      return backendId.trim();
    }
  }
  return '';
};

/**
 * Get Google Ads Conversion Label safely from dynamic backend settings
 */
export const getGoogleAdsConversionLabel = (source?: ConfigSource): string => {
  const marketing = extractMarketing(source);
  if (marketing && marketing.googleAdsConversionLabel && typeof marketing.googleAdsConversionLabel === 'string') {
    return marketing.googleAdsConversionLabel.trim();
  }
  return '';
};

/**
 * Get TikTok Pixel ID safely from dynamic backend settings
 */
export const getTikTokPixelId = (source?: ConfigSource): string => {
  const marketing = extractMarketing(source);
  if (marketing && marketing.tiktokPixelId && typeof marketing.tiktokPixelId === 'string') {
    return marketing.tiktokPixelId.trim();
  }
  return '';
};

/**
 * Get Hotjar ID safely from dynamic backend settings
 */
export const getHotjarId = (source?: ConfigSource): string => {
  const marketing = extractMarketing(source);
  if (marketing && marketing.hotjarId && typeof marketing.hotjarId === 'string') {
    return marketing.hotjarId.trim();
  }
  return '';
};

/**
 * Push an event or payload to window.dataLayer cleanly, GTM-compliant, and SSR-safely.
 * 1. Pushes { ecommerce: null } prior to any ecommerce event to prevent state leakage.
 * 2. Pushes payload to window.dataLayer (for GTM).
 * 3. Bridges event to window.gtag (for standalone GA4) if gtag exists.
 */
export const pushToDataLayer = (payload: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  if (!analyticsService.isAnalyticsEnabled()) return;

  window.dataLayer = window.dataLayer || [];

  // GTM Ecommerce Spec: Clear previous ecommerce state if this event contains ecommerce data
  if (payload.ecommerce) {
    window.dataLayer.push({ ecommerce: null });
  }

  const hasGTM = Boolean(getGTMId());

  if (hasGTM) {
    // 1. GTM is present: GTM expects plain objects
    window.dataLayer.push(payload);
  } else {
    // 2. Standalone GA4/Ads: gtag expects arguments array format via window.gtag
    if (payload.event) {
      if (typeof window.gtag !== 'function') {
        window.gtag = function() { window.dataLayer.push(arguments); };
      }
      if (payload.ecommerce) {
        window.gtag('event', payload.event, payload.ecommerce);
      } else {
        const { event, ...rest } = payload;
        window.gtag('event', event, rest);
      }
    } else {
      // Non-event pushes
      window.dataLayer.push(payload);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics Dispatch]', payload);
  }
};

/**
 * Safely dispatch an event to Meta Pixel (fbq) if initialized.
 */
export const trackMetaEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  if (!analyticsService.isAnalyticsEnabled()) return;

  if (typeof window.fbq === 'function') {
    window.fbq('track', eventName, params);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Meta Pixel Track]', eventName, params);
    }
  } else {
    window._meta_q = window._meta_q || [];
    window._meta_q.push(params ? ['track', eventName, params] : ['track', eventName]);
  }
};

/**
 * Safely dispatch an event to TikTok Pixel (ttq) if initialized.
 */
export const trackTikTokEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  if (!analyticsService.isAnalyticsEnabled()) return;

  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track(eventName, params);
    if (process.env.NODE_ENV === 'development') {
      console.log('[TikTok Pixel Track]', eventName, params);
    }
  } else {
    window.ttq = window.ttq || [];
    window.ttq.push(['track', eventName, params || {}]);
  }
};

/**
 * Safely dispatch pageview to TikTok Pixel (ttq).
 */
export const trackTikTokPageView = () => {
  if (typeof window === 'undefined') return;
  if (!analyticsService.isAnalyticsEnabled()) return;

  if (window.ttq && typeof window.ttq.page === 'function') {
    window.ttq.page();
  } else {
    window.ttq = window.ttq || [];
    window.ttq.push(['page']);
  }
};

/**
 * Safely dispatch a purchase conversion to Google Ads.
 */
export const trackGoogleAdsPurchaseConversion = (
  order: any, 
  currency: string = 'BDT', 
  conversionId: string, 
  conversionLabel: string
) => {
  if (typeof window === 'undefined') return;
  if (!order || !conversionId || !conversionLabel) return;

  // If GTM is present, it is the authoritative Google Tag transport.
  // GTM will listen to the standard 'purchase' dataLayer event.
  // We abort direct Google Ads conversion to prevent duplicate firing.
  if (getGTMId()) {
    return;
  }

  const rawOrderNumber = order.orderNumber;
  const transactionId = rawOrderNumber && typeof rawOrderNumber === 'string'
    ? rawOrderNumber.trim()
    : rawOrderNumber
    ? String(rawOrderNumber).trim()
    : '';

  if (!transactionId) return;

  // Deduplication check
  const storageKey = `gads_purchase_tracked_${transactionId}`;
  try {
    if (
      window.sessionStorage.getItem(storageKey) === 'true' ||
      window.localStorage.getItem(storageKey) === 'true'
    ) {
      return;
    }
  } catch (e) {
    // Storage access blocked or restricted
  }

  const rawItems = Array.isArray(order.items) ? order.items : [];
  const value = typeof order.total === 'number' 
    ? order.total 
    : parseFloat(order.total || '0');

  // Push to gtag
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: `${conversionId}/${conversionLabel}`,
      value: isNaN(value) ? 0 : value,
      currency: currency,
      transaction_id: transactionId,
    });
    
    try {
      window.sessionStorage.setItem(storageKey, 'true');
      window.localStorage.setItem(storageKey, 'true');
    } catch (e) {
      // Storage access blocked
    }
  } else {
    // Queue it
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'conversion',
      send_to: `${conversionId}/${conversionLabel}`,
      value: isNaN(value) ? 0 : value,
      currency: currency,
      transaction_id: transactionId,
    });

    try {
      window.sessionStorage.setItem(storageKey, 'true');
      window.localStorage.setItem(storageKey, 'true');
    } catch (e) {}
  }
};

export interface GA4Item {
  item_id: string;
  item_name: string;
  price?: number;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  quantity?: number;
  index?: number;
  [key: string]: any;
}

/**
 * Centralized product to GA4 item mapper.
 * Only includes fields that are available; never invents values.
 */
export const productToGA4Item = (
  product: any,
  options?: { index?: number; quantity?: number; variant?: string }
): GA4Item => {
  if (!product) {
    return {
      item_id: '',
      item_name: 'Unknown Product',
    };
  }

  const itemId = String(product.id || product.productId || product.slug || '');
  const itemName = String(product.name || product.title || product.productName || 'Product');

  const item: GA4Item = {
    item_id: itemId,
    item_name: itemName,
  };

  const rawPrice = product.price ?? product.unitPrice;
  if (rawPrice !== undefined && rawPrice !== null) {
    const numericPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice);
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      item.price = numericPrice;
    }
  }

  if (product.brand) {
    item.item_brand = String(product.brand);
  }

  if (product.category) {
    item.item_category = String(product.category);
  }

  const variantName = options?.variant || product.selectedVariant?.name || product.variantName;
  if (variantName) {
    item.item_variant = String(variantName);
  }

  if (typeof options?.quantity === 'number') {
    item.quantity = options.quantity;
  }

  if (typeof options?.index === 'number') {
    item.index = options.index;
  }

  return item;
};

export interface GA4CartItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
}

export const cartItemToGA4Item = (
  item: any,
  options?: { quantity?: number; variant?: string; index?: number }
): GA4Item => {
  if (!item) {
    return {
      item_id: '',
      item_name: 'Unknown Product',
    };
  }

  const productObj = item.product || item;

  const itemId = String(item.productId || productObj.id || productObj.productId || item.id || '');
  const itemName = String(productObj.name || item.productName || item.name || 'Product');

  const ga4Item: GA4Item = {
    item_id: itemId,
    item_name: itemName,
  };

  const rawPrice = item.unitPrice ?? productObj.price ?? item.price;
  if (rawPrice !== undefined && rawPrice !== null) {
    const numericPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice);
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      ga4Item.price = numericPrice;
    }
  }

  const qty = options?.quantity ?? item.quantity;
  if (typeof qty === 'number' && qty > 0) {
    ga4Item.quantity = qty;
  }

  const brand = productObj.brand || item.brand;
  if (brand) {
    ga4Item.item_brand = String(brand);
  }

  const category = productObj.category || item.category;
  if (category) {
    ga4Item.item_category = String(category);
  }

  const variantName =
    options?.variant ||
    item.selectedVariant?.name ||
    item.variantName ||
    productObj.selectedVariant?.name;
  if (variantName) {
    ga4Item.item_variant = String(variantName);
  }

  if (typeof options?.index === 'number') {
    ga4Item.index = options.index;
  }

  return ga4Item;
};

/**
 * 1. view_item_list
 * Structure: { event: "view_item_list", ecommerce: { item_list_id, item_list_name, items } }
 */
export const trackGA4Search = (searchTerm: string) => {
  try {
    if (!searchTerm) return;
    pushToDataLayer({
      event: 'search',
      search_term: searchTerm,
    });

    trackMetaEvent('Search', { search_string: searchTerm });
    
    trackTikTokEvent('Search', {
      query: searchTerm,
    });
  } catch (err) {
    console.error('[GA4 search error]', err);
  }
};

export const trackGA4ViewItemList = (
  listId: string,
  listName: string,
  products: any[]
) => {
  try {
    if (!products || !Array.isArray(products) || products.length === 0) return;

    const items = products.map((prod, idx) =>
      productToGA4Item(prod, { index: idx + 1 })
    );

    pushToDataLayer({
      event: 'view_item_list',
      ecommerce: {
        item_list_id: listId || 'product_list',
        item_list_name: listName || 'Product List',
        items,
      },
    });
  } catch (err) {
    console.error('[GA4 view_item_list error]', err);
  }
};

/**
 * 2. select_item
 * Structure: { event: "select_item", ecommerce: { item_list_id, item_list_name, items } }
 */
export const trackGA4SelectItem = (
  listId: string,
  listName: string,
  product: any,
  index?: number
) => {
  try {
    if (!product) return;

    const item = productToGA4Item(product, { index });

    pushToDataLayer({
      event: 'select_item',
      ecommerce: {
        item_list_id: listId || 'product_list',
        item_list_name: listName || 'Product List',
        items: [item],
      },
    });
  } catch (err) {
    console.error('[GA4 select_item error]', err);
  }
};

/**
 * 3. view_item
 * Structure: { event: "view_item", ecommerce: { currency, value, items } }
 * Maps to Meta ViewContent
 */
export const trackGA4ViewItem = (
  product: any,
  currency: string = 'BDT'
) => {
  try {
    if (!product) return;

    const item = productToGA4Item(product);
    const rawPrice = product.price ?? product.unitPrice;
    const numericPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice || '0');
    const val = !isNaN(numericPrice) ? numericPrice : 0;

    pushToDataLayer({
      event: 'view_item',
      ecommerce: {
        currency: currency || 'BDT',
        value: val,
        items: [item],
      },
    });

    // Meta ViewContent mapping
    trackMetaEvent('ViewContent', {
      content_ids: [item.item_id],
      content_name: item.item_name,
      content_type: 'product',
      value: val,
      currency: currency || 'BDT',
    });

    // TikTok ViewContent mapping
    trackTikTokEvent('ViewContent', {
      contents: [{
        content_id: item.item_id,
        content_name: item.item_name,
        price: val,
        quantity: 1,
      }],
      content_type: 'product',
      value: val,
      currency: currency || 'BDT',
    });
  } catch (err) {
    console.error('[GA4 view_item error]', err);
  }
};

/**
 * Generic event tracker delegating to pushToDataLayer.
 */
export const trackGA4Event = (eventName: string, params?: Record<string, any>) => {
  pushToDataLayer({
    event: eventName,
    ...params,
  });
};

export const trackGA4ViewCart = (
  items: any[],
  totalValue: number,
  currency: string = 'BDT'
) => {
  try {
    if (!items || !Array.isArray(items)) return;

    const formattedItems = items.map((item, idx) =>
      cartItemToGA4Item(item, { index: idx + 1 })
    );

    pushToDataLayer({
      event: 'view_cart',
      ecommerce: {
        currency: currency || 'BDT',
        value: typeof totalValue === 'number' ? totalValue : parseFloat(totalValue || '0'),
        items: formattedItems,
      },
    });
  } catch (err) {
    console.error('[GA4 view_cart error]', err);
  }
};

/**
 * add_to_cart
 * Maps to Meta AddToCart
 */
export const trackGA4AddToCart = (
  item: any,
  quantity: number = 1,
  currency: string = 'BDT'
) => {
  try {
    if (!item) return;

    const formattedItem = cartItemToGA4Item(item, { quantity });
    const unitPrice = formattedItem.price || 0;
    const totalVal = unitPrice * (formattedItem.quantity || quantity || 1);

    pushToDataLayer({
      event: 'add_to_cart',
      ecommerce: {
        currency: currency || 'BDT',
        value: totalVal,
        items: [formattedItem],
      },
    });

    // Meta AddToCart mapping
    trackMetaEvent('AddToCart', {
      content_ids: [formattedItem.item_id],
      content_name: formattedItem.item_name,
      content_type: 'product',
      value: totalVal,
      currency: currency || 'BDT',
    });

    // TikTok AddToCart mapping
    trackTikTokEvent('AddToCart', {
      contents: [{
        content_id: formattedItem.item_id,
        content_name: formattedItem.item_name,
        price: unitPrice,
        quantity: quantity,
      }],
      content_type: 'product',
      value: totalVal,
      currency: currency || 'BDT',
    });
  } catch (err) {
    console.error('[GA4 add_to_cart error]', err);
  }
};

export const trackGA4RemoveFromCart = (
  item: any,
  quantityRemoved?: number,
  currency: string = 'BDT'
) => {
  try {
    if (!item) return;

    const qty = quantityRemoved ?? item.quantity ?? 1;
    const formattedItem = cartItemToGA4Item(item, { quantity: qty });
    const unitPrice = formattedItem.price || 0;
    const totalVal = unitPrice * qty;

    pushToDataLayer({
      event: 'remove_from_cart',
      ecommerce: {
        currency: currency || 'BDT',
        value: totalVal,
        items: [formattedItem],
      },
    });
  } catch (err) {
    console.error('[GA4 remove_from_cart error]', err);
  }
};

/**
 * add_to_wishlist
 * Maps to Meta AddToWishlist
 */
export const trackGA4AddToWishlist = (
  item: any,
  currency: string = 'BDT'
) => {
  try {
    if (!item) return;

    const formattedItem = cartItemToGA4Item(item, { quantity: 1 });
    const unitPrice = formattedItem.price || 0;

    pushToDataLayer({
      event: 'add_to_wishlist',
      ecommerce: {
        currency: currency || 'BDT',
        value: unitPrice,
        items: [formattedItem],
      },
    });

    // Meta AddToWishlist mapping
    trackMetaEvent('AddToWishlist', {
      content_ids: [formattedItem.item_id],
      content_name: formattedItem.item_name,
      content_type: 'product',
      value: unitPrice,
      currency: currency || 'BDT',
    });
  } catch (err) {
    console.error('[GA4 add_to_wishlist error]', err);
  }
};

/**
 * begin_checkout
 * Maps to Meta InitiateCheckout
 */
export const trackGA4BeginCheckout = (
  items: any[],
  totalValue: number,
  currency: string = 'BDT',
  coupon?: string
) => {
  try {
    if (!items || !Array.isArray(items)) return;

    const formattedItems = items.map((item, idx) =>
      cartItemToGA4Item(item, { index: idx + 1 })
    );

    const val = typeof totalValue === 'number' ? totalValue : parseFloat(totalValue || '0');

    pushToDataLayer({
      event: 'begin_checkout',
      ecommerce: {
        currency: currency || 'BDT',
        value: val,
        ...(coupon ? { coupon } : {}),
        items: formattedItems,
      },
    });

    // Meta InitiateCheckout mapping
    trackMetaEvent('InitiateCheckout', {
      content_ids: formattedItems.map((i) => i.item_id),
      content_type: 'product',
      value: val,
      num_items: formattedItems.length,
      currency: currency || 'BDT',
    });

    // TikTok InitiateCheckout mapping
    trackTikTokEvent('InitiateCheckout', {
      contents: formattedItems.map((i) => ({
        content_id: i.item_id,
        content_name: i.item_name,
        price: i.price || 0,
        quantity: i.quantity || 1,
      })),
      content_type: 'product',
      value: val,
      currency: currency || 'BDT',
    });
  } catch (err) {
    console.error('[GA4 begin_checkout error]', err);
  }
};

export const trackGA4AddShippingInfo = (
  items: any[],
  totalValue: number,
  shippingTier: string,
  currency: string = 'BDT',
  coupon?: string
) => {
  try {
    if (!items || !Array.isArray(items)) return;

    const formattedItems = items.map((item, idx) =>
      cartItemToGA4Item(item, { index: idx + 1 })
    );

    pushToDataLayer({
      event: 'add_shipping_info',
      ecommerce: {
        currency: currency || 'BDT',
        value: typeof totalValue === 'number' ? totalValue : parseFloat(totalValue || '0'),
        ...(coupon ? { coupon } : {}),
        shipping_tier: shippingTier || 'Standard Shipping',
        items: formattedItems,
      },
    });
  } catch (err) {
    console.error('[GA4 add_shipping_info error]', err);
  }
};

export const trackGA4AddPaymentInfo = (
  items: any[],
  totalValue: number,
  paymentType: string,
  currency: string = 'BDT',
  coupon?: string
) => {
  try {
    if (!items || !Array.isArray(items)) return;

    const formattedItems = items.map((item, idx) =>
      cartItemToGA4Item(item, { index: idx + 1 })
    );

    pushToDataLayer({
      event: 'add_payment_info',
      ecommerce: {
        currency: currency || 'BDT',
        value: typeof totalValue === 'number' ? totalValue : parseFloat(totalValue || '0'),
        ...(coupon ? { coupon } : {}),
        payment_type: paymentType || 'cod',
        items: formattedItems,
      },
    });
  } catch (err) {
    console.error('[GA4 add_payment_info error]', err);
  }
};

/**
 * purchase
 * Maps to Meta Purchase
 * Canonical Transaction ID: order.orderNumber (REQUIRED for GA4 Measurement Protocol attribution alignment)
 * NEVER falls back to order.id. If orderNumber is missing, safely skips tracking with diagnostic log.
 */
export const trackGA4Purchase = (order: any, currency: string = 'BDT') => {
  try {
    if (!order) return;

    // Canonical Transaction ID: strictly order.orderNumber for alignment with backend GA4 Measurement Protocol
    const rawOrderNumber = order.orderNumber;
    const transactionId =
      rawOrderNumber && typeof rawOrderNumber === 'string'
        ? rawOrderNumber.trim()
        : rawOrderNumber
        ? String(rawOrderNumber).trim()
        : '';

    if (!transactionId) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[Analytics] trackGA4Purchase skipped: canonical order.orderNumber is missing. Storefront purchase events strictly require order.orderNumber to align with backend GA4 Measurement Protocol attribution.',
          order
        );
      }
      return;
    }

    // Deduplication check using sessionStorage & localStorage
    const storageKey = `purchase_tracked_${transactionId}`;
    if (typeof window !== 'undefined') {
      try {
        if (
          window.sessionStorage.getItem(storageKey) === 'true' ||
          window.localStorage.getItem(storageKey) === 'true'
        ) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Purchase event already tracked for transaction_id ${transactionId}. Deduplicated.`);
          }
          return; // Already tracked for this transaction
        }
      } catch (e) {
        // Storage access blocked or restricted
      }
    }

    const rawItems = Array.isArray(order.items) ? order.items : [];
    const formattedItems = rawItems.map((item: any, idx: number) => {
      const itemPrice = typeof item.unitPrice === 'number'
        ? item.unitPrice
        : (typeof item.price === 'number' ? item.price : parseFloat(item.unitPrice || item.price || '0'));

      const itemQty = typeof item.quantity === 'number'
        ? item.quantity
        : parseInt(item.quantity || '1', 10);

      return cartItemToGA4Item(
        {
          productId: item.productId || item.id,
          id: item.productId || item.id,
          product: {
            id: item.productId || item.id,
            name: item.productName || item.name || 'Product',
            price: itemPrice,
            images: item.productImage ? [item.productImage] : [],
            category: item.category || item.productCategory || item.product?.category,
            brand: item.brand || item.productBrand || item.product?.brand,
          },
          unitPrice: itemPrice,
          quantity: itemQty,
          selectedVariant: item.variantName || item.selectedVariant
            ? { name: typeof item.variantName === 'string' ? item.variantName : item.selectedVariant?.name }
            : undefined,
        },
        { index: idx + 1 }
      );
    });

    const couponCode = order.coupon || order.couponCode || order.discountCode || order.appliedCoupon;
    const value = typeof order.totalAmount === 'number'
      ? order.totalAmount
      : (typeof order.total === 'number' ? order.total : parseFloat(order.totalAmount || order.total || '0'));
    
    const tax = typeof order.tax === 'number'
      ? order.tax
      : parseFloat(order.tax || '0');
    
    const shipping = typeof order.shippingFee === 'number'
      ? order.shippingFee
      : (typeof order.shipping === 'number' ? order.shipping : parseFloat(order.shippingFee || order.shipping || '0'));

    pushToDataLayer({
      event: 'purchase',
      ecommerce: {
        transaction_id: transactionId,
        value: isNaN(value) ? 0 : value,
        currency: currency || 'BDT',
        tax: isNaN(tax) ? 0 : tax,
        shipping: isNaN(shipping) ? 0 : shipping,
        ...(couponCode ? { coupon: String(couponCode) } : {}),
        items: formattedItems,
      },
    });

    // Meta Purchase mapping
    trackMetaEvent('Purchase', {
      content_ids: formattedItems.map((i) => i.item_id),
      content_type: 'product',
      value: isNaN(value) ? 0 : value,
      currency: currency || 'BDT',
      num_items: formattedItems.length,
    });

    // TikTok Purchase mapping
    trackTikTokEvent('CompletePayment', {
      contents: formattedItems.map((i) => ({
        content_id: i.item_id,
        content_name: i.item_name,
        price: i.price || 0,
        quantity: i.quantity || 1,
      })),
      content_type: 'product',
      value: isNaN(value) ? 0 : value,
      currency: currency || 'BDT',
    });

    // Dispatch Google Ads conversion
    const config = analyticsService.getCachedConfig();
    if (config?.googleAdsConversionId && config?.googleAdsConversionLabel) {
      trackGoogleAdsPurchaseConversion(
        order,
        currency,
        config.googleAdsConversionId,
        config.googleAdsConversionLabel
      );
    }
    
    // Mark transaction as tracked
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(storageKey, 'true');
        window.localStorage.setItem(storageKey, 'true');
      } catch (e) {
        // Storage access blocked or restricted
      }
    }
  } catch (err) {
    console.error('[GA4 purchase error]', err);
  }
};

export const trackGA4WhatsAppClick = (productName: string) => {
  try {
    pushToDataLayer({
      event: 'whatsapp_order_click',
      ecommerce: {
        product_name: productName
      },
    });
  } catch (err) {
    console.error('[GA4 whatsapp_order_click error]', err);
  }
};

export const trackGA4CallClick = (productName: string) => {
  try {
    pushToDataLayer({
      event: 'call_order_click',
      ecommerce: {
        product_name: productName
      },
    });
  } catch (err) {
    console.error('[GA4 call_order_click error]', err);
  }
};

export const trackGA4Refund = (
  refundData: {
    id?: string;
    refundId?: string;
    orderId?: string;
    transactionId?: string;
    amount?: number;
    value?: number;
    coupon?: string;
    items?: any[];
  },
  currency: string = 'BDT'
) => {
  try {
    if (!refundData) return;

    const transactionId = String(
      refundData.orderId || refundData.transactionId || refundData.id || ''
    );
    if (!transactionId) return;

    const refundId = String(refundData.id || refundData.refundId || transactionId);

    // Deduplication check for refund using refundId / transactionId
    const storageKey = `refund_tracked_${refundId}`;
    if (typeof window !== 'undefined') {
      try {
        if (
          window.sessionStorage.getItem(storageKey) === 'true' ||
          window.localStorage.getItem(storageKey) === 'true'
        ) {
          return; // Already tracked for this refund
        }
      } catch (e) {
        // Storage access blocked or restricted
      }
    }

    const rawItems = Array.isArray(refundData.items) ? refundData.items : [];
    const formattedItems = rawItems.map((item: any, idx: number) =>
      cartItemToGA4Item(item, { index: idx + 1 })
    );

    const value = typeof refundData.amount === 'number'
      ? refundData.amount
      : (typeof refundData.value === 'number' ? refundData.value : parseFloat(String(refundData.amount || refundData.value || '0')));

    const couponCode = refundData.coupon;

    pushToDataLayer({
      event: 'refund',
      ecommerce: {
        transaction_id: transactionId,
        value: isNaN(value) ? 0 : value,
        currency: currency || 'BDT',
        ...(couponCode ? { coupon: String(couponCode) } : {}),
        items: formattedItems,
      },
    });

    // Mark refund as tracked
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(storageKey, 'true');
        window.localStorage.setItem(storageKey, 'true');
      } catch (e) {
        // Storage access blocked or restricted
      }
    }
  } catch (err) {
    console.error('[GA4 refund error]', err);
  }
};
