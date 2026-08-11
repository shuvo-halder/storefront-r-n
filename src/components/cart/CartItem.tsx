import React from 'react';
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
    <div className="py-4 flex items-start gap-4">
      {/* Product Image */}
      <div 
        onClick={() => onNavigateToProduct(item.product.slug)}
        className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group"
      >
        <img 
          src={item.product.images[0]} 
          alt={item.product.name} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 
              onClick={() => onNavigateToProduct(item.product.slug)}
              className="text-sm font-bold text-slate-900 hover:text-primary cursor-pointer transition-colors line-clamp-1"
            >
              {item.product.name}
            </h4>
            <div className="text-[11px] text-slate-500 font-medium">
              Brand: {item.product.brand}
            </div>
            {item.selectedVariant && (
              <div className="mt-1">
                <span className="text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 uppercase">
                  {item.selectedVariant.name}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => onRemove(item.id)}
            disabled={isRemoving}
            className="text-slate-400 hover:text-primary p-1.5 transition-colors disabled:opacity-40"
            title="Remove from cart"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Bottom Row: Quantity & Price */}
        <div className="mt-3 flex items-center justify-between">
          <QuantitySelector
            quantity={item.quantity}
            onUpdate={(q) => onUpdateQuantity(item.id, q)}
            isLoading={isUpdating}
            size="sm"
          />
          
          <div className="text-right">
            <div className="text-sm font-black text-slate-900">
              ${item.totalPrice.toFixed(2)}
            </div>
            {item.quantity > 1 && (
              <div className="text-[10px] text-slate-400 font-medium">
                ${item.unitPrice.toFixed(2)} / unit
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
