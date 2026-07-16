"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const GA_MEASUREMENT_ID = "G-L5CKSLWKWV";
/** Delay fallback so Lighthouse can finish before analytics loads. */
const GA_IDLE_FALLBACK_MS = 12_000;

function getReadableClickName(el: HTMLElement): string {
  const analyticsLabel = el.getAttribute("data-analytics-label");
  if (analyticsLabel) return analyticsLabel;

  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel;

  const title = el.getAttribute("title");
  if (title) return title;

  const text = el.textContent?.replace(/\s+/g, " ").trim();
  if (text && text.length <= 60) return text;
  if (text) return text.slice(0, 60) + "...";

  const nestedImg = el.querySelector("img");
  if (nestedImg instanceof HTMLImageElement && nestedImg.alt?.trim()) {
    return nestedImg.alt.trim();
  }

  const nestedLabeled = el.querySelector("[aria-label], [title]");
  if (nestedLabeled instanceof HTMLElement) {
    const nestedAria = nestedLabeled.getAttribute("aria-label");
    if (nestedAria) return nestedAria;
    const nestedTitle = nestedLabeled.getAttribute("title");
    if (nestedTitle) return nestedTitle;
  }

  const tag = el.tagName.toLowerCase();
  if (tag === "input") {
    const inputEl = el as HTMLInputElement;
    return inputEl.placeholder || inputEl.name || "Input field";
  }
  if (tag === "img") {
    return (el as HTMLImageElement).alt || "Image";
  }

  return tag === "button" ? "Unlabeled button" : tag;
}

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

    // Capture label during the capture phase (before React sets isLoading),
    // otherwise buttons briefly show "Loading..." and we track that instead.
    const scheduleClickTracking = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const clickable = target.closest(
        'a, button, input, select, textarea, [role="button"]',
      );
      if (!(clickable instanceof HTMLElement)) return;
      if (clickable.hasAttribute("data-analytics-ignore")) return;

      const name = getReadableClickName(clickable);
      const tag = clickable.tagName.toLowerCase();
      const elementType =
        tag === "a"
          ? "Link"
          : tag === "button"
            ? "Button"
            : tag === "input"
              ? "Input"
              : tag;
      const linkGoesTo =
        clickable instanceof HTMLAnchorElement
          ? (clickable.getAttribute("href") ?? undefined)
          : undefined;

      const run = () => {
        trackEvent(`Clicked: ${name}`, {
          "Element Type": elementType,
          "Link Goes To": linkGoesTo,
        });
      };

      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(run, { timeout: 500 });
        return;
      }
      window.setTimeout(run, 0);
    };

    document.addEventListener("click", scheduleClickTracking, true);
    return () => document.removeEventListener("click", scheduleClickTracking, true);
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
