import { getGA4Id } from '../utils/analytics';

export interface GA4ClientAndSessionId {
  clientId?: string;
  sessionId?: string;
}

/**
 * Safely reads a cookie value by name in browser environments.
 * Returns undefined during SSR or if the cookie is not found.
 */
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined' || !document.cookie) return undefined;
  const cookies = document.cookie.split(';');
  const prefix = `${name}=`;
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.substring(prefix.length));
    }
  }
  return undefined;
}

/**
 * Searches document.cookie for a cookie whose name satisfies the given predicate.
 */
function findCookie(predicate: (name: string) => boolean): string | undefined {
  if (typeof document === 'undefined' || !document.cookie) return undefined;
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    const eqIdx = cookie.indexOf('=');
    if (eqIdx !== -1) {
      const name = cookie.substring(0, eqIdx).trim();
      if (predicate(name)) {
        return decodeURIComponent(cookie.substring(eqIdx + 1));
      }
    }
  }
  return undefined;
}

/**
 * Extracts the GA4 client_id from a raw `_ga` cookie value.
 *
 * Standard format:
 *   GA1.1.1234567890.1678900000 -> "1234567890.1678900000"
 *   GA1.2.1234567890.1678900000 -> "1234567890.1678900000"
 *   1234567890.1678900000       -> "1234567890.1678900000"
 */
export function extractGA4ClientId(rawCookie?: string): string | undefined {
  if (!rawCookie || typeof rawCookie !== 'string') return undefined;
  const trimmed = rawCookie.trim();
  if (!trimmed) return undefined;

  const parts = trimmed.split('.');

  // Format: GA1.<domain_levels>.<clientId_part1>.<clientId_part2>
  if (parts.length >= 4 && parts[0].toUpperCase().startsWith('GA')) {
    const candidate = parts.slice(2).join('.');
    if (candidate && candidate.length > 3) {
      return candidate;
    }
  }

  // Format: <clientId_part1>.<clientId_part2> (2 parts separated by dot)
  if (parts.length === 2 && parts[0] && parts[1]) {
    return trimmed;
  }

  // If already parsed or non-prefixed string of sufficient length
  if (trimmed.length > 5 && !trimmed.startsWith('GA1.')) {
    return trimmed;
  }

  return undefined;
}

/**
 * Extracts the GA4 session_id from a raw `_ga_<container_id>` cookie value.
 *
 * Standard format:
 *   GS1.1.1689234567.2.1.1689234800.0.0.0 -> "1689234567"
 *   GS2.1.1689234567.2.1.1689234800.0.0.0 -> "1689234567"
 */
export function extractGA4SessionId(rawCookie?: string): string | undefined {
  if (!rawCookie || typeof rawCookie !== 'string') return undefined;
  const trimmed = rawCookie.trim();
  if (!trimmed) return undefined;

  const parts = trimmed.split('.');

  // Format: GS1.1.<sessionId>.<sessionNumber>.<timestamp>...
  if (parts.length >= 3 && (parts[0].toUpperCase() === 'GS1' || parts[0].toUpperCase() === 'GS2')) {
    const sId = parts[2];
    if (sId && /^\d+$/.test(sId)) {
      return sId;
    }
  }

  // If raw string is directly a numeric timestamp/session id
  if (/^\d{8,}$/.test(trimmed)) {
    return trimmed;
  }

  return undefined;
}

/**
 * Extracts the GA4 client_id and session_id from browser cookies.
 *
 * SSR-safe, handles missing cookies, malformed values, disabled analytics,
 * and extracts the session cookie matching the configured GA4 Measurement ID.
 *
 * @param providedMeasurementId Optional GA4 Measurement ID (e.g. "G-XXXXXX").
 *                              If omitted, retrieves ID from dynamic storefront analytics configuration.
 * @returns { clientId?: string; sessionId?: string }
 */
export function getGA4ClientAndSessionId(providedMeasurementId?: string): GA4ClientAndSessionId {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { clientId: undefined, sessionId: undefined };
  }

  try {
    // 1. Extract clientId from `_ga` cookie
    const gaCookie = getCookie('_ga');
    const clientId = extractGA4ClientId(gaCookie);

    // 2. Extract sessionId from `_ga_<measurement_id>` cookie
    const ga4Id = providedMeasurementId || getGA4Id();
    let sessionCookie: string | undefined = undefined;

    if (ga4Id) {
      const containerId = ga4Id.replace(/^G-/i, '').trim();
      if (containerId) {
        // Try exact match or case-insensitive match for `_ga_${containerId}`
        sessionCookie =
          getCookie(`_ga_${containerId}`) ||
          findCookie((name) => name.toLowerCase() === `_ga_${containerId.toLowerCase()}`);
      }
    }

    // Fallback: search for any `_ga_<container>` cookie (excluding _gat, _gac, _gid, _ga)
    if (!sessionCookie) {
      sessionCookie = findCookie((name) => {
        const lower = name.toLowerCase();
        return (
          lower.startsWith('_ga_') &&
          lower !== '_ga' &&
          !lower.startsWith('_gat') &&
          !lower.startsWith('_gac') &&
          !lower.startsWith('_gid')
        );
      });
    }

    const sessionId = extractGA4SessionId(sessionCookie);

    return {
      clientId: clientId || undefined,
      sessionId: sessionId || undefined,
    };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GA4] Failed to extract client/session ID from cookies:', err);
    }
    return {
      clientId: undefined,
      sessionId: undefined,
    };
  }
}
