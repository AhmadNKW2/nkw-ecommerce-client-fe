"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/components/ui/global-loader";

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function PageRenderObserver() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { markPageRendered } = useLoading();
  const routeKey = React.useMemo(() => {
    const paramsString = searchParams?.toString() || "";
    return paramsString ? `${pathname}?${paramsString}` : pathname;
  }, [pathname, searchParams]);

  React.useEffect(() => {
    let animationFrameId = 0;
    let nestedAnimationFrameId = 0;

    animationFrameId = window.requestAnimationFrame(() => {
      nestedAnimationFrameId = window.requestAnimationFrame(() => {
        markPageRendered(routeKey);
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.cancelAnimationFrame(nestedAnimationFrameId);
    };
  }, [markPageRendered, routeKey]);

  return null;
}

export function PageWrapper({ children, className, ...props }: PageWrapperProps) {
  return (
    <div
      className={cn(
        "container mx-auto flex flex-col gap-5 md:py-10 py-5 px-4 md:px-5",
        className
      )}
      {...props}
    >
      <React.Suspense fallback={null}>
        <PageRenderObserver />
      </React.Suspense>
      {children}
    </div>
  );
}
