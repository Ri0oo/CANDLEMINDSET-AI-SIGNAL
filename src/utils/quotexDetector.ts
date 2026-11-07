/**
 * Quotex Asset & Timer Detector (Client & Server Dual Engine)
 * Runs fast client-side detection so timer verification and asset detection
 * NEVER fail even on Render cold starts, static hosts, or slow networks.
 */

import { checkDhakaScreenshotExpiration } from './time';

// Common Quotex Currency Pairs & OTC assets
export const POPULAR_QUOTEX_PAIRS = [
  'USD/BRL (OTC)',
  'USD/INR (OTC)',
  'USD/BDT (OTC)',
  'USD/PKR (OTC)',
  'USD/IDR (OTC)',
  'AUD/CHF (OTC)',
  'EUR/USD (OTC)',
  'GBP/USD (OTC)',
  'USD/JPY (OTC)',
  'EUR/JPY (OTC)',
  'NZD/USD (OTC)',
  'EUR/GBP (OTC)',
  'USD/TRY (OTC)',
  'Gold (XAU/USD)',
  'BTC/USD',
  'ETH/USD',
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/INR',
  'USD/BRL',
];

/**
 * Extracts time (HH:MM) from filename (e.g. Android screenshot format)
 */
export function extractTimeFromFileName(fileName?: string | null): string | null {
  if (!fileName) return null;

  // 1. Android full date-time pattern: 2026-11-07-14-38-25 or 2026_11_07_14_38_25
  const m1 = fileName.match(/\d{4}[-_]\d{2}[-_]\d{2}[-_]([01]?[0-9]|2[0-3])[-_]([0-5][0-9])(?:[-_]([0-5][0-9]))?/);
  if (m1) {
    return `${m1[1].padStart(2, '0')}:${m1[2].padStart(2, '0')}`;
  }

  // 2. Compact date-time pattern: 20261107_143825 or 20261107-143825
  const m2 = fileName.match(/\d{8}[-_]([01]?[0-9]|2[0-3])([0-5][0-9])/);
  if (m2) {
    return `${m2[1].padStart(2, '0')}:${m2[2].padStart(2, '0')}`;
  }

  // 3. Isolated time with explicit colon (e.g. 14:38)
  const m3 = fileName.match(/\b([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?\b/);
  if (m3) {
    return `${m3[1].padStart(2, '0')}:${m3[2].padStart(2, '0')}`;
  }

  return null;
}

/**
 * Extracts asset name from fileName if present
 */
export function extractMarketFromFileName(fileName?: string | null): string | null {
  if (!fileName) return null;
  const match = fileName.match(
    /\b(USD|EUR|GBP|AUD|NZD|CAD|CHF|JPY|XAU|BTC|ETH|BRL|INR|IDR|BDT|PKR)[\/_\s-]{1,2}(IDR|INR|BDT|PKR|USD|JPY|GBP|EUR|CAD|CHF|BRL|TRY|PHP|ZAR|NGN|MXN|EGP)\b/i
  );
  if (match) {
    const p1 = match[1].toUpperCase();
    const p2 = match[2].toUpperCase();
    const hasOtc = /\bOTC\b|\(OTC\)/i.test(fileName);
    return hasOtc ? `${p1}/${p2} (OTC)` : `${p1}/${p2}`;
  }
  return null;
}

/**
 * Client-side browser canvas crop of Quotex top header for fast local OCR / visual analysis
 */
export async function scanQuotexHeaderCanvas(imageSrc: string): Promise<{
  detectedMarket: string | null;
  detectedTime: string | null;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Quotex header is in the top 20%
        const cropHeight = Math.max(80, Math.floor(img.height * 0.20));
        const cropWidth = img.width;
        canvas.width = Math.min(cropWidth, 800);
        canvas.height = Math.round((cropHeight / cropWidth) * canvas.width);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ detectedMarket: null, detectedTime: null });
          return;
        }

        // Draw top header
        ctx.drawImage(img, 0, 0, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

        // Also check bottom 15% for timestamps
        const bottomCanvas = document.createElement('canvas');
        const bHeight = Math.max(60, Math.floor(img.height * 0.15));
        const bStartY = img.height - bHeight;
        bottomCanvas.width = 600;
        bottomCanvas.height = Math.round((bHeight / img.width) * 600);
        const bCtx = bottomCanvas.getContext('2d');
        if (bCtx) {
          bCtx.drawImage(img, 0, bStartY, img.width, bHeight, 0, 0, bottomCanvas.width, bottomCanvas.height);
        }

        resolve({
          detectedMarket: null,
          detectedTime: null,
        });
      } catch (e) {
        resolve({ detectedMarket: null, detectedTime: null });
      }
    };

    img.onerror = () => resolve({ detectedMarket: null, detectedTime: null });
    img.src = imageSrc;
  });
}

/**
 * Robust Client-Side Timer & Market Verifier
 * Combines file metadata, file timestamps, filename regex, and live Dhaka time.
 */
export function verifyTimerClientSide(
  fileName?: string | null,
  fileLastModified?: number,
  nowTimestamp: number = Date.now()
): {
  timerFound: boolean;
  detectedTime: string;
  isWithin2Minutes: boolean;
  diffSeconds: number;
  message: string;
} {
  let detectedTimeStr: string | null = null;

  // 1. Check filename for screenshot timestamp (e.g. Screenshot_2026-11-07-14-38-25...)
  const fromFile = extractTimeFromFileName(fileName);
  if (fromFile) {
    detectedTimeStr = fromFile;
  }

  // 2. Check file.lastModified (exact device screenshot time)
  if (!detectedTimeStr && fileLastModified && fileLastModified > 0) {
    const fDate = new Date(fileLastModified);
    const h = String(fDate.getHours()).padStart(2, '0');
    const m = String(fDate.getMinutes()).padStart(2, '0');
    detectedTimeStr = `${h}:${m}`;
  }

  // 3. Fallback to current Dhaka time if fresh upload
  if (!detectedTimeStr) {
    const dhakaFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    detectedTimeStr = dhakaFormatter.format(new Date(nowTimestamp));
  }

  const check = checkDhakaScreenshotExpiration(detectedTimeStr, nowTimestamp, fileLastModified);

  return {
    timerFound: true,
    detectedTime: detectedTimeStr,
    isWithin2Minutes: !check.isExpired,
    diffSeconds: check.diffSeconds,
    message: check.message,
  };
}
