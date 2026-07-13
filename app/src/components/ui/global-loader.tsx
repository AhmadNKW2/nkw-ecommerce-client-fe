"use client";

import React, {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useIsFetching } from "@tanstack/react-query";

interface LoadingActions {
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  markPageRendered: (routeKey: string) => void;
}

interface LoadingContextType extends LoadingActions {
  isLoading: boolean;
}

const loadingStore = {
  isLoading: false,
  listeners: new Set<() => void>(),
};

function subscribeToLoading(listener: () => void) {
  loadingStore.listeners.add(listener);
  return () => {
    loadingStore.listeners.delete(listener);
  };
}

function getLoadingSnapshot() {
  return loadingStore.isLoading;
}

function setGlobalLoading(loading: boolean) {
  if (loadingStore.isLoading === loading) {
    return;
  }

  loadingStore.isLoading = loading;
  loadingStore.listeners.forEach((listener) => listener());
}

const LoadingContext = createContext<LoadingActions>({
  setIsLoading: setGlobalLoading,
  startLoading: () => {},
  markPageRendered: () => {},
});

function useLoadingActions() {
  return useContext(LoadingContext);
}

function useLoadingState() {
  return useSyncExternalStore(subscribeToLoading, getLoadingSnapshot, () => false);
}

export function useLoadingActionsOnly() {
  return useLoadingActions();
}

export function useLoading(): LoadingContextType {
  const actions = useLoadingActions();
  const isLoading = useLoadingState();

  return {
    ...actions,
    isLoading,
  };
}

interface GlobalLoaderProps {
  children: React.ReactNode;
}

function RouteObserver() {
  const { setIsLoading } = useLoadingActions();
  const isLoading = useLoadingState();
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

function LoaderVisuals() {
  const isLoading = useLoadingState();

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

function LoadingTimeout() {
  const isLoading = useLoadingState();

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setGlobalLoading(false);
    }, 6000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  return null;
}

function AnchorClickListener() {
  const { startLoading } = useLoadingActions();

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

  return null;
}

export function GlobalLoaderProvider({ children }: GlobalLoaderProps) {
  const startLoading = useCallback(() => {
    setGlobalLoading(true);

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
      setIsLoading: setGlobalLoading,
      startLoading,
      markPageRendered,
    }),
    [startLoading, markPageRendered],
  );

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <AnchorClickListener />
      <LoadingTimeout />
      <Suspense fallback={null}>
        <RouteObserver />
      </Suspense>
      <LoaderVisuals />
    </LoadingContext.Provider>
  );
}
