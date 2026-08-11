// GA4 Analytics helper for E-commerce tracking

export interface GA4CartItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
}

export const trackGA4Event = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: eventName,
      ...params,
    });
    
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, params);
    } else {
      console.log(`[GA4 Event Logged: ${eventName}]`, params);
    }
  }
};

export const trackGA4ViewCart = (items: any[], totalValue: number) => {
  const formattedItems: GA4CartItem[] = items.map(item => ({
    item_id: item.productId || item.id,
    item_name: item.product?.name || 'Product',
    price: item.unitPrice,
    quantity: item.quantity,
    item_brand: item.product?.brand,
    item_category: item.product?.category,
    item_variant: item.selectedVariant?.name,
  }));

  trackGA4Event('view_cart', {
    currency: 'USD',
    value: totalValue,
    items: formattedItems,
  });
};

export const trackGA4AddToCart = (item: any, quantity: number) => {
  const formattedItem: GA4CartItem = {
    item_id: item.productId || item.id || item.product?.id,
    item_name: item.product?.name || item.name || 'Product',
    price: item.unitPrice || item.price || 0,
    quantity: quantity,
    item_brand: item.product?.brand || item.brand,
    item_category: item.product?.category || item.category,
    item_variant: item.selectedVariant?.name,
  };

  trackGA4Event('add_to_cart', {
    currency: 'USD',
    value: (item.unitPrice || item.price || 0) * quantity,
    items: [formattedItem],
  });
};

export const trackGA4RemoveFromCart = (item: any) => {
  const formattedItem: GA4CartItem = {
    item_id: item.productId || item.id,
    item_name: item.product?.name || 'Product',
    price: item.unitPrice || 0,
    quantity: item.quantity || 1,
    item_brand: item.product?.brand,
    item_category: item.product?.category,
    item_variant: item.selectedVariant?.name,
  };

  trackGA4Event('remove_from_cart', {
    currency: 'USD',
    value: (item.unitPrice || 0) * (item.quantity || 1),
    items: [formattedItem],
  });
};

export const trackGA4BeginCheckout = (items: any[], totalValue: number) => {
  const formattedItems: GA4CartItem[] = items.map(item => ({
    item_id: item.productId || item.id,
    item_name: item.product?.name || 'Product',
    price: item.unitPrice,
    quantity: item.quantity,
    item_brand: item.product?.brand,
    item_category: item.product?.category,
    item_variant: item.selectedVariant?.name,
  }));

  trackGA4Event('begin_checkout', {
    currency: 'USD',
    value: totalValue,
    items: formattedItems,
  });
};

export const trackGA4Purchase = (order: any) => {
  const formattedItems: GA4CartItem[] = order.items.map((item: any) => ({
    item_id: item.productId,
    item_name: item.productName || 'Product',
    price: item.unitPrice,
    quantity: item.quantity,
    item_variant: item.variantName,
  }));

  trackGA4Event('purchase', {
    transaction_id: order.id,
    value: order.totalAmount,
    currency: 'USD',
    tax: order.tax,
    shipping: order.shippingFee,
    items: formattedItems,
  });
};
