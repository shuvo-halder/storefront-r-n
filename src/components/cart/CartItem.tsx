import React from 'react';
import { SmartImage } from '../common/SmartImage';
import { Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../../types/storefront';
import { QuantitySelector } from './QuantitySelector';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, q: number) => void;
  onRemove: (id: string) => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
  onNavigateToProduct: (slug: string) => void;
}

export const CartItem = React.memo<CartItemProps>(({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
  isRemoving = false,
  onNavigateToProduct
}) => {
  return (
    <div className="py-3.5 flex items-start gap-3.5">
      {/* Product Image */}
      <div 
        onClick={() => onNavigateToProduct(item.product.slug)}
        className="w-18 h-18 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg overflow-hidden shrink-0 cursor-pointer group relative"
      >
        <SmartImage 
          src={item.selectedVariant?.image || item.product.images[0]} 
          alt={item.product.name} 
          fill
          fallbackType="product"
          fallbackLabel={item.product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 
              onClick={() => onNavigateToProduct(item.product.slug)}
              className="text-xs sm:text-sm font-semibold text-[#111827] hover:text-[#DC2B53] cursor-pointer transition-colors line-clamp-1"
            >
              {item.product.name}
            </h4>
            <div className="text-[11px] text-[#6B7280] font-normal">
              Brand: {item.product.brand}
            </div>
            {item.selectedVariant && (
              <div className="mt-1">
                <span className="text-[10px] font-semibold text-[#DC2B53] bg-[#FDF0F3] px-1.5 py-0.5 rounded border border-[#DC2B53]/20">
                  {item.selectedVariant.name}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => onRemove(item.id)}
            disabled={isRemoving}
            className="text-[#6B7280] hover:text-[#DC2B53] p-1 transition-colors disabled:opacity-40 cursor-pointer"
            title="Remove from cart"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Bottom Row: Quantity & Price */}
        <div className="mt-2.5 flex items-center justify-between">
          <QuantitySelector
            quantity={item.quantity}
            onUpdate={(q) => onUpdateQuantity(item.id, q)}
            isLoading={isUpdating}
            size="sm"
          />
          
          <div className="text-right">
            <div className="text-sm font-bold text-[#111827]">
              ${item.totalPrice.toFixed(2)}
            </div>
            {item.quantity > 1 && (
              <div className="text-[10px] text-[#6B7280] font-normal">
                ${item.unitPrice.toFixed(2)} / unit
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
