import axios from 'axios';
import {
  MAX_REVIEW_IMAGES,
  MAX_REVIEW_IMAGE_SIZE,
  ACCEPTED_REVIEW_IMAGE_TYPES,
  REVIEW_VALIDATION_MESSAGES,
} from '../components/product/reviews/reviewConstants';

export interface ImageUploadResult {
  url: string;
  publicId?: string;
}

/**
 * Validates a single image file for upload.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_REVIEW_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: REVIEW_VALIDATION_MESSAGES.UNSUPPORTED_TYPE };
  }
  if (file.size > MAX_REVIEW_IMAGE_SIZE) {
    return { valid: false, error: REVIEW_VALIDATION_MESSAGES.FILE_TOO_LARGE };
  }
  return { valid: true };
}

/**
 * Uploads a single file to Cloudinary via unauthenticated/unsigned preset or configured upload endpoint.
 * Returns the secure Cloudinary image URL.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // 1. Direct Cloudinary upload if client-side credentials are provided
  if (cloudName && uploadPreset) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'vyzobd/reviews');

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 20000,
        }
      );

      if (response.data && response.data.secure_url) {
        return response.data.secure_url as string;
      }
    } catch (err: any) {
      console.error('Cloudinary direct upload error:', err?.response?.data || err?.message);
      throw new Error(err?.response?.data?.error?.message || 'Failed to upload photo to Cloudinary.');
    }
  }

  // 2. Convert to persistent base64 data URL if remote upload preset is not yet configured in local environment
  // This ensures preview and submission flow work smoothly without sending volatile Blob URLs.
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads multiple review images and returns persistent URL strings.
 */
export async function uploadReviewImages(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  if (files.length > MAX_REVIEW_IMAGES) {
    throw new Error(REVIEW_VALIDATION_MESSAGES.MAX_IMAGES_EXCEEDED);
  }

  // Upload in parallel
  const uploadPromises = files.map((file) => uploadToCloudinary(file));
  const results = await Promise.all(uploadPromises);
  return results.filter(Boolean);
}

export const uploadService = {
  validateImageFile,
  uploadToCloudinary,
  uploadReviewImages,
};
