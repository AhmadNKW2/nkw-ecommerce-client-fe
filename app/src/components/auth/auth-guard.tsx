"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "@/i18n/navigation";
import { buildAuthHref, getReturnToFromWindow } from "@/lib/auth-redirect";

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

  useEffect(() => {
    if (!isLoading && !user) {
      const returnTo = getReturnToFromWindow(pathname);
      router.replace(buildAuthHref("/login", returnTo));
    }
  }, [isLoading, pathname, router, user]);

  // Show nothing while loading or redirecting
  if (isLoading || !user) return null;

  return <>{children}</>;
}
