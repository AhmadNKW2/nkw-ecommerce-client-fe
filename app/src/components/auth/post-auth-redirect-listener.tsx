"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "@/i18n/navigation";
import { getReturnToFromWindow } from "@/lib/auth-redirect";
import {
  clearPostAuthRedirect,
  getPostAuthRedirect,
} from "@/lib/post-auth-redirect";

export function PostAuthRedirectListener() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    const redirectTarget = getPostAuthRedirect();

    if (!redirectTarget) {
      return;
    }

    clearPostAuthRedirect();

    const currentPath = getReturnToFromWindow(pathname);

    if (redirectTarget !== currentPath) {
      router.replace(redirectTarget);
    }
  }, [isLoading, pathname, router, user]);

  return null;
}