import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storefrontApi } from '../services/storefrontApi';
import { Cart } from '../types/storefront';
import { 
  trackGA4AddToCart, 
  trackGA4RemoveFromCart, 
  trackGA4ViewCart 
} from '../utils/analytics';

export const CART_QUERY_KEY = ['cart'];

export function useCart() {
  const queryClient = useQueryClient();

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
        trackGA4AddToCart(addedItem, quantity);
      }
    },
  });

  // PUT /cart/items/:itemId
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const updated = await storefrontApi.updateCartItem(itemId, quantity);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, updated);
    },
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
        trackGA4RemoveFromCart(targetItem);
      }
    },
  });

  // DELETE /cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const updated = await storefrontApi.clearCart();
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, updated);
    },
  });

  // POST /cart/coupons
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const updated = await storefrontApi.applyCoupon(code);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, updated);
    },
  });

  // Helper getters
  const totalItemCount = (cart.items || []).reduce((sum, item) => sum + item.quantity, 0);

  const viewCartGA4 = () => {
    trackGA4ViewCart(cart.items, cart.total);
  };

  return {
    cart,
    isLoading,
    isFetching,
    error,
    refetch,
    totalItemCount,
    
    // Mutations
    addToCart: addToCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
    addToCartError: addToCartMutation.error,

    updateCartQuantity: updateQuantityMutation.mutateAsync,
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
