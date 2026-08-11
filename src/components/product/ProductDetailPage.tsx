import React, { useState, useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { Product, ProductReview } from '../../types/storefront';
import { RatingStars } from '../common/RatingStars';
import { ProductCard } from '../common/ProductCard';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  RotateCcw,
  Star,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { 
    viewParams, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    navigateTo, 
    trackRecentlyViewed,
    recentlyViewed,
    addToast
  } = useStorefront();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Review form modal
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, title: '', comment: '' });

  useEffect(() => {
    const loadProduct = async () => {
      if (!viewParams.productSlug) return;
      setIsLoading(true);
      const data = await storefrontApi.getProductBySlug(viewParams.productSlug);
      if (data) {
        setProduct(data);
        setSelectedImage(data.images[0]);
        setSelectedVariantId(data.variants?.[0]?.id);
        trackRecentlyViewed(data.id);
      }
      setIsLoading(false);
    };

    loadProduct();
  }, [viewParams.productSlug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 mt-4">Loading product specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <button
          onClick={() => navigateTo('shop')}
          className="px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const activePrice = selectedVariant ? selectedVariant.price : product.price;

  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedVariantId);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity, selectedVariantId);
    navigateTo('checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast({
      title: 'Link Copied!',
      description: 'Product link copied to clipboard.',
      type: 'info',
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const reviewObj: ProductReview = {
      id: `rev-${Date.now()}`,
      author: newReview.name,
      rating: newReview.rating,
      date: 'Today',
      title: newReview.title || 'Verified Purchase Review',
      comment: newReview.comment,
      verifiedPurchase: true,
    };

    setProduct(prev => prev ? {
      ...prev,
      reviews: [reviewObj, ...(prev.reviews || [])],
      reviewCount: prev.reviewCount + 1,
    } : null);

    setIsReviewFormOpen(false);
    setNewReview({ name: '', rating: 5, title: '', comment: '' });
    addToast({ title: 'Review Published!', description: 'Thank you for your review.', type: 'success' });
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button onClick={() => navigateTo('home')} className="hover:text-rose-600">Home</button>
          <ChevronRight size={12} />
          <button onClick={() => navigateTo('shop')} className="hover:text-rose-600">Shop</button>
          <ChevronRight size={12} />
          <span className="text-slate-800 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Showcase Grid */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Gallery Column (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden group">
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              {product.discountPercent && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                  -{product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                    selectedImage === img ? 'border-rose-600 ring-2 ring-rose-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Column (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  {product.brand}
                </span>
                <span className="text-xs font-mono text-slate-400">SKU: AURA-PRO-{product.id}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {product.subtitle}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <RatingStars rating={product.rating} count={product.reviewCount} size={16} />
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Official 2-Year Warranty
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-3xl sm:text-4xl font-black text-rose-600">
                  ${activePrice.toFixed(2)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-base font-semibold text-slate-400 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
                {product.discountPercent && (
                  <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                    Save ${(product.compareAtPrice! - activePrice).toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
                {product.description}
              </p>
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800">
                  Select Color / Model:
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        if (v.image) setSelectedImage(v.image);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                        selectedVariantId === v.id 
                          ? 'bg-rose-50 border-rose-600 text-rose-700 ring-2 ring-rose-500/20' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {v.colorHex && (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" style={{ backgroundColor: v.colorHex }} />
                      )}
                      <span>{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Estimate Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3 text-xs text-slate-700">
              <Truck size={20} className="text-rose-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900">FREE Express Delivery</span> by <span className="font-extrabold text-rose-600">Wednesday</span> if ordered within 3 hours.
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-slate-600 hover:bg-slate-200 rounded-l-xl transition-colors font-bold"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-slate-600 hover:bg-slate-200 rounded-r-xl transition-colors font-bold"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  className="py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Buy Now
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    inWishlist ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-500 hover:text-rose-600'
                  }`}
                  title="Wishlist"
                >
                  <Heart size={18} fill={inWishlist ? '#e11d48' : 'none'} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                  title="Share Link"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Tabbed Specifications & Description Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
            {[
              { id: 'description', label: 'Overview & Key Features' },
              { id: 'specs', label: 'Technical Specifications' },
              { id: 'reviews', label: `Customer Reviews (${product.reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border-rose-600 text-rose-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'description' && (
            <div className="space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
              <p>{product.description}</p>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 mb-3">Key Highlights</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Specs Tab */}
          {activeTab === 'specs' && (
            <div className="divide-y divide-slate-100 max-w-2xl text-xs sm:text-sm">
              {product.specifications.map((spec, i) => (
                <div key={i} className="py-2.5 flex justify-between gap-4">
                  <span className="font-bold text-slate-500">{spec.key}</span>
                  <span className="font-semibold text-slate-900 text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-black text-lg text-slate-900">Verified Customer Ratings</h4>
                  <RatingStars rating={product.rating} count={product.reviewCount} size={18} />
                </div>
                <button
                  onClick={() => setIsReviewFormOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Write a Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 divide-y divide-slate-100">
                {product.reviews?.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-900">{rev.author}</div>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>
                    <RatingStars rating={rev.rating} showNumber={false} size={14} />
                    <h5 className="font-bold text-xs text-slate-800">{rev.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Write Review Dialog */}
      {isReviewFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60" onClick={() => setIsReviewFormOpen(false)} />
          <div className="bg-white rounded-3xl p-6 max-w-md w-full relative z-10 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Write Product Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Your Name</label>
                <input
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Rating</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value={5}>5 Stars - Outstanding</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Average</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Review Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Incredible ANC quality"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Comment</label>
                <textarea
                  rows={3}
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Share details about sound quality, battery, or build..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewFormOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 font-bold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
