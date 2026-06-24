export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: 'event' | 'config' | 'js',
      eventName: string | Date,
      params?: AnalyticsEventParams,
    ) => void;
  }
}

function normalizeEventName(eventName: string) {
  return eventName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function normalizeValue(value: unknown): string | number | boolean | null | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, 100) : undefined;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return String(value).slice(0, 100);
}

export function trackEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  const normalizedName = normalizeEventName(eventName);
  if (!normalizedName) {
    return;
  }

  const normalizedParams = Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, normalizeValue(value)])
      .filter(([, value]) => value !== undefined)
  );

  window.gtag('event', normalizedName, normalizedParams);
}