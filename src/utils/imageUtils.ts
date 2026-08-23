/**
 * Centralized Image handling & Cloudinary optimization utility
 */

export type FallbackType = 'product' | 'category' | 'brand' | 'banner' | 'avatar' | 'blog' | 'cms' | 'logo';

/**
 * Validates whether an image URL string is valid and loadable
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (
    trimmed === '' ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed === '[object Object]' ||
    trimmed === 'undefined/undefined'
  ) {
    return false;
  }
  if (trimmed.startsWith('data:image/')) return true;
  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  return false;
}

/**
 * Formats Cloudinary URLs with dynamic quality, auto-format, and dimension parameters
 */
export function formatCloudinaryUrl(
  url: string,
  options?: { width?: number; height?: number; crop?: string; quality?: number | string }
): string {
  if (!isValidImageUrl(url)) return '';

  const trimmed = url.trim();

  // Handle Cloudinary URLs
  if (trimmed.includes('res.cloudinary.com') || trimmed.includes('cloudinary.com')) {
    const uploadIndex = trimmed.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const prefix = trimmed.substring(0, uploadIndex + 8);
      const suffix = trimmed.substring(uploadIndex + 8);

      // Check if transformation parameters are already present
      if (suffix.startsWith('f_') || suffix.startsWith('q_') || suffix.startsWith('w_') || suffix.startsWith('c_')) {
        return trimmed;
      }

      const params: string[] = ['f_auto', 'q_auto'];
      if (options?.crop) {
        params.push(`c_${options.crop}`);
      } else if (options?.width || options?.height) {
        params.push('c_limit');
      }
      if (options?.width) params.push(`w_${options.width}`);
      if (options?.height) params.push(`h_${options.height}`);

      return `${prefix}${params.join(',')}/${suffix}`;
    }
  }

  return trimmed;
}

/**
 * Generates an elegant, lightweight SVG Data URI placeholder for missing or broken images.
 * Does NOT rely on external placeholder APIs or random images.
 */
export function getFallbackSvgUri(type: FallbackType = 'product', label?: string): string {
  const displayLabel = label ? label.replace(/["'<>]/g, '') : '';

  let svgContent = '';

  switch (type) {
    case 'product':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
          <rect width="400" height="400" fill="#F8FAFC"/>
          <circle cx="200" cy="180" r="80" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="2"/>
          <rect x="140" y="160" width="120" height="70" rx="12" fill="#E2E8F0"/>
          <circle cx="170" cy="195" r="14" fill="#CBD5E1"/>
          <path d="M200 130V150M200 240V260M150 195H130M270 195H250" stroke="#E11D48" stroke-width="3" stroke-linecap="round"/>
          <text x="200" y="320" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" fill="#64748B" text-anchor="middle" letter-spacing="0.5">${displayLabel || 'VYZOBD PRODUCT'}</text>
        </svg>
      `;
      break;

    case 'category':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" fill="none">
          <rect width="300" height="200" fill="#F8FAFC"/>
          <rect x="20" y="20" width="260" height="160" rx="16" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="2"/>
          <path d="M130 80H170M150 60V100" stroke="#E11D48" stroke-width="4" stroke-linecap="round"/>
          <text x="150" y="135" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="13" fill="#475569" text-anchor="middle" letter-spacing="1">${displayLabel || 'DEPARTMENT'}</text>
        </svg>
      `;
      break;

    case 'brand':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" fill="none">
          <rect width="200" height="100" fill="#FFFFFF"/>
          <rect x="10" y="10" width="180" height="80" rx="12" fill="#F8FAFC" stroke="#E2E8F0"/>
          <path d="M80 35L100 65L120 35" stroke="#E11D48" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="100" y="78" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="11" fill="#0F172A" text-anchor="middle">${displayLabel || 'OFFICIAL BRAND'}</text>
        </svg>
      `;
      break;

    case 'banner':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" fill="none">
          <rect width="1200" height="500" fill="#0F172A"/>
          <circle cx="1000" cy="250" r="300" fill="#1E293B" opacity="0.6"/>
          <path d="M100 200H300M100 250H500M100 300H250" stroke="#334155" stroke-width="12" stroke-linecap="round"/>
          <path d="M950 150L1050 350" stroke="#E11D48" stroke-width="16" stroke-linecap="round"/>
          <text x="100" y="380" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="32" fill="#FFFFFF" letter-spacing="2">${displayLabel || 'FEATURED PROMOTION'}</text>
        </svg>
      `;
      break;

    case 'blog':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" fill="none">
          <rect width="600" height="400" fill="#F8FAFC"/>
          <rect x="40" y="40" width="520" height="320" rx="20" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="2"/>
          <path d="M100 120H500M100 160H400M100 200H450" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <circle cx="500" cy="280" r="30" fill="#E11D48"/>
          <text x="100" y="290" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18" fill="#334155">${displayLabel || 'FEATURED ARTICLE'}</text>
        </svg>
      `;
      break;

    case 'avatar':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="50" fill="#F1F5F9"/>
          <circle cx="50" cy="40" r="18" fill="#94A3B8"/>
          <path d="M20 85C20 68 33 58 50 58C67 58 80 68 80 85" fill="#94A3B8"/>
        </svg>
      `;
      break;

    default:
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
          <rect width="200" height="200" fill="#F8FAFC"/>
          <text x="100" y="105" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12" fill="#94A3B8" text-anchor="middle">VYZOBD</text>
        </svg>
      `;
      break;
  }

  const encoded = encodeURIComponent(svgContent.trim().replace(/\s+/g, ' '));
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

/**
 * Returns a robust image URL or a safe SVG fallback
 */
export function getSafeImageUrl(
  url: string | null | undefined,
  fallbackType: FallbackType = 'product',
  fallbackLabel?: string,
  transformOptions?: { width?: number; height?: number; crop?: string }
): string {
  if (!isValidImageUrl(url)) {
    return getFallbackSvgUri(fallbackType, fallbackLabel);
  }

  const formatted = formatCloudinaryUrl(url!, transformOptions);
  return formatted || getFallbackSvgUri(fallbackType, fallbackLabel);
}
