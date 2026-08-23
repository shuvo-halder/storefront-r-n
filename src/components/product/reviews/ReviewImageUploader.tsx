'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Camera, UploadCloud, AlertCircle } from 'lucide-react';
import {
  MAX_REVIEW_IMAGES,
  MAX_REVIEW_IMAGE_SIZE,
  ACCEPTED_REVIEW_IMAGE_TYPES,
  ACCEPTED_EXTENSIONS_LABEL,
  REVIEW_VALIDATION_MESSAGES,
} from './reviewConstants';
import { ReviewImagePreview } from './ReviewImagePreview';

export interface ReviewImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

export const ReviewImageUploader: React.FC<ReviewImageUploaderProps> = ({
  files,
  onFilesChange,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateAndAddFiles = useCallback(
    (newFilesList: FileList | File[]) => {
      setErrorMessage(null);
      const incomingFiles = Array.from(newFilesList);

      if (incomingFiles.length === 0) return;

      const validFiles: File[] = [];
      let error: string | null = null;

      for (const file of incomingFiles) {
        // 1. Type validation
        if (!ACCEPTED_REVIEW_IMAGE_TYPES.includes(file.type)) {
          error = REVIEW_VALIDATION_MESSAGES.UNSUPPORTED_TYPE;
          continue;
        }

        // 2. Size validation (max 5 MB)
        if (file.size > MAX_REVIEW_IMAGE_SIZE) {
          error = REVIEW_VALIDATION_MESSAGES.FILE_TOO_LARGE;
          continue;
        }

        // 3. Duplicate check (matching name, size, lastModified)
        const isDuplicate = [...files, ...validFiles].some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified
        );
        if (isDuplicate) {
          continue;
        }

        validFiles.push(file);
      }

      // Check total images limit
      const combinedLength = files.length + validFiles.length;
      if (combinedLength > MAX_REVIEW_IMAGES) {
        const allowedCount = Math.max(0, MAX_REVIEW_IMAGES - files.length);
        const acceptedBatch = validFiles.slice(0, allowedCount);
        if (acceptedBatch.length > 0) {
          onFilesChange([...files, ...acceptedBatch]);
        }
        setErrorMessage(REVIEW_VALIDATION_MESSAGES.MAX_IMAGES_EXCEEDED);
        return;
      }

      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }

      if (error && validFiles.length === 0) {
        setErrorMessage(error);
      }
    },
    [files, onFilesChange]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
    // Reset input so same file can be re-selected if deleted
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && files.length < MAX_REVIEW_IMAGES) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || files.length >= MAX_REVIEW_IMAGES) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    setErrorMessage(null);
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  const isMaxReached = files.length >= MAX_REVIEW_IMAGES;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="review-image-input"
          className="font-semibold text-xs text-[#111827] flex items-center gap-1.5 cursor-pointer"
        >
          <Camera size={14} className="text-[#DC2B53]" />
          Add Photos <span className="text-[#6B7280] font-normal">(Optional)</span>
        </label>
        <span className="text-[11px] text-[#6B7280]">
          Up to {MAX_REVIEW_IMAGES} photos
        </span>
      </div>

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        id="review-image-input"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={disabled || isMaxReached}
        className="sr-only"
      />

      {/* Dropzone Container */}
      {!isMaxReached && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && inputRef.current) {
              inputRef.current.click();
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-2 group ${
            isDragOver
              ? 'border-[#DC2B53] bg-[#FDF0F3]'
              : 'border-[#E5E7EB] hover:border-[#DC2B53]/60 bg-[#F9FAFB] hover:bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#DC2B53] shadow-2xs group-hover:scale-105 transition-transform">
            <UploadCloud size={20} />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[#111827]">
              <span className="text-[#DC2B53] underline underline-offset-2">Click to choose photos</span> or drag & drop
            </p>
            <p className="text-[11px] text-[#6B7280]">
              {ACCEPTED_EXTENSIONS_LABEL} • Max 5 MB per image
            </p>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      <ReviewImagePreview
        files={files}
        onRemove={handleRemoveImage}
        disabled={disabled}
      />

      {/* Inline Validation Error Notification */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-fadeIn"
        >
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
