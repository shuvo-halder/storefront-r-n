'use client';

import React from 'react';
import { SmartImage } from './SmartImage';
import { Product } from '../../types/storefront';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { RatingStars } from './RatingStars';
import { Heart, Eye, ShoppingCart, Sparkles, Zap, Loader2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard = React.memo(({ 
  product, 
  viewMode = 'grid' 
}: ProductCardProps) => {
  const { 
    toggleWishlist, 
    isInWishlist, 
    openQuickView, 
    navigateTo 
  } = useStorefront();

  const { addToCart, isAddingToCart } = useCart();

  const inWishlist = isInWishlist(product.id);
  const secondImage = product.images[1] || product.images[0];

  const [isLocalAdding, setIsLocalAdding] = React.useState(false);

  const handleCardClick = () => {
    navigateTo('product-detail', { productSlug: product.slug });
  };

  const onAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocalAdding(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setIsLocalAdding(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="group bg-white border border-border-default rounded-[2rem] p-5 shadow-premium hover:shadow-xl hover:border-accent/20 transition-all duration-300 flex flex-col sm:flex-row items-stretch gap-6 relative overflow-hidden">
        {/* Badges */}
        {product.discountPercent && (
          <div className="absolute top-4 left-4 bg-accent text-white font-black text-[10px] px-3 py-1 rounded-full shadow-accent z-10">
            -{product.discountPercent}%
          </div>
        )}

        {/* Thumbnail */}
        <div 
          onClick={handleCardClick}
          className="w-full sm:w-56 h-56 bg-surface rounded-2xl overflow-hidden relative flex-shrink-0 cursor-pointer"
        >
          <SmartImage 
            src={product.images[0]} 
            alt={product.name} 
            fill
            fallbackType="product"
            fallbackLabel={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                {product.brand}
              </span>
              <RatingStars rating={product.rating} count={product.reviewCount} />
            </div>

            <h3 
              onClick={handleCardClick}
              className="font-display font-bold text-xl text-primary group-hover:text-accent transition-colors cursor-pointer mt-2"
            >
              {product.name}
            </h3>

            <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border-default mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-primary">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-slate-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openQuickView(product)}
                className="p-3 bg-surface hover:bg-slate-200 text-primary rounded-xl transition-colors cursor-pointer"
                title="Quick View"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  inWishlist ? 'bg-accent-muted border-accent/20 text-accent' : 'bg-surface border-transparent text-slate-600 hover:text-accent'
                }`}
                title="Wishlist"
              >
                <Heart size={18} fill={inWishlist ? '#DC2B53' : 'none'} />
              </button>
              <button
                onClick={onAddToCart}
                disabled={isLocalAdding || isAddingToCart}
                className="py-3 px-6 bg-primary hover:bg-accent text-white font-bold text-sm rounded-xl shadow-premium transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLocalAdding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                <span>{isLocalAdding ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white border border-slate-100 rounded-[2rem] p-4 shadow-premium hover:shadow-2xl hover:border-accent/10 transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
      
      {/* Badges Top Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
        {product.discountPercent && (
          <span className="bg-accent text-white font-black text-[9px] px-3 py-1 rounded-full shadow-lg shadow-accent/20 tracking-widest uppercase">
            -{product.discountPercent}%
          </span>
        )}
        {product.isNew && (
          <span className="bg-[#101A25] text-white font-black text-[9px] uppercase px-3 py-1 rounded-full shadow-lg tracking-widest">
            NEW
          </span>
        )}
      </div>

      {/* Wishlist Button Top Right */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all shadow-premium cursor-pointer ${
          inWishlist 
            ? 'bg-white/90 text-accent shadow-accent scale-110' 
            : 'bg-white/80 text-slate-400 hover:text-accent hover:bg-white'
        }`}
        aria-label="Wishlist"
      >
        <Heart size={18} fill={inWishlist ? '#DC2B53' : 'none'} />
      </button>

      {/* Image Gallery Stage with Quick View Overlay */}
      <div 
        onClick={handleCardClick}
        className="relative aspect-square bg-surface rounded-2xl overflow-hidden cursor-pointer group/img mb-4"
      >
        <SmartImage 
          src={product.images[0]} 
          alt={product.name} 
          fill
          fallbackType="product"
          fallbackLabel={product.name}
          className="w-full h-full object-cover transition-opacity duration-300 group-hover/img:opacity-0" 
        />
        {secondImage && (
          <SmartImage 
            src={secondImage} 
            alt={product.name} 
            fill
            fallbackType="product"
            fallbackLabel={product.name}
            className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/img:opacity-100 group-hover/img:scale-105" 
          />
        )}

        {/* Quick View Hover Trigger */}
        <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            className="w-full py-3 px-4 bg-white/95 hover:bg-white text-primary font-bold text-xs rounded-xl shadow-xl flex items-center justify-center gap-2 transition-colors cursor-pointer backdrop-blur-md"
          >
            <Eye size={16} className="text-accent" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="text-accent uppercase tracking-widest">{product.brand}</span>
            <RatingStars rating={product.rating} count={product.reviewCount} showNumber={false} />
          </div>

          <h3 
            onClick={handleCardClick}
            className="font-bold text-sm sm:text-base text-primary group-hover:text-accent transition-colors cursor-pointer line-clamp-2 mt-1.5 leading-snug"
          >
            {product.name}
          </h3>
        </div>

        {/* Color variants indication */}
        {product.variants && (
          <div className="flex items-center gap-1.5 pt-1">
            {product.variants.slice(0, 3).map((v) => (
              <span 
                key={v.id} 
                className="w-3 h-3 rounded-full border border-border-default shadow-sm" 
                style={{ backgroundColor: v.colorHex || '#94a3b8' }} 
                title={v.name}
              />
            ))}
            {product.variants.length > 3 && (
              <span className="text-[10px] text-slate-400 font-bold pl-0.5">
                +{product.variants.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price and Cart Row */}
        <div className="pt-4 flex items-center justify-between mt-auto border-t border-slate-50">
          <div className="flex flex-col">
            {product.compareAtPrice && (
              <span className="text-[10px] text-slate-400 line-through font-bold">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-display font-black text-[#101A25]">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={onAddToCart}
            disabled={isLocalAdding || isAddingToCart}
            className="w-10 h-10 bg-[#101A25] hover:bg-accent text-white rounded-xl shadow-xl transition-all cursor-pointer group/btn disabled:opacity-70 flex items-center justify-center"
            title="Add to Cart"
          >
            {isLocalAdding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShoppingCart size={16} className="group-hover/btn:scale-110 transition-transform" />
            )}
          </button>
        </div>

      </div>

    </div>
  );
});
