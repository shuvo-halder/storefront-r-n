'use client';

import React from 'react';
import { SmartImage } from './SmartImage';
import { Product } from '../../types/storefront';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { RatingStars } from './RatingStars';
import { trackGA4SelectItem } from '../../utils/analytics';
import { Heart, Eye, ShoppingCart, Sparkles, Zap, Loader2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  itemListId?: string;
  itemListName?: string;
  index?: number;
}

export const ProductCard = React.memo(({ 
  product, 
  viewMode = 'grid',
  itemListId = 'product_list',
  itemListName = 'Product List',
  index
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
    trackGA4SelectItem(itemListId, itemListName, product, index);
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
      <div className="group bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs hover:border-gray-300 transition-colors flex flex-col sm:flex-row items-stretch gap-5 relative overflow-hidden">
        {/* Badges */}
        {product.discountPercent && (
          <div className="absolute top-3 left-3 bg-[#DC2B53] text-white font-semibold text-[10px] px-2 py-0.5 rounded-md z-10">
            -{product.discountPercent}%
          </div>
        )}

        {/* Thumbnail */}
        <div 
          onClick={handleCardClick}
          className="w-full sm:w-48 h-48 bg-[#F9FAFB] rounded-lg overflow-hidden relative flex-shrink-0 cursor-pointer"
        >
          <SmartImage 
            src={product.images[0]} 
            alt={product.name} 
            fill
            fallbackType="product"
            fallbackLabel={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#DC2B53]">
                {product.brand}
              </span>
              <RatingStars rating={product.rating} count={product.reviewCount} />
            </div>

            <h3 
              onClick={handleCardClick}
              className="font-semibold text-lg text-[#111827] group-hover:text-[#DC2B53] transition-colors cursor-pointer mt-1.5"
            >
              {product.name}
            </h3>

            <p className="text-sm text-[#6B7280] line-clamp-2 mt-1.5 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#111827]">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-[#6B7280] line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openQuickView(product)}
                className="p-2 bg-[#F9FAFB] hover:bg-gray-100 text-[#111827] rounded-lg transition-colors cursor-pointer border border-[#E5E7EB]"
                title="Quick View"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  inWishlist ? 'bg-[#FDF0F3] border-[#DC2B53]/20 text-[#DC2B53]' : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280] hover:text-[#DC2B53]'
                }`}
                title="Wishlist"
              >
                <Heart size={16} fill={inWishlist ? '#DC2B53' : 'none'} />
              </button>
              <button
                onClick={onAddToCart}
                disabled={isLocalAdding || isAddingToCart}
                className="py-2 px-4 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70 shadow-xs"
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
    <div className="group bg-white border border-[#E5E7EB] rounded-xl p-2.5 sm:p-3 shadow-xs hover:border-gray-300 transition-colors flex flex-col justify-between relative overflow-hidden">
      
      {/* Badges Top Left */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {product.discountPercent && (
          <span className="bg-[#DC2B53] text-white font-semibold text-[10px] px-1.5 py-0.5 rounded-md">
            -{product.discountPercent}%
          </span>
        )}
        {product.isNew && (
          <span className="bg-[#111827] text-white font-semibold text-[10px] px-1.5 py-0.5 rounded-md">
            NEW
          </span>
        )}
      </div>

      {/* Wishlist Button Top Right */}
      <button
        onClick={() => toggleWishlist(product)}
        className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full border transition-colors cursor-pointer ${
          inWishlist 
            ? 'bg-[#FDF0F3] text-[#DC2B53] border-[#DC2B53]/20' 
            : 'bg-white/90 text-[#6B7280] border-[#E5E7EB] hover:text-[#DC2B53] hover:bg-white'
        }`}
        aria-label="Wishlist"
      >
        <Heart size={15} fill={inWishlist ? '#DC2B53' : 'none'} />
      </button>

      {/* Image Gallery Stage with Quick View Overlay */}
      <div 
        onClick={handleCardClick}
        className="relative aspect-square bg-[#F9FAFB] rounded-lg overflow-hidden cursor-pointer group/img mb-2.5"
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
        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            className="w-full py-1.5 px-2 bg-white/95 hover:bg-white text-[#111827] font-semibold text-[11px] rounded-md shadow-xs border border-[#E5E7EB] flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Eye size={13} className="text-[#DC2B53]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="space-y-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] font-medium text-[#6B7280]">
            <span className="text-[#DC2B53] font-semibold uppercase tracking-wider truncate max-w-[60%]">{product.brand}</span>
            <RatingStars rating={product.rating} count={product.reviewCount} showNumber={false} />
          </div>

          <h3 
            onClick={handleCardClick}
            className="font-medium text-xs sm:text-sm text-[#111827] group-hover:text-[#DC2B53] transition-colors cursor-pointer line-clamp-2 mt-0.5 leading-snug"
          >
            {product.name}
          </h3>
        </div>

        {/* Color variants indication */}
        {product.variants && (
          <div className="flex items-center gap-1 pt-0.5">
            {product.variants.slice(0, 3).map((v) => (
              <span 
                key={v.id} 
                className="w-2 h-2 rounded-full border border-gray-300" 
                style={{ backgroundColor: v.colorHex || '#94a3b8' }} 
                title={v.name}
              />
            ))}
            {product.variants.length > 3 && (
              <span className="text-[9px] text-[#6B7280] font-medium pl-0.5">
                +{product.variants.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price and Cart Row */}
        <div className="pt-2 flex items-center justify-between mt-auto border-t border-[#E5E7EB]">
          <div className="flex flex-col">
            {product.compareAtPrice && (
              <span className="text-[10px] text-[#6B7280] line-through font-medium">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
            <span className="text-sm sm:text-base font-bold text-[#111827]">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={onAddToCart}
            disabled={isLocalAdding || isAddingToCart}
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 bg-[#DC2B53] hover:bg-[#C52247] text-white rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center shrink-0"
            title="Add to Cart"
            aria-label="Add to cart"
          >
            {isLocalAdding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ShoppingCart size={14} />
            )}
          </button>
        </div>

      </div>

    </div>
  );
});
