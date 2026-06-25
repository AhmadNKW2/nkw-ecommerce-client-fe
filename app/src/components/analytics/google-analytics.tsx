"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const GA_MEASUREMENT_ID = "G-L5CKSLWKWV";

// Figures out a clear, human name for whatever was clicked.
// Priority: aria-label -> title -> visible text -> element type
function getReadableClickName(el: HTMLElement): string {
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  const title = el.getAttribute('title');
  if (title) return title;

  const text = el.textContent?.replace(/\s+/g, ' ').trim();
  if (text && text.length <= 60) return text;
  if (text) return text.slice(0, 60) + '...';

  // Fallback to something descriptive based on tag
  const tag = el.tagName.toLowerCase();
  if (tag === 'input') {
    const inputEl = el as HTMLInputElement;
    return inputEl.placeholder || inputEl.name || 'Input field';
  }
  if (tag === 'img') {
    return (el as HTMLImageElement).alt || 'Image';
  }

  return tag;
}

function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedSessionStartRef = useRef(false);

  // Fires once per visit, right when the site loads
  useEffect(() => {
    if (!hasTrackedSessionStartRef.current) {
      hasTrackedSessionStartRef.current = true;
      trackEvent('Session Started');
    }
  }, []);

  // Fires every time someone clicks something worth tracking
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      // Only track clicks on things that are actually clickable
      const clickable = target.closest('a, button, input, select, textarea, [role="button"]');
      if (!(clickable instanceof HTMLElement)) return;

      const name = getReadableClickName(clickable);
      const tag = clickable.tagName.toLowerCase();

      // Build a clean, readable event name like "Clicked: Add to Cart"
      const eventName = `Clicked: ${name}`;

      trackEvent(eventName, {
        "Element Type": tag === 'a' ? 'Link' : tag === 'button' ? 'Button' : tag === 'input' ? 'Input' : tag,
        "Link Goes To": clickable instanceof HTMLAnchorElement ? clickable.getAttribute('href') ?? undefined : undefined,
      });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  // Fires every time the page changes
  useEffect(() => {
    const paramsString = searchParams?.toString();
    const pagePath = paramsString ? `${pathname}?${paramsString}` : pathname;

    trackEvent('Page Viewed', {
      "Page": pagePath,
      "Page Title": document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  return (
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
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker />
      </Suspense>
    </>
  );
}
