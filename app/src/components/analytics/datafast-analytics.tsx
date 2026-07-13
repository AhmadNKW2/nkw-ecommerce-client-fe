"use client";

import { useEffect } from "react";
import { initDataFastClient } from "@/lib/datafast";

export function DataFastAnalytics() {
  useEffect(() => {
    const start = () => {
      void initDataFastClient();
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(start, 2500);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
