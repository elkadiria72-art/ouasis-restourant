/**
 * Verified customer menu QR URL format for Elkahmed.
 * Pattern: https://restaurant-menu-flame-theta.vercel.app/menu?token={qr_token}
 *
 * Override prefix via NEXT_PUBLIC_MENU_QR_URL in .env.local if needed.
 */

export const MENU_QR_URL_PREFIX =
  process.env.NEXT_PUBLIC_MENU_QR_URL?.trim() ||
  'https://restaurant-menu-flame-theta.vercel.app/menu?token=';

/** Builds QR link: prefix + table qr_token (no extra params) */
export function buildTableMenuUrl(qrToken: string): string {
  const token = qrToken.trim();
  if (!token) {
    throw new Error('رمز QR للطاولة غير صالح.');
  }

  const prefix = MENU_QR_URL_PREFIX.endsWith('=')
    ? MENU_QR_URL_PREFIX
    : `${MENU_QR_URL_PREFIX.replace(/\/$/, '')}/menu?token=`;

  return `${prefix}${encodeURIComponent(token)}`;
}
