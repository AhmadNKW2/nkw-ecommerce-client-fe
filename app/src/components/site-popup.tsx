"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";

const SESSION_STORAGE_KEY = "nkw-site-popup-dismissed";

export function SitePopup() {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { data: popupSettings } = useQuery({
    queryKey: ["site-popup-settings"],
    queryFn: settingsService.getSitePopupSettings,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const dismissPopup = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      sessionStorage.setItem(SESSION_STORAGE_KEY, "1");
    }, prefersReducedMotion ? 0 : 280);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      return;
    }

    if (!popupSettings?.enabled || !popupSettings.image_url) {
      return;
    }

    const openTimer = window.setTimeout(() => {
      setIsVisible(true);
    }, 600);

    return () => window.clearTimeout(openTimer);
  }, [popupSettings?.enabled, popupSettings?.image_url]);

  useEffect(() => {
    if (!isVisible || !popupSettings?.dismiss_after_seconds) {
      return;
    }

    const autoDismissMs = popupSettings.dismiss_after_seconds * 1000;
    const timer = window.setTimeout(() => {
      dismissPopup();
    }, autoDismissMs);

    return () => window.clearTimeout(timer);
  }, [dismissPopup, isVisible, popupSettings?.dismiss_after_seconds]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismissPopup();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [dismissPopup, isVisible]);

  if (!popupSettings?.enabled || !popupSettings.image_url) {
    return null;
  }

  const imageContent = (
    <Image
      src={popupSettings.image_url}
      alt="Promotion"
      width={0}
      height={0}
      sizes="(max-width: 640px) 92vw, 672px"
      className="mx-auto block h-auto max-h-[85vh] w-auto max-w-full rounded-2xl object-contain"
      style={{ width: "auto", height: "auto", maxWidth: "100%" }}
      priority
    />
  );

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          key="site-popup-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: isClosing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: "easeOut" }}
        >
          <button
            type="button"
            aria-label="Close popup"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={dismissPopup}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site promotion"
            className="relative z-[101] w-full max-w-2xl"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.92, y: 24 }
            }
            animate={
              isClosing
                ? prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: 12 }
                : prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 12 }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close popup"
              onClick={dismissPopup}
              className="absolute -top-3 -right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white text-gray-700 shadow-lg transition-transform hover:scale-105 hover:bg-gray-50"
            >
              <X className="h-5 w-5" />
            </button>

            {popupSettings.link_url ? (
              <a
                href={popupSettings.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20"
                onClick={dismissPopup}
              >
                {imageContent}
              </a>
            ) : (
              <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
                {imageContent}
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
