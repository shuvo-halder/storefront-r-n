'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from './SmartImage';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { storefrontApi } from '../../services/storefrontApi';
import { Product, ProductVariant } from '../../types/storefront';
import { RatingStars } from './RatingStars';
import { 
  X, 
  ShoppingCart, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Check, 
  ArrowRight,
  Zap,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { 
    quickViewProduct, 
    closeQuickView, 
    toggleWishlist, 
    isInWishlist, 
    navigateTo,
    addToast 
  } = useStorefront();
  const { addToCart, isAddingToCart } = useCart();

  const [fullProduct, setFullProduct] = useState<Product | null>(quickViewProduct);
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(false);
  const [productError, setProductError] = useState<string | null>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingLocal, setIsAddingLocal] = useState<boolean>(false);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeQuickView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeQuickView]);

  // Fetch full product details on quickViewProduct change
  useEffect(() => {
    if (!quickViewProduct) return;

    let isMounted = true;
    const loadProductData = async () => {
      setIsLoadingProduct(true);
      setProductError(null);

      try {
        const data = await storefrontApi.getProductBySlug(quickViewProduct.slug);
        if (!isMounted) return;

        if (data) {
          setFullProduct(data);
          setSelectedImage(data.images[0] || quickViewProduct.images[0] || '/placeholder-product.png');
          
          if (data.variants && data.variants.length > 0) {
            const firstV = data.variants[0];
            setSelectedVariantId(firstV.id);
            if (firstV.image) setSelectedImage(firstV.image);
          } else {
            setSelectedVariantId(undefined);
          }
        } else {
          setFullProduct(quickViewProduct);
          setSelectedImage(quickViewProduct.images[0] || '/placeholder-product.png');
          if (quickViewProduct.variants && quickViewProduct.variants.length > 0) {
            setSelectedVariantId(quickViewProduct.variants[0].id);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Quick view product fetch error:', err);
        setFullProduct(quickViewProduct);
        setSelectedImage(quickViewProduct.images[0] || '/placeholder-product.png');
      } finally {
        if (isMounted) setIsLoadingProduct(false);
      }
    };

    setQuantity(1);
    loadProductData();

    return () => { isMounted = false; };
  }, [quickViewProduct?.id, quickViewProduct?.slug]);

  if (!quickViewProduct) return null;

  const currentProduct = fullProduct || quickViewProduct;
  const selectedVariant = currentProduct.variants?.find(v => v.id === selectedVariantId);

  const activePrice = selectedVariant ? selectedVariant.price : currentProduct.price;
  const activeComparePrice = selectedVariant?.compareAtPrice ?? currentProduct.compareAtPrice;
  const activeStock = selectedVariant ? selectedVariant.stock : currentProduct.stock;
  const activeSKU = selectedVariant?.sku || currentProduct.id;

  const inWishlist = isInWishlist(currentProduct.id);

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    if (variant.image) {
      setSelectedImage(variant.image);
    }
    if (variant.stock > 0) {
      setQuantity(prev => Math.min(prev, variant.stock));
    } else {
      setQuantity(1);
    }
  };

  const handleAddToCart = async () => {
    if (activeStock === 0) return;
    setIsAddingLocal(true);
    try {
      await addToCart(currentProduct.id, quantity, selectedVariantId);
      addToast({
        title: 'Added to Cart!',
        description: `${quantity}x ${currentProduct.name} added to your shopping bag.`,
        type: 'success',
      });
      closeQuickView();
    } catch (err: any) {
      addToast({
        title: 'Add to Cart Failed',
        description: err?.message || 'Could not add item to cart.',
        type: 'error'
      });
    } finally {
      setIsAddingLocal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={closeQuickView}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 z-10 overflow-hidden my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors z-20 cursor-pointer"
          title="Close (ESC)"
        >
          <X size={20} />
        </button>

        {isLoadingProduct ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <Loader2 size={36} className="animate-spin text-primary" />
            <p className="text-xs font-bold tracking-wider uppercase text-slate-600">
              Loading Product Specifications...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Gallery Side */}
            <div className="space-y-3">
              <div className="relative aspect-square bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden group">
                <SmartImage 
                  src={selectedImage || currentProduct.images[0]} 
                  alt={currentProduct.name} 
                  fill
                  fallbackType="product"
                  fallbackLabel={currentProduct.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                {currentProduct.discountPercent && (
                  <span className="absolute top-3 left-3 bg-primary text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-sm">
                    -{currentProduct.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnail switcher */}
              {currentProduct.images && currentProduct.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {currentProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-14 h-14 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                        selectedImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <SmartImage 
                        src={img} 
                        alt={`Thumbnail ${idx + 1}`} 
                        fill
                        fallbackType="product"
                        fallbackLabel={currentProduct.name}
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Side */}
            <div className="flex flex-col justify-between space-y-4">
              
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded">
                    {currentProduct.brand}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    SKU: <span className="font-bold text-slate-600">{activeSKU}</span>
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {currentProduct.name}
                </h2>

                <RatingStars rating={currentProduct.rating} count={currentProduct.reviewCount} />

                {/* Price Row */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    ${activePrice.toFixed(2)}
                  </span>
                  {activeComparePrice && activeComparePrice > activePrice && (
                    <span className="text-sm font-semibold text-slate-400 line-through font-mono">
                      ${activeComparePrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1">
                  {currentProduct.description}
                </p>
              </div>

              {/* Variants Selector */}
              {currentProduct.variants && currentProduct.variants.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-800">Select Option:</label>
                    <span className="text-slate-500 font-semibold">{selectedVariant?.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.variants.map((variant) => {
                      const isSelected = selectedVariantId === variant.id;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => handleSelectVariant(variant)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected 
                              ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary/30' 
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {variant.colorHex && (
                            <span 
                              className="w-3 h-3 rounded-full border border-slate-300 inline-block" 
                              style={{ backgroundColor: variant.colorHex }} 
                            />
                          )}
                          <span>{variant.name}</span>
                          {variant.stock === 0 && (
                            <span className="text-[10px] text-primary font-normal">(Out)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock status badge */}
              <div className="flex items-center gap-2 text-xs pt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${activeStock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-primary'}`} />
                <span className="font-extrabold text-slate-800">
                  {activeStock > 0 ? `In Stock (${activeStock} available)` : 'Currently Out of Stock'}
                </span>
              </div>

              {/* Quantity and Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  
                  {/* Quantity input */}
                  <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={activeStock === 0}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-200 rounded-l-xl transition-colors font-bold disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-800 font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                      disabled={activeStock === 0 || quantity >= activeStock}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-200 rounded-r-xl transition-colors font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={activeStock === 0 || isAddingLocal || isAddingToCart}
                    className="flex-1 py-3 px-4 bg-primary hover:bg-primary disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAddingLocal || isAddingToCart ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ShoppingCart size={16} />
                    )}
                    <span>
                      {activeStock === 0 
                        ? 'Out of Stock' 
                        : (isAddingLocal || isAddingToCart) ? 'Adding...' : 'Add to Cart'}
                    </span>
                  </button>

                  {/* Wishlist toggle */}
                  <button
                    onClick={() => toggleWishlist(currentProduct.id)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                      inWishlist 
                        ? 'bg-primary/5 border-primary/20 text-primary' 
                        : 'bg-white border-slate-200 text-slate-500 hover:text-primary'
                    }`}
                    title="Wishlist"
                  >
                    <Heart size={18} fill={inWishlist ? '#e11d48' : 'none'} />
                  </button>
                </div>

                {/* View Full Product Link */}
                <button
                  onClick={() => {
                    closeQuickView();
                    navigateTo('product-detail', { productSlug: currentProduct.slug });
                  }}
                  className="w-full text-center text-xs font-bold text-slate-600 hover:text-primary flex items-center justify-center gap-1 transition-colors py-1 cursor-pointer"
                >
                  <span>View Full Product Page & Specifications</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
