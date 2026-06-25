// =============================================
// SIMPLE ANALYTICS HELPER
// This file sends events to Google Analytics.
// Every event is kept SHORT and READABLE on purpose.
// =============================================

export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

const SESSION_STORAGE_KEY = "ordonsooq_session_id";

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

// Creates (or reuses) one ID per visit, so you can group events
// from the same person together in Google Analytics.
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let id = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

// Sends one event to Google Analytics.
// eventName -> shows up as the event name in GA (keep it simple, e.g. "Clicked Add to Cart")
// params    -> the extra readable details (e.g. { Page: "/cart", Time: "3:45 PM" })
export function trackEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  const cleanParams: AnalyticsEventParams = {
    "Session ID": getSessionId(),
    "Time": new Date().toLocaleString(),
    "Page URL": window.location.href,
    ...params,
  };

  // Remove empty/undefined values so GA stays clean
  const finalParams = Object.fromEntries(
    Object.entries(cleanParams).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

  window.gtag('event', eventName, finalParams);
}