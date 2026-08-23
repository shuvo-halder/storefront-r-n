'use client';

import React, { useEffect, useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { MAX_REVIEW_IMAGES } from './reviewConstants';

export interface SelectedImageItem {
  file: File;
  previewUrl: string;
  id: string;
}

export interface ReviewImagePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export const ReviewImagePreview: React.FC<ReviewImagePreviewProps> = ({
  files,
  onRemove,
  disabled = false,
}) => {
  const [items, setItems] = useState<SelectedImageItem[]>([]);

  useEffect(() => {
    // Generate object URLs for new files
    const newItems: SelectedImageItem[] = files.map((file, idx) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${file.name}-${file.size}-${file.lastModified}-${idx}`,
    }));

    setItems(newItems);

    // Cleanup object URLs when files change or component unmounts
    return () => {
      newItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [files]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#111827] flex items-center gap-1.5">
          <ImageIcon size={14} className="text-[#DC2B53]" />
          Selected Photos
        </span>
        <span className="font-medium text-[#6B7280]">
          {files.length} / {MAX_REVIEW_IMAGES} photos
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5">
        {items.map((item, index) => {
          const fileSizeKb = Math.round(item.file.size / 1024);
          return (
            <div
              key={item.id}
              className="group relative aspect-square rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] overflow-hidden shadow-2xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt={`Selected preview ${index + 1}: ${item.file.name}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />

              {/* Gradient Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Remove Button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  aria-label={`Remove photo ${index + 1} (${item.file.name})`}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-[#DC2B53] text-white border border-white/30 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DC2B53]"
                >
                  <X size={12} />
                </button>
              )}

              {/* File size badge on hover */}
              <div className="absolute bottom-1 inset-x-1 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[9px] font-semibold text-white bg-black/60 px-1 py-0.5 rounded backdrop-blur-2xs truncate block">
                  {fileSizeKb < 1024 ? `${fileSizeKb} KB` : `${(fileSizeKb / 1024).toFixed(1)} MB`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
