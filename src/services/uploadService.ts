import { apiClient, unwrapApiResponse, extractApiError } from '../lib/api';
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
 * Uploads a single file to the backend review upload endpoint.
 * Returns the secure uploaded image URL.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/reviews/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });

    const unwrapped = unwrapApiResponse<any>(response);

    if (unwrapped.status === 'error' || !unwrapped.data?.url) {
      throw new Error(unwrapped.message || 'Failed to upload photo.');
    }

    return unwrapped.data.url as string;
  } catch (err: any) {
    console.error('Review image upload error:', err);
    if (err.response?.status === 429) {
      throw new Error('Image upload limit exceeded. Please try again in 15 minutes.');
    }
    const { message } = extractApiError(err, 'Failed to upload photo to server.');
    throw new Error(message);
  }
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
