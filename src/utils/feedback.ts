import { ToastMessage, ToastOptions, ToastVariant, NormalizedFeedback } from '../types/feedback';

/**
 * Strips technical/database/network jargon to provide customer-friendly messages.
 * Prevents raw Prisma, Axios, SQL, or Node stack traces from leaking to the UI.
 */
export function sanitizeErrorMessage(
  err: unknown,
  fallbackTitle: string = 'Action Failed',
  fallbackMessage: string = 'Something went wrong. Please try again.'
): { title: string; message: string; details?: string[] } {
  if (!err) {
    return { title: fallbackTitle, message: fallbackMessage };
  }

  // If already a simple string
  if (typeof err === 'string') {
    return {
      title: fallbackTitle,
      message: cleanTechnicalJargon(err) || fallbackMessage
    };
  }

  const errorObj = err as any;

  // 1. Check for structured API response { status: 'error', message: '...', errors: [...] }
  const apiMessage = errorObj?.response?.data?.message || errorObj?.message || errorObj?.data?.message;
  const apiErrors = errorObj?.response?.data?.errors || errorObj?.errors;
  const statusCode = errorObj?.response?.status || errorObj?.status;

  // Extract field error bullets if available
  let details: string[] | undefined;
  if (Array.isArray(apiErrors) && apiErrors.length > 0) {
    details = apiErrors
      .map((item: any) => {
        if (typeof item === 'string') return cleanTechnicalJargon(item);
        if (item?.message) return cleanTechnicalJargon(item.message);
        return null;
      })
      .filter(Boolean) as string[];
  }

  // Check common HTTP status codes
  if (statusCode === 401 || statusCode === '401') {
    return {
      title: 'Authentication Required',
      message: 'Your session has expired or requires sign in. Please log in to continue.',
      details
    };
  }

  if (statusCode === 403 || statusCode === '403') {
    return {
      title: 'Access Restricted',
      message: 'You do not have permission to perform this action.',
      details
    };
  }

  if (statusCode === 404 || statusCode === '404') {
    return {
      title: 'Not Found',
      message: 'The requested item or resource could not be found.',
      details
    };
  }

  if (statusCode === 409 || statusCode === '409') {
    return {
      title: 'Item Unavailable',
      message: cleanTechnicalJargon(apiMessage) || 'This item is currently out of stock or conflicts with another action.',
      details
    };
  }

  if (statusCode === 422 || statusCode === '422') {
    return {
      title: 'Validation Error',
      message: cleanTechnicalJargon(apiMessage) || 'Please check your inputs and try again.',
      details
    };
  }

  if (statusCode >= 500) {
    return {
      title: 'Service Temporarily Unavailable',
      message: 'Our servers encountered an issue processing your request. Please try again shortly.',
      details: undefined // Never show server details
    };
  }

  // Check network failures
  if (
    errorObj?.code === 'ERR_NETWORK' ||
    errorObj?.code === 'ECONNREFUSED' ||
    errorObj?.code === 'ETIMEDOUT' ||
    (typeof apiMessage === 'string' && apiMessage.toLowerCase().includes('network error'))
  ) {
    return {
      title: 'Connection Issue',
      message: 'Unable to reach the server. Please check your internet connection and try again.'
    };
  }

  // Clean raw message
  if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
    const cleaned = cleanTechnicalJargon(apiMessage);
    return {
      title: fallbackTitle,
      message: cleaned,
      details
    };
  }

  return {
    title: fallbackTitle,
    message: fallbackMessage,
    details
  };
}

/**
 * Filter out sensitive keywords, stack traces, and framework internals.
 */
function cleanTechnicalJargon(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Filter Prisma codes & DB constraints
  if (cleaned.includes('P2002') || cleaned.includes('Unique constraint failed')) {
    return 'This record or email already exists in our system.';
  }
  if (cleaned.includes('P2025') || cleaned.includes('Record to update not found')) {
    return 'The requested record could not be found.';
  }
  if (cleaned.includes('PrismaClient') || cleaned.includes('Prisma') || cleaned.includes('SQL') || cleaned.includes('SELECT') || cleaned.includes('INSERT INTO')) {
    return 'A database operation could not be completed. Please try again.';
  }

  // Filter Axios / Network code words
  if (cleaned.includes('AxiosError') || cleaned.includes('Request failed with status code')) {
    return 'Unable to complete your request. Please check your inputs and try again.';
  }

  // Filter stack trace patterns
  if (cleaned.includes('\n    at ') || cleaned.includes('node_modules')) {
    cleaned = cleaned.split('\n')[0];
  }

  // Cut overly long errors
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 197) + '...';
  }

  return cleaned.trim();
}

/**
 * Helper to construct a standard ToastMessage object
 */
export function createToastPayload(
  type: ToastVariant,
  title: string,
  messageOrOptions?: string | ToastOptions,
  options?: ToastOptions
): ToastMessage {
  const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const now = Date.now();

  let resolvedDescription: string | undefined;
  let extraOptions: ToastOptions = {};

  if (typeof messageOrOptions === 'string') {
    resolvedDescription = messageOrOptions;
    if (options) extraOptions = options;
  } else if (typeof messageOrOptions === 'object' && messageOrOptions !== null) {
    extraOptions = messageOrOptions;
    resolvedDescription = extraOptions.description || extraOptions.message;
  }

  const defaultDuration = type === 'error' ? 6000 : type === 'warning' ? 5000 : 4500;

  return {
    id,
    type,
    title,
    message: resolvedDescription,
    description: resolvedDescription,
    duration: extraOptions.duration ?? defaultDuration,
    image: extraOptions.image,
    badge: extraOptions.badge,
    action: extraOptions.action,
    icon: extraOptions.icon,
    onClose: extraOptions.onClose,
    timestamp: now,
  };
}
