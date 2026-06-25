"use client";

import React, {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useIsFetching } from "@tanstack/react-query";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  markPageRendered: (routeKey: string) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
  startLoading: () => {},
  markPageRendered: () => {},
});

export const useLoading = () => useContext(LoadingContext);

interface GlobalLoaderProps {
  children: React.ReactNode;
}

function RouteObserver() {
  const { isLoading, setIsLoading } = useLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFetching = useIsFetching();
  const previousPathRef = useRef(pathname);
  const previousParamsRef = useRef(searchParams?.toString() || "");
  const pendingRouteKeyRef = useRef<string | null>(null);
  const renderedRouteKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const handleLoadingStarted = () => {
      pendingRouteKeyRef.current = null;
      renderedRouteKeyRef.current = null;
    };

    window.addEventListener("global-loader:start", handleLoadingStarted);

    return () => {
      window.removeEventListener("global-loader:start", handleLoadingStarted);
    };
  }, []);

  useEffect(() => {
    const paramsString = searchParams?.toString() || "";
    const hasPathChanged = pathname !== previousPathRef.current;
    const hasParamsChanged = paramsString !== previousParamsRef.current;
    const routeKey = paramsString ? `${pathname}?${paramsString}` : pathname;

    if (hasPathChanged) {
      previousPathRef.current = pathname;
    }

    if (hasParamsChanged) {
      previousParamsRef.current = paramsString;
    }

    if (!hasPathChanged && !hasParamsChanged) {
      return;
    }

    if (typeof window !== "undefined" && hasPathChanged) {
      window.scrollTo(0, 0);
    }

    if (isLoading) {
      pendingRouteKeyRef.current = routeKey;
    }
  }, [pathname, searchParams, isLoading]);

  useEffect(() => {
    const handlePageRendered = (event: Event) => {
      const renderedRouteKey = (event as CustomEvent<string>).detail;
      if (!renderedRouteKey) {
        return;
      }

      renderedRouteKeyRef.current = renderedRouteKey;

      if (
        isLoading &&
        pendingRouteKeyRef.current != null &&
        pendingRouteKeyRef.current === renderedRouteKey &&
        isFetching === 0
      ) {
        setIsLoading(false);
      }
    };

    window.addEventListener("global-loader:page-rendered", handlePageRendered);

    return () => {
      window.removeEventListener("global-loader:page-rendered", handlePageRendered);
    };
  }, [isLoading, isFetching, setIsLoading]);

  useEffect(() => {
    if (!isLoading || !pendingRouteKeyRef.current || !renderedRouteKeyRef.current) {
      return;
    }

    if (
      isFetching === 0 &&
      pendingRouteKeyRef.current === renderedRouteKeyRef.current
    ) {
      setIsLoading(false);
    }
  }, [isLoading, isFetching, setIsLoading]);

  return null;
}

function LoaderVisuals({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-white/28 backdrop-blur-[0.5px]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary">
            <motion.div
              className="h-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: "90%" }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function GlobalLoaderProvider({ children }: GlobalLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("global-loader:start"));
    }
  }, []);

  const markPageRendered = useCallback((routeKey: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("global-loader:page-rendered", { detail: routeKey }));
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      isLoading,
      setIsLoading,
      startLoading,
      markPageRendered,
    }),
    [isLoading, startLoading, markPageRendered],
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 6000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor?.getAttribute("data-prevent-loader") === "true") {
        return;
      }

      if (
        !anchor ||
        !anchor.href ||
        anchor.target === "_blank" ||
        anchor.target === "_parent" ||
        anchor.target === "_top" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const url = new URL(anchor.href);

      if (url.origin === window.location.origin && url.href !== window.location.href) {
        startLoading();
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, [startLoading]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <Suspense fallback={null}>
        <RouteObserver />
      </Suspense>
      <LoaderVisuals isLoading={isLoading} />
    </LoadingContext.Provider>
  );
}
