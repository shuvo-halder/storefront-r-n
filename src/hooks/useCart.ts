'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storefrontApi } from '../services/storefrontApi';
import { Cart } from '../types/storefront';
import { useSettings } from '../context/SettingsContext';
import { useStorefront } from '../context/StorefrontContext';
import { 
  trackGA4AddToCart, 
  trackGA4RemoveFromCart, 
  trackGA4ViewCart 
} from '../utils/analytics';
import { formatPrice } from '../utils/formatters';

export const CART_QUERY_KEY = ['cart'];

export function useCart() {
  const queryClient = useQueryClient();
  const { notifyAddToCart, notifyInfo, notifySuccess, notifyError, setIsCartOpen } = useStorefront();

  let currency = 'BDT';
  try {
    const { settings } = useSettings();
    currency = settings?.general?.currency || 'BDT';
  } catch {
    // Fallback if rendered outside SettingsProvider
  }

  // GET /cart
  const { 
    data: cart = {
      items: [],
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      estimatedTax: 0,
      total: 0,
    }, 
    isLoading, 
    isFetching,
    error,
    refetch 
  } = useQuery<Cart>({
    queryKey: CART_QUERY_KEY,
    queryFn: storefrontApi.getCart,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // POST /cart/items
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1, variantId }: { productId: string; quantity?: number; variantId?: string }) => {
      // Stock check handling
      const updated = await storefrontApi.addToCart(productId, quantity, variantId);
      return { updated, productId, quantity, variantId };
    },
    onSuccess: ({ updated, productId, quantity }) => {
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, updated);
      
      const addedItem = updated.items.find(i => i.productId === productId);
      if (addedItem) {
        trackGA4AddToCart(addedItem, quantity, currency);
        notifyAddToCart({
          productName: addedItem.product.name,
          image: addedItem.selectedVariant?.image || addedItem.product.images?.[0],
          quantity: quantity,
          onViewCart: () => setIsCartOpen(true),
        });
      } else {
        notifySuccess('Added to Cart', `${quantity}× item added to your shopping bag.`, {
          badge: 'Cart',
          action: {
            label: 'View Cart',
            onClick: () => setIsCartOpen(true),
          }
        });
      }
    },
    onError: (err) => {
      notifyError(err, 'Could Not Add to Cart', 'We were unable to add this item to your cart. Please check stock availability.');
    }
  });

  // PUT /cart/items/:itemId
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const currentCart = queryClient.getQueryData<Cart>(CART_QUERY_KEY);
      const targetItem = currentCart?.items.find(i => i.id === itemId);
      const oldQuantity = targetItem?.quantity || 0;

      const updated = await storefrontApi.updateCartItem(itemId, quantity);
      return { updated, targetItem, oldQuantity, newQuantity: quantity };
    },
    onSuccess: ({ updated, targetItem, oldQuantity, newQuantity }) => {
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, updated);

      if (targetItem) {
        const diff = newQuantity - oldQuantity;
        if (diff > 0) {
          trackGA4AddToCart(targetItem, diff, currency);
        } else if (diff < 0) {
          trackGA4RemoveFromCart(targetItem, Math.abs(diff), currency);
        }
      }
    },
    onError: (err) => {
      notifyError(err, 'Quantity Update Failed', 'Unable to adjust item quantity. The maximum available stock may have been reached.');
    }
  });

  // DELETE /cart/items/:itemId
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const currentCart = queryClient.getQueryData<Cart>(CART_QUERY_KEY);
      const targetItem = currentCart?.items.find(i => i.id === itemId);
      
      const updated = await storefrontApi.removeCartItem(itemId);
      return { updated, targetItem };
    },
    onSuccess: ({ updated, targetItem }) => {
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, updated);
      if (targetItem) {
        trackGA4RemoveFromCart(targetItem, targetItem.quantity, currency);
        notifyInfo('Item Removed', `${targetItem.product.name} was removed from your cart.`, {
          badge: 'Cart',
          image: targetItem.selectedVariant?.image || targetItem.product.images?.[0]
        });
      } else {
        notifyInfo('Item Removed', 'Product was removed from your cart.');
      }
    },
    onError: (err) => {
      notifyError(err, 'Remove Failed', 'Unable to remove item from cart. Please refresh and try again.');
    }
  });

  // DELETE /cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const currentCart = queryClient.getQueryData<Cart>(CART_QUERY_KEY);
      const previousItems = currentCart?.items || [];
      const updated = await storefrontApi.clearCart();
      return { updated, previousItems };
    },
    onSuccess: ({ updated, previousItems }) => {
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, updated);
      previousItems.forEach(item => {
        trackGA4RemoveFromCart(item, item.quantity, currency);
      });
      notifyInfo('Cart Cleared', 'All items have been removed from your shopping bag.');
    },
    onError: (err) => {
      notifyError(err, 'Clear Cart Failed', 'Unable to clear cart.');
    }
  });

  // POST /cart/coupons
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const coupon = await storefrontApi.applyCoupon(code);
      const updatedCart = await storefrontApi.getCart();
      return { coupon, updatedCart, code };
    },
    onSuccess: ({ coupon, updatedCart, code }) => {
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, updatedCart);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      const discountVal = coupon?.discountAmount || updatedCart.discount || 0;
      const discountFormatted = discountVal > 0 ? formatPrice(discountVal, currency) : 'promo';
      notifySuccess('Coupon Applied!', `Code "${code.toUpperCase()}" has been applied. You saved ${discountFormatted}.`, {
        badge: 'Coupon'
      });
    },
    onError: (err) => {
      notifyError(err, 'Invalid Coupon Code', 'The entered promo code is invalid, expired, or does not meet minimum order requirements.');
    }
  });

  // Helper getters
  const totalItemCount = (cart.items || []).reduce((sum, item) => sum + item.quantity, 0);

  const viewCartGA4 = () => {
    trackGA4ViewCart(cart.items, cart.total, currency);
  };

  return {
    cart,
    isLoading,
    isFetching,
    error,
    refetch,
    totalItemCount,
    
    // Mutations
    addToCart: (productId: string, quantity: number = 1, variantId?: string) =>
      addToCartMutation.mutateAsync({ productId, quantity, variantId }),
    isAddingToCart: addToCartMutation.isPending,
    addToCartError: addToCartMutation.error,

    updateCartQuantity: (itemId: string, quantity: number) =>
      updateQuantityMutation.mutateAsync({ itemId, quantity }),
    updateQuantity: (itemId: string, quantity: number) =>
      updateQuantityMutation.mutateAsync({ itemId, quantity }),
    isUpdatingQuantity: updateQuantityMutation.isPending,

    removeCartItem: removeItemMutation.mutateAsync,
    isRemovingItem: removeItemMutation.isPending,

    clearCart: clearCartMutation.mutateAsync,
    isClearingCart: clearCartMutation.isPending,

    applyCoupon: applyCouponMutation.mutateAsync,
    isApplyingCoupon: applyCouponMutation.isPending,
    applyCouponError: applyCouponMutation.error,

    viewCartGA4,
  };
}
