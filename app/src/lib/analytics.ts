// =============================================
// SIMPLE ANALYTICS HELPER
// Sends events to Google Analytics + our backend
// (first-party visitor journeys with sequential IDs).
// =============================================

export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

const SESSION_STORAGE_KEY = "ordonsooq_session_id";
const BROWSER_STORAGE_KEY = "ordonsooq_browser_key";
const ADMIN_CLIENT_COOKIE = "os_admin_client";
const FLUSH_MS = 2500;
const MAX_QUEUE = 40;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: 'event' | 'config' | 'js' | 'set',
      eventName: string | Date,
      params?: AnalyticsEventParams,
    ) => void;
  }
}

type QueuedEvent = {
  name: string;
  path?: string;
  properties?: Record<string, string | number | boolean>;
  occurredAt: string;
};

let eventQueue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let lifecycleBound = false;

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

function getAdminClientCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${ADMIN_CLIENT_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** Admin devices (cookie from admin login) must not pollute visitor analytics / GA. */
export function isAdminAnalyticsDevice(): boolean {
  return Boolean(getAdminClientCookie());
}

function getBrowserKey(): string {
  if (typeof window === 'undefined') return '';

  const adminKey = getAdminClientCookie();
  if (adminKey) return adminKey;

  let id = window.localStorage.getItem(BROWSER_STORAGE_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(BROWSER_STORAGE_KEY, id);
  }
  return id;
}

function cleanProperties(params: AnalyticsEventParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string | number | boolean] =>
        entry[1] !== undefined && entry[1] !== null && entry[1] !== '',
    ),
  );
}

function ensureLifecycle() {
  if (typeof window === 'undefined' || lifecycleBound) return;
  lifecycleBound = true;

  const flush = () => {
    void flushAnalyticsQueue(true);
  };

  window.addEventListener('pagehide', flush);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushAnalyticsQueue(false);
  }, FLUSH_MS);
}

async function flushAnalyticsQueue(useBeacon: boolean) {
  if (typeof window === 'undefined' || eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, MAX_QUEUE);
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  if (!apiBase) return;

  const payload = JSON.stringify({
    browserKey: getBrowserKey(),
    sessionKey: getSessionId(),
    userAgent: navigator.userAgent.slice(0, 512),
    events: batch,
  });

  const url = `${apiBase}/analytics/collect`;

  try {
    if (useBeacon && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      const ok = navigator.sendBeacon(url, blob);
      if (ok) return;
    }

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
      credentials: 'omit',
    });
  } catch {
    // Re-queue a small amount on failure so we don't drop everything silently.
    eventQueue = [...batch.slice(0, 10), ...eventQueue].slice(0, MAX_QUEUE);
  }
}

function queueFirstPartyEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (typeof window === 'undefined') return;

  ensureLifecycle();

  const properties = cleanProperties(params);
  const path =
    typeof properties['Page URL'] === 'string'
      ? properties['Page URL']
      : window.location.pathname + window.location.search;

  eventQueue.push({
    name: eventName,
    path: String(path).slice(0, 1024),
    properties,
    occurredAt: new Date().toISOString(),
  });

  if (eventQueue.length >= MAX_QUEUE) {
    void flushAnalyticsQueue(false);
    return;
  }

  scheduleFlush();
}

// Sends one event to Google Analytics + our visitor journey store.
// eventName -> shows up as the event name in GA (keep it simple, e.g. "Clicked Add to Cart")
// params    -> the extra readable details (e.g. { Page: "/cart", Time: "3:45 PM" })
export function trackEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  // Admin browsers registered via admin login — skip GA + first-party journeys.
  if (isAdminAnalyticsDevice()) {
    return;
  }

  const cleanParams: AnalyticsEventParams = {
    "Session ID": getSessionId(),
    "Time": new Date().toLocaleString(),
    "Page URL": window.location.href,
    ...params,
  };

  const finalParams = Object.fromEntries(
    Object.entries(cleanParams).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

  queueFirstPartyEvent(eventName, finalParams);

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, finalParams);
  }
}
