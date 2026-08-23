/**
 * Review System Constants & Validation Rules
 */

export const MAX_REVIEW_IMAGES = 5;
export const MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB per image

export const ACCEPTED_REVIEW_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const ACCEPTED_EXTENSIONS_LABEL = 'JPG, PNG, WEBP';

export const REVIEW_VALIDATION_MESSAGES = {
  UNSUPPORTED_TYPE: 'This file type is not supported. Please upload JPG, PNG, or WEBP images.',
  FILE_TOO_LARGE: 'Image size must be less than 5 MB.',
  MAX_IMAGES_EXCEEDED: 'You can upload up to 5 images per review.',
  DUPLICATE_FILE: 'This image has already been selected.',
  RATING_REQUIRED: 'Please select a star rating.',
  NAME_REQUIRED: 'Please enter your name.',
  PHONE_REQUIRED: 'Please enter a valid mobile number.',
  PHONE_INVALID: 'Please enter a valid Bangladeshi mobile number (e.g. 017XXXXXXXX).',
  COMMENT_REQUIRED: 'Please share your review feedback (at least 10 characters).',
};
