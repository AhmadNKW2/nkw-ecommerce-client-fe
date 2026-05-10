"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "@/i18n/navigation";
import { buildAuthHref, getReturnToFromPath } from "@/lib/auth-redirect";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Redirects unauthenticated users to /login.
 * Used as a client-side safety net on protected pages (profile, checkout, etc.)
 * in case the middleware cookie check passes but the session is actually gone.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = getReturnToFromPath(pathname, searchParams);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(buildAuthHref("/login", returnTo));
    }
  }, [isLoading, returnTo, router, user]);

  // Show nothing while loading or redirecting
  if (isLoading || !user) return null;

  return <>{children}</>;
}
