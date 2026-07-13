"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";

const ANALYTICS_IDLE_FALLBACK_MS = 12_000;

/** Load Vercel Analytics after interaction so it stays out of Lighthouse lab windows. */
export function DeferredVercelAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (enabled) return;

    const enable = () => setEnabled(true);
    const opts: AddEventListenerOptions = { once: true, passive: true };
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

    for (const eventName of events) {
      window.addEventListener(eventName, enable, opts);
    }

    const timer = window.setTimeout(enable, ANALYTICS_IDLE_FALLBACK_MS);

    return () => {
      window.clearTimeout(timer);
      for (const eventName of events) {
        window.removeEventListener(eventName, enable);
      }
    };
  }, [enabled]);

  if (!enabled) return null;
  return <Analytics />;
}
