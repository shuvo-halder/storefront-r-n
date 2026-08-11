import React from 'react';
import { Product } from '../../types/storefront';
import { useStorefront } from '../../context/StorefrontContext';
import { RatingStars } from './RatingStars';
import { Heart, Eye, ShoppingCart, Sparkles, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode = 'grid' 
}) => {
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    openQuickView, 
    navigateTo 
  } = useStorefront();

  const inWishlist = isInWishlist(product.id);
  const secondImage = product.images[1] || product.images[0];

  const handleCardClick = () => {
    navigateTo('product-detail', { productSlug: product.slug });
  };

  if (viewMode === 'list') {
    return (
      <div className="group bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col sm:flex-row items-stretch gap-5 relative overflow-hidden">
        {/* Badges */}
        {product.discountPercent && (
          <div className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs z-10">
            -{product.discountPercent}%
          </div>
        )}

        {/* Thumbnail */}
        <div 
          onClick={handleCardClick}
          className="w-full sm:w-48 h-48 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden relative flex-shrink-0 cursor-pointer"
        >
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                {product.brand}
              </span>
              <RatingStars rating={product.rating} count={product.reviewCount} />
            </div>

            <h3 
              onClick={handleCardClick}
              className="font-bold text-base text-slate-900 group-hover:text-rose-600 transition-colors cursor-pointer mt-1"
            >
              {product.name}
            </h3>

            <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openQuickView(product)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Quick View"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  inWishlist ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-100 border-transparent text-slate-600 hover:text-rose-600'
                }`}
                title="Wishlist"
              >
                <Heart size={16} fill={inWishlist ? '#e11d48' : 'none'} />
              </button>
              <button
                onClick={() => addToCart(product.id, 1)}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ShoppingCart size={15} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs hover:shadow-xl hover:border-rose-200/90 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      
      {/* Badges Top Left */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1 items-start">
        {product.discountPercent && (
          <span className="bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
            -{product.discountPercent}% OFF
          </span>
        )}
        {product.isNew && (
          <span className="bg-slate-900 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-full shadow-xs">
            NEW
          </span>
        )}
        {product.isDealOfDay && (
          <span className="bg-amber-500 text-slate-950 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Zap size={10} /> DEAL
          </span>
        )}
      </div>

      {/* Wishlist Button Top Right */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className={`absolute top-3.5 right-3.5 z-10 p-2 rounded-full backdrop-blur-xs transition-all shadow-xs cursor-pointer ${
          inWishlist 
            ? 'bg-white/90 text-rose-600 shadow-md scale-110' 
            : 'bg-white/80 text-slate-400 hover:text-rose-600 hover:bg-white'
        }`}
        aria-label="Wishlist"
      >
        <Heart size={16} fill={inWishlist ? '#e11d48' : 'none'} />
      </button>

      {/* Image Gallery Stage with Quick View Overlay */}
      <div 
        onClick={handleCardClick}
        className="relative aspect-square bg-slate-50 rounded-xl overflow-hidden cursor-pointer group/img mb-3"
      >
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-opacity duration-300 group-hover/img:opacity-0" 
        />
        <img 
          src={secondImage} 
          alt={product.name} 
          className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/img:opacity-100 group-hover/img:scale-105" 
        />

        {/* Quick View Hover Trigger */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            className="w-full py-2 px-3 bg-white/95 hover:bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer backdrop-blur-xs"
          >
            <Eye size={14} className="text-rose-600" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="text-rose-600 uppercase tracking-wider">{product.brand}</span>
            <RatingStars rating={product.rating} count={product.reviewCount} showNumber={false} />
          </div>

          <h3 
            onClick={handleCardClick}
            className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-600 transition-colors cursor-pointer line-clamp-2 mt-1 leading-snug"
          >
            {product.name}
          </h3>
        </div>

        {/* Color variants indication */}
        {product.variants && (
          <div className="flex items-center gap-1 pt-1">
            {product.variants.slice(0, 3).map((v) => (
              <span 
                key={v.id} 
                className="w-2.5 h-2.5 rounded-full border border-slate-300 shadow-xs" 
                style={{ backgroundColor: v.colorHex || '#94a3b8' }} 
                title={v.name}
              />
            ))}
            {product.variants.length > 3 && (
              <span className="text-[10px] text-slate-400 font-semibold pl-0.5">
                +{product.variants.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price and Cart Row */}
        <div className="pt-2 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-[11px] text-slate-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-[10px] font-semibold text-emerald-600">
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>

          <button
            onClick={() => addToCart(product.id, 1)}
            className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer group/btn"
            title="Add to Cart"
          >
            <ShoppingCart size={16} className="group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  );
};
