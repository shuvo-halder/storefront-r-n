'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, CheckCircle2, AlertCircle, Loader2, Sparkles, User, ShieldCheck } from 'lucide-react';
import { ProductReview, ReviewFormState } from '../../../types/storefront';
import { useAuth } from '../../../context/AuthContext';
import { ReviewImageUploader } from './ReviewImageUploader';
import { REVIEW_VALIDATION_MESSAGES } from './reviewConstants';

export interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  onReviewSubmitted?: (newReview: ProductReview) => void;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  isOpen,
  onClose,
  productName,
  productId,
  onReviewSubmitted,
}) => {
  const { user, isAuthenticated } = useAuth();

  // Form State
  const [formData, setFormData] = useState<ReviewFormState>({
    name: '',
    phone: '',
    email: '',
    rating: 5,
    title: '',
    comment: '',
    images: [],
  });

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Pre-fill authenticated customer details if logged in
  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated && user) {
        setFormData((prev) => ({
          ...prev,
          name: user.fullName || '',
          phone: user.phone || '',
          email: user.email || '',
        }));
      }
      setFormStatus('idle');
      setValidationError(null);
    }
  }, [isOpen, isAuthenticated, user]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImagesChange = (newImages: File[]) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const validateForm = (): boolean => {
    setValidationError(null);

    // 1. Rating validation
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      setValidationError(REVIEW_VALIDATION_MESSAGES.RATING_REQUIRED);
      return false;
    }

    // 2. Name validation
    if (!formData.name.trim()) {
      setValidationError(REVIEW_VALIDATION_MESSAGES.NAME_REQUIRED);
      return false;
    }

    // 3. Guest Phone validation (if not authenticated)
    if (!isAuthenticated) {
      const cleanPhone = formData.phone?.trim() || '';
      if (!cleanPhone) {
        setValidationError(REVIEW_VALIDATION_MESSAGES.PHONE_REQUIRED);
        return false;
      }
      // BD Phone Regex: 01XXXXXXXXX or +8801XXXXXXXXX
      const bdPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
      if (!bdPhoneRegex.test(cleanPhone.replace(/\s+/g, ''))) {
        setValidationError(REVIEW_VALIDATION_MESSAGES.PHONE_INVALID);
        return false;
      }
    }

    // 4. Comment validation
    if (!formData.comment.trim() || formData.comment.trim().length < 5) {
      setValidationError(REVIEW_VALIDATION_MESSAGES.COMMENT_REQUIRED);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormStatus('submitting');

    try {
      // NOTE: Prepared frontend simulation for future backend endpoint integration.
      // The images File[] are ready in formData.images for multipart/form-data upload when backend is connected.
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Generate localized review object for instant optimistic preview
      const localReview: ProductReview = {
        id: `rev-${Date.now()}`,
        author: formData.name.trim(),
        avatar: undefined,
        rating: formData.rating,
        date: 'Just now',
        title: formData.title.trim() || (formData.rating >= 4 ? 'Verified Quality Review' : 'Customer Review'),
        comment: formData.comment.trim(),
        verifiedPurchase: isAuthenticated,
        // Convert local files to object URLs for immediate optimistic rendering
        images: formData.images.map((f) => URL.createObjectURL(f)),
        phone: formData.phone,
        email: formData.email,
      };

      setFormStatus('success');
      onReviewSubmitted?.(localReview);
    } catch {
      setFormStatus('error');
      setValidationError('Unable to submit your review. Please try again.');
    }
  };

  const ratingDescriptions: Record<number, string> = {
    5: 'Excellent — Highly recommended',
    4: 'Very Good — Satisfied with product',
    3: 'Average — Met some expectations',
    2: 'Below Average — Needs improvement',
    1: 'Poor — Unsatisfied',
  };

  const currentDisplayRating = hoverRating || formData.rating;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
            <div>
              <h3 className="font-bold text-base text-[#111827]">Write a Review</h3>
              <p className="text-xs text-[#6B7280] truncate max-w-xs sm:max-w-sm">
                {productName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close review dialog"
              className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-4">
            {formStatus === 'success' ? (
              /* Success State View */
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-[#111827]">
                    Thank You for Your Feedback!
                  </h4>
                  <p className="text-xs text-[#6B7280] max-w-xs mx-auto leading-relaxed">
                    Your rating and photos have been received. They help the community make informed decisions.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[#111827] hover:bg-black text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Main Review Form */
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* 1. Rating Selector */}
                <div className="space-y-1.5 bg-[#F9FAFB] p-3.5 rounded-xl border border-[#E5E7EB]">
                  <label className="font-semibold text-xs text-[#111827] block">
                    Overall Rating <span className="text-[#DC2B53]">*</span>
                  </label>

                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= currentDisplayRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          className="p-1 text-amber-400 hover:scale-115 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DC2B53] rounded"
                        >
                          <Star
                            size={24}
                            className={`${
                              isFilled
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200 fill-slate-100'
                            } transition-colors`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] font-medium text-[#6B7280] pt-0.5">
                    {ratingDescriptions[currentDisplayRating] || 'Select your rating'}
                  </p>
                </div>

                {/* 2. Customer / Guest Identity Fields */}
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#111827] flex items-center gap-1.5">
                          <span>{formData.name || user.fullName || 'Verified Customer'}</span>
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-semibold rounded">
                            Verified Member
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-700">{user.email || user.phone}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-[#F9FAFB] p-3.5 rounded-xl border border-[#E5E7EB]">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-[#111827]">
                      <User size={13} className="text-[#DC2B53]" />
                      Guest Customer Information
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-medium text-[11px] text-[#4B5563] block mb-1">
                          Your Name <span className="text-[#DC2B53]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Tanvir Hasan"
                          className="w-full p-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#DC2B53] text-[#111827] text-xs font-normal"
                        />
                      </div>

                      <div>
                        <label className="font-medium text-[11px] text-[#4B5563] block mb-1">
                          Mobile Number <span className="text-[#DC2B53]">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. 017XXXXXXXX"
                          className="w-full p-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#DC2B53] text-[#111827] text-xs font-normal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-medium text-[11px] text-[#4B5563] block mb-1">
                        Email Address <span className="text-[#6B7280] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. customer@example.com"
                        className="w-full p-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#DC2B53] text-[#111827] text-xs font-normal"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Review Headline / Title */}
                <div>
                  <label className="font-semibold text-xs text-[#111827] block mb-1">
                    Review Headline <span className="text-[#6B7280] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Excellent build quality and premium sound!"
                    className="w-full p-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#DC2B53] text-[#111827] text-xs font-normal"
                  />
                </div>

                {/* 4. Review Comment Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-xs text-[#111827]">
                      Your Detailed Review <span className="text-[#DC2B53]">*</span>
                    </label>
                    <span className="text-[10px] text-[#6B7280]">
                      {formData.comment.length} / 1000 characters
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    maxLength={1000}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Tell us what you liked or disliked, quality, delivery experience, etc."
                    className="w-full p-2.5 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#DC2B53] text-[#111827] text-xs font-normal resize-none leading-relaxed"
                  />
                </div>

                {/* 5. Image Uploader Component */}
                <ReviewImageUploader
                  files={formData.images}
                  onFilesChange={handleImagesChange}
                  disabled={formStatus === 'submitting'}
                />

                {/* Validation Error Alert */}
                {validationError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs"
                  >
                    <AlertCircle size={15} className="flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={formStatus === 'submitting'}
                    className="flex-1 py-2.5 bg-[#F9FAFB] hover:bg-gray-100 font-semibold text-[#4B5563] rounded-lg cursor-pointer border border-[#E5E7EB] transition-colors text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="flex-1 py-2.5 bg-[#DC2B53] hover:bg-[#C52247] disabled:opacity-60 text-white font-semibold rounded-lg cursor-pointer shadow-xs transition-colors text-xs flex items-center justify-center gap-1.5"
                  >
                    {formStatus === 'submitting' ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
