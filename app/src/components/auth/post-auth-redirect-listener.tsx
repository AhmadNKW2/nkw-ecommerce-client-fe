"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "@/i18n/navigation";
import { getReturnToFromPath } from "@/lib/auth-redirect";
import {
  clearPostAuthRedirect,
  getPostAuthRedirect,
} from "@/lib/post-auth-redirect";

export function PostAuthRedirectListener() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = getReturnToFromPath(pathname, searchParams);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    const redirectTarget = getPostAuthRedirect();

    if (!redirectTarget) {
      return;
    }

    clearPostAuthRedirect();

    if (redirectTarget !== currentPath) {
      router.replace(redirectTarget);
    }
  }, [currentPath, isLoading, router, user]);

  return null;
}