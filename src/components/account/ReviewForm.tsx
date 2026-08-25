'use client';

import React, { useState, useRef } from 'react';
import { SmartImage } from '../common/SmartImage';
import { EligibleReviewItem, ReviewSubmissionPayload } from '../../types/customer';
import { customerService } from '../../services/customerService';
import { uploadService } from '../../services/uploadService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Star, 
  X, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ShieldCheck, 
  Package
} from 'lucide-react';

interface ReviewFormProps {
  item: EligibleReviewItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 - Poor',
  2: '2 - Fair',
  3: '3 - Good',
  4: '4 - Very Good',
  5: '5 - Excellent',
};

export const ReviewForm: React.FC<ReviewFormProps> = ({ item, isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [headline, setHeadline] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const submitMutation = useMutation({
    mutationFn: async (payload: ReviewSubmissionPayload) => {
      const res = await customerService.submitReview(payload);
      if (res.status === 'error') {
        throw new Error(res.message || 'Failed to submit review.');
      }
      return res.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['customer', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'reviews', 'eligible'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
      if (item.orderId) {
        queryClient.invalidateQueries({ queryKey: ['customer', 'order', item.orderId] });
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1800);
    },
    onError: (err: any) => {
      const msg = err?.message || 'Failed to submit review. Please try again.';
      setFormError(msg);
      // If already reviewed, also invalidate to clear outdated entitlements
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('reviewed')) {
        queryClient.invalidateQueries({ queryKey: ['customer', 'reviews', 'eligible'] });
        queryClient.invalidateQueries({ queryKey: ['customer', 'reviews'] });
      }
    },
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (selectedFiles.length + files.length > 5) {
      setFormError('You can upload a maximum of 5 images per review.');
      return;
    }

    setFormError(null);
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!rating || rating < 1 || rating > 5) {
      setFormError('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (!comment.trim()) {
      setFormError('Please write your review feedback.');
      return;
    }

    let uploadedImageUrls: string[] = [];
    if (selectedFiles.length > 0) {
      setIsUploadingImages(true);
      try {
        uploadedImageUrls = await uploadService.uploadReviewImages(selectedFiles);
      } catch (uploadErr: any) {
        setIsUploadingImages(false);
        setFormError(uploadErr.message || 'Failed to upload review photos.');
        return;
      }
      setIsUploadingImages(false);
    }

    submitMutation.mutate({
      orderItemId: item.orderItemId,
      productId: item.productId,
      rating,
      headline: headline.trim() || undefined,
      comment: comment.trim(),
      images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 my-8 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitMutation.isPending || isUploadingImages}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Review Submitted!</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
              Thank you for sharing your feedback. Your review helps other shoppers make informed choices.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-5 pr-8">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Write a Review</h2>
              <p className="text-xs text-gray-500 mt-0.5">Share your experience with this purchase</p>
            </div>

            {/* Product Summary Card */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 mb-6 flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-lg bg-white overflow-hidden border border-gray-200 flex-shrink-0 relative">
                <SmartImage
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  fallbackType="product"
                  fallbackLabel={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.productName}</h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                  {item.orderNumber && (
                    <span className="font-medium">Order #{item.orderNumber}</span>
                  )}
                  {item.variantName && (
                    <span className="px-1.5 py-0.5 bg-gray-200/70 rounded text-[10px] text-gray-700">
                      {item.variantName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Overall Rating <span className="text-[#DC2B53]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-sm text-gray-300 hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            size={24}
                            className={isActive ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300'}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 ml-2">
                    {RATING_LABELS[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Review Headline */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Review Headline <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Excellent sound quality & fast delivery!"
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#DC2B53] focus:border-[#DC2B53] transition-colors"
                />
              </div>

              {/* Detailed Review Feedback */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Detailed Feedback <span className="text-[#DC2B53]">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? How does it perform in daily use?"
                  rows={3}
                  maxLength={1000}
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#DC2B53] focus:border-[#DC2B53] transition-colors"
                />
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-0.5">
                  <span>Authentic reviews help our community.</span>
                  <span>{comment.length} / 1000</span>
                </div>
              </div>

              {/* Upload Photos */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-900">
                    Add Photos <span className="text-gray-400 font-normal">(up to 5)</span>
                  </label>
                  <span className="text-[10px] text-gray-400">JPG, PNG, WEBP &lt; 5MB</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                />

                {/* Previews and Add Button */}
                <div className="flex flex-wrap gap-2.5">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 relative group">
                      <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {previewUrls.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#DC2B53] hover:bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:text-[#DC2B53] transition-colors cursor-pointer"
                      aria-label="Upload photo"
                    >
                      <Upload size={16} />
                      <span className="text-[9px] font-semibold mt-0.5">Add</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-medium">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitMutation.isPending || isUploadingImages}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitMutation.isPending || isUploadingImages}
                  className="btn-primary px-5 py-2 inline-flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                >
                  {(submitMutation.isPending || isUploadingImages) ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>{isUploadingImages ? 'Uploading Photos...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
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
