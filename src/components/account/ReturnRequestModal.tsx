'use client';

import React, { useState } from 'react';
import { SmartImage } from '../common/SmartImage';
import { CustomerOrderDetails, CustomerOrderItem, ReturnRequestPayload } from '../../types/customer';
import { customerService } from '../../services/customerService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  X, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Package, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

interface ReturnRequestModalProps {
  order: CustomerOrderDetails | { id: string; orderNumber?: string; items?: CustomerOrderItem[] };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ItemReturnSelection {
  orderItemId?: string;
  productId: string;
  productName: string;
  productImage?: string;
  variantName?: string;
  maxQuantity: number;
  selectedQuantity: number;
  selected: boolean;
  reason: string;
  condition: string;
}

const RETURN_REASONS = [
  { value: 'wrong_item', label: 'Received wrong item' },
  { value: 'defective', label: 'Item is defective / damaged' },
  { value: 'not_as_described', label: 'Item not as described' },
  { value: 'missing_parts', label: 'Missing accessories or parts' },
  { value: 'quality_issue', label: 'Poor build or performance' },
  { value: 'no_longer_needed', label: 'No longer needed' },
  { value: 'other', label: 'Other reason' },
];

const ITEM_CONDITIONS = [
  { value: 'New', label: 'Unopened / Sealed' },
  { value: 'Open', label: 'Opened / Like New' },
  { value: 'Used', label: 'Lightly Used' },
  { value: 'Defective', label: 'Defective / Damaged' },
];

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const rawItems = (order.items || []) as CustomerOrderItem[];

  const [itemSelections, setItemSelections] = useState<ItemReturnSelection[]>(() =>
    rawItems.map((item) => ({
      orderItemId: item.id || item.orderItemId,
      productId: item.productId,
      productName: item.productName || 'Product',
      productImage: item.productImage || item.image,
      variantName: item.variantName || (typeof item.variant === 'string' ? item.variant : (item.variant as any)?.name),
      maxQuantity: item.quantity || 1,
      selectedQuantity: item.quantity || 1,
      selected: false,
      reason: 'defective',
      condition: 'New',
    }))
  );

  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const returnMutation = useMutation({
    mutationFn: async (payload: ReturnRequestPayload) => {
      const res = await customerService.requestReturn(payload);
      if (res.status === 'error') {
        throw new Error(res.message || 'Failed to submit return request.');
      }
      return res.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['customer', 'returns'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'order-returns', order.id] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'order', order.id] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    },
    onError: (err: any) => {
      const msg = err?.message || 'Failed to submit return request. Please try again.';
      setFormError(msg);
    },
  });

  if (!isOpen) return null;

  const handleToggleItem = (index: number) => {
    setItemSelections((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setItemSelections((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selectedQuantity: qty } : item
      )
    );
  };

  const handleReasonChange = (index: number, reason: string) => {
    setItemSelections((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, reason } : item
      )
    );
  };

  const handleConditionChange = (index: number, condition: string) => {
    setItemSelections((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, condition } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const selectedItems = itemSelections.filter((it) => it.selected);
    if (selectedItems.length === 0) {
      setFormError('Please select at least one item you wish to return.');
      return;
    }

    const payload: ReturnRequestPayload = {
      orderId: order.id,
      items: selectedItems.map((it) => ({
        orderItemId: it.orderItemId,
        productId: it.productId,
        quantity: it.selectedQuantity,
        reason: it.reason,
        condition: it.condition,
      })),
      reason: selectedItems.map((it) => it.reason).join(', '),
      notes: notes.trim() || undefined,
    };

    returnMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 my-8 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={returnMutation.isPending}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {isSuccess ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Return Request Submitted!</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
              Your return request for Order #{order.orderNumber || order.id} has been received. Our team will review the details and provide return shipping guidance.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="mb-4 pr-8">
              <div className="flex items-center gap-2 text-xs font-bold text-[#DC2B53] uppercase tracking-wider mb-1">
                <RotateCcw size={14} />
                <span>Return Item Request</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Order #{order.orderNumber || order.id}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Select the eligible products from this order you wish to return.
              </p>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4">
              
              {/* Item selection list */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-900">
                  Select Order Items <span className="text-[#DC2B53]">*</span>
                </label>

                {itemSelections.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs text-gray-500">
                    No items available for return on this order.
                  </div>
                ) : (
                  itemSelections.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        item.selected
                          ? 'border-[#DC2B53] bg-[#DC2B53]/5 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleToggleItem(idx)}
                          className="mt-1 w-4 h-4 text-[#DC2B53] rounded border-gray-300 focus:ring-[#DC2B53] cursor-pointer"
                        />
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0 relative">
                          <SmartImage
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            fallbackType="product"
                            fallbackLabel={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                            {item.productName}
                          </h4>
                          {item.variantName && (
                            <p className="text-[11px] text-gray-500 mt-0.5">{item.variantName}</p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Purchased qty: {item.maxQuantity}
                          </p>
                        </div>
                      </div>

                      {/* Expanded options if selected */}
                      {item.selected && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-gray-200/70">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Return Qty
                            </label>
                            <select
                              value={item.selectedQuantity}
                              onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#DC2B53] focus:border-[#DC2B53]"
                            >
                              {Array.from({ length: item.maxQuantity }, (_, i) => i + 1).map((q) => (
                                <option key={q} value={q}>
                                  {q}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Condition
                            </label>
                            <select
                              value={item.condition}
                              onChange={(e) => handleConditionChange(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#DC2B53] focus:border-[#DC2B53]"
                            >
                              {ITEM_CONDITIONS.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Reason
                            </label>
                            <select
                              value={item.reason}
                              onChange={(e) => handleReasonChange(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#DC2B53] focus:border-[#DC2B53]"
                            >
                              {RETURN_REASONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Additional Notes / Defect Details <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why you are returning this item, package condition, or any missing elements..."
                  rows={2}
                  maxLength={500}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#DC2B53] focus:border-[#DC2B53] transition-colors"
                />
              </div>

              {/* Policy note */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px] text-gray-500 flex items-start gap-2">
                <ShieldCheck size={15} className="text-primary flex-shrink-0 mt-0.5" />
                <span>
                  Items must be in original condition with tags/accessories attached. Returns are subject to inspection upon warehouse receipt.
                </span>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-medium">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={returnMutation.isPending}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnMutation.isPending || itemSelections.length === 0}
                  className="btn-primary px-5 py-2 inline-flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                >
                  {returnMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <span>Submit Return</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
