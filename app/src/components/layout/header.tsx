"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { IconButton } from "@/components/ui";
import { SearchBox } from "@/components/search/SearchBox";
import {
  TopBar,
  Logo,
  HeaderActions,
  MobileNav,
  NavigationBar,
} from "./header-components";
import { BottomNav } from "./bottom-nav";

const CartSidebar = dynamic(
  () => import("@/components/cart").then((mod) => mod.CartSidebar),
  { ssr: false },
);

const SitePopup = dynamic(
  () => import("@/components/site-popup").then((mod) => mod.SitePopup),
  { ssr: false },
);

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileNavTop, setMobileNavTop] = useState(0);
  const [deferHeavyUi, setDeferHeavyUi] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    const updateMobileNavTop = () => {
      setMobileNavTop(headerRef.current?.getBoundingClientRect().bottom ?? 0);
    };

    updateMobileNavTop();

    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(updateMobileNavTop)
      : null;

    if (observer && headerRef.current) {
      observer.observe(headerRef.current);
    }

    window.addEventListener("resize", updateMobileNavTop);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateMobileNavTop);
    };
  }, []);

  // Defer cart drawer + promo popup until idle / interaction so homepage JS stays lighter.
  useEffect(() => {
    const enable = () => setDeferHeavyUi(true);
    const opts: AddEventListenerOptions = { once: true, passive: true };
    const events = ["pointerdown", "keydown", "touchstart"] as const;

    for (const eventName of events) {
      window.addEventListener(eventName, enable, opts);
    }

    let idleId: number | undefined;
    let timer: number | undefined;

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 4000 });
    } else {
      timer = window.setTimeout(enable, 2500);
    }

    return () => {
      for (const eventName of events) {
        window.removeEventListener(eventName, enable);
      }
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white shadow-s1">
      <TopBar />

      <div className="bg-primary lg:border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-5">
          <div className="flex items-center justify-between gap-2 h-16 md:h-20">
            <div className="flex items-center gap-2 min-w-0">
              <div className="lg:hidden flex items-center">
                <IconButton
                  variant="header"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle menu"
                  icon={isMenuOpen ? "x" : "menu"}
                />
              </div>
              <Logo
                className="shrink-0"
                imageClassName="h-7 w-auto md:h-11 md:max-w-none"
              />
            </div>

            <div className="hidden lg:block flex-1 max-w-2xl mx-auto">
              <Suspense fallback={null}>
                <SearchBox />
              </Suspense>
            </div>

            <div className="relative z-10 flex items-center gap-2">
              <HeaderActions />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary lg:hidden pb-3">
        <div className="container mx-auto px-4 md:px-5">
          <Suspense fallback={null}>
            <SearchBox />
          </Suspense>
        </div>
      </div>

      <NavigationBar />

      <MobileNav isOpen={isMenuOpen} onClose={closeMenu} topOffset={mobileNavTop} />

      <CartSidebar />

      <BottomNav />

      {deferHeavyUi ? <SitePopup /> : null}
    </header>
  );
}
