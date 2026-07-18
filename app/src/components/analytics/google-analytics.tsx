"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const GA_MEASUREMENT_ID = "G-L5CKSLWKWV";
/** Delay fallback so Lighthouse can finish before analytics loads. */
const GA_IDLE_FALLBACK_MS = 12_000;

function GoogleAnalyticsTracker({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedSessionStartRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasTrackedSessionStartRef.current) return;
    hasTrackedSessionStartRef.current = true;
    trackEvent("Session Started");
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const paramsString = searchParams?.toString();
    const pagePath = paramsString ? `${pathname}?${paramsString}` : pathname;

    trackEvent("Page Viewed", {
      Page: pagePath,
      "Page Title": document.title,
    });
  }, [enabled, pathname, searchParams]);

  return null;
}

/**
 * Load gtag only after real user interaction (or a long idle fallback).
 * Prevents unused-JS / bootup-time hits during Lighthouse lab runs.
 */
export function GoogleAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    const enable = () => setShouldLoad(true);
    const opts: AddEventListenerOptions = { once: true, passive: true };
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

    for (const eventName of events) {
      window.addEventListener(eventName, enable, opts);
    }

    const timer = window.setTimeout(enable, GA_IDLE_FALLBACK_MS);

    return () => {
      window.clearTimeout(timer);
      for (const eventName of events) {
        window.removeEventListener(eventName, enable);
      }
    };
  }, [shouldLoad]);

  return (
    <>
      {shouldLoad ? (
        <>
          <Script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });
            `}
          </Script>
        </>
      ) : null}
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker enabled={shouldLoad} />
      </Suspense>
    </>
  );
}
