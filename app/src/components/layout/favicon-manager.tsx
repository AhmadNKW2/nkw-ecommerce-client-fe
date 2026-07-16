"use client";

import { useEffect } from "react";

import { useSeoSettings } from "@/hooks/useSeoSettings";
import { resolveSiteLogo, updateDocumentFavicon } from "@/lib/site-branding";

export function FaviconManager() {
  const { data: seoSettings, isSuccess } = useSeoSettings();

  useEffect(() => {
    if (!isSuccess || typeof document === "undefined") {
      return;
    }

    updateDocumentFavicon(resolveSiteLogo(seoSettings));
  }, [isSuccess, seoSettings]);

  return null;
}
