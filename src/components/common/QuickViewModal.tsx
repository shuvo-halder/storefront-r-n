'use client';

import React, { useState } from 'react';
import { SmartImage } from './SmartImage';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { RatingStars } from './RatingStars';
import { 
  X, 
  ShoppingCart, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Check, 
  ArrowRight,
  Zap
} from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, closeQuickView, toggleWishlist, isInWishlist, navigateTo } = useStorefront();
  const { addToCart } = useCart();

  if (!quickViewProduct) return null;

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    quickViewProduct.variants?.[0]?.id
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    quickViewProduct.images[0]
  );
  const [quantity, setQuantity] = useState<number>(1);

  const selectedVariant = quickViewProduct.variants?.find(v => v.id === selectedVariantId);
  const activePrice = selectedVariant ? selectedVariant.price : quickViewProduct.price;
  const inWishlist = isInWishlist(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct.id, quantity, selectedVariantId);
    closeQuickView();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={closeQuickView}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors z-20 cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Gallery Side */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden group">
              <SmartImage 
                src={selectedImage} 
                alt={quickViewProduct.name} 
                fill
                fallbackType="product"
                fallbackLabel={quickViewProduct.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              {quickViewProduct.discountPercent && (
                <span className="absolute top-3 left-3 bg-primary text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-sm">
                  -{quickViewProduct.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail switcher */}
            {quickViewProduct.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {quickViewProduct.images.map((img, idx) => (
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
                      fallbackLabel={quickViewProduct.name}
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Side */}
          <div className="flex flex-col justify-between space-y-4">
            
            <div className="space-y-2">
              <div className="text-xs font-bold text-primary uppercase tracking-wider">
                {quickViewProduct.brand}
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                {quickViewProduct.name}
              </h2>

              <RatingStars rating={quickViewProduct.rating} count={quickViewProduct.reviewCount} />

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-black text-primary">
                  ${activePrice.toFixed(2)}
                </span>
                {quickViewProduct.compareAtPrice && (
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    ${quickViewProduct.compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1">
                {quickViewProduct.description}
              </p>
            </div>

            {/* Variants */}
            {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800">Select Option:</label>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        if (variant.image) setSelectedImage(variant.image);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedVariantId === variant.id 
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
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${quickViewProduct.stock > 0 ? 'bg-emerald-500' : 'bg-primary'}`} />
              <span className="font-semibold text-slate-700">
                {quickViewProduct.stock > 0 ? `In Stock (${quickViewProduct.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity and Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity input */}
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-200 rounded-l-xl transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-200 rounded-r-xl transition-colors font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(quickViewProduct.id)}
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
                  navigateTo('product-detail', { productSlug: quickViewProduct.slug });
                }}
                className="w-full text-center text-xs font-bold text-slate-600 hover:text-primary flex items-center justify-center gap-1 transition-colors py-1 cursor-pointer"
              >
                <span>View Full Technical Specifications</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
