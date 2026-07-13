"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type User } from "@/types";
import { authService } from "@/services/auth.service";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api-client";
import { getCookie, setCookie, deleteCookie } from "@/lib/utils";
import { useLoadingActionsOnly } from "@/components/ui/global-loader";

const AUTH_KEYS = {
  user: ["auth", "user"],
};

const OAUTH_SUCCESS_PARAM = "auth";
const OAUTH_SUCCESS_VALUE = "success";

function hasSessionHint(): boolean {
  if (typeof window === "undefined") return false;
  if (getCookie("is_logged_in") === "1") return true;
  if (apiClient.getAccessToken()) return true;

  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(OAUTH_SUCCESS_PARAM) === OAUTH_SUCCESS_VALUE;
  } catch {
    return false;
  }
}

function clearOAuthSuccessParam() {
  if (typeof window === "undefined") return;

  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get(OAUTH_SUCCESS_PARAM) !== OAUTH_SUCCESS_VALUE) {
      return;
    }

    url.searchParams.delete(OAUTH_SUCCESS_PARAM);
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", next);
  } catch {
    // Ignore URL cleanup failures.
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setIsLoading } = useLoadingActionsOnly();
  const [shouldFetchProfile, setShouldFetchProfile] = useState(hasSessionHint);

  useEffect(() => {
    const handler = () => {
      queryClient.setQueryData(AUTH_KEYS.user, null);
      setShouldFetchProfile(false);
    };

    window.addEventListener("auth:logout", handler as EventListener);
    return () => window.removeEventListener("auth:logout", handler as EventListener);
  }, [queryClient]);

  // Query to get current user profile — only when a session is likely.
  // Guests must not hit /auth/profile (or /auth/refresh) or Chrome logs 401s that fail Lighthouse.
  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: AUTH_KEYS.user,
    enabled: shouldFetchProfile,
    queryFn: async () => {
        try {
            const profile = await authService.getProfile();
            // Sync an indicator cookie so middleware can quickly verify auth without calling backend
            setCookie('is_logged_in', '1', 7);
            clearOAuthSuccessParam();
            return profile;
        } catch(e) {
            // Cookie-based auth: 401/403 simply means "not logged in".
            // Don't treat it as a hard error and don't clear anything client-side.
            if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
              deleteCookie('is_logged_in');
              clearOAuthSuccessParam();
              setShouldFetchProfile(false);
              return null;
            }

            // Other errors (network/5xx) shouldn't force logout.
            clearOAuthSuccessParam();
            return null;
        }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (response) => {
      // Backend sets HttpOnly cookies; just refetch profile.
      // If backend also returns the user in body, this still works.
      const anyResponse = response as any;
      const nextUser = anyResponse?.data?.user || anyResponse?.user;
      
      // Store token if available
      const token = anyResponse?.data?.access_token || anyResponse?.access_token;
      if (token) apiClient.setAccessToken(token);
      setCookie('is_logged_in', '1', 7);
      setShouldFetchProfile(true);

      if (nextUser) {
        queryClient.setQueryData(AUTH_KEYS.user, nextUser);
      }

      await queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user, refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: AUTH_KEYS.user, type: "active" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: async (response) => {
      const anyResponse = response as any;
      const nextUser = anyResponse?.data?.user || anyResponse?.user;

      // Store token if available
      const token = anyResponse?.data?.access_token || anyResponse?.access_token;
      if (token) apiClient.setAccessToken(token);
      setCookie('is_logged_in', '1', 7);
      setShouldFetchProfile(true);

      if (nextUser) {
        queryClient.setQueryData(AUTH_KEYS.user, nextUser);
      }

      await queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user, refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: AUTH_KEYS.user, type: "active" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onMutate: () => {
      setIsLoading(true);
    },
    onError: () => {
      setIsLoading(false);
    },
    onSettled: () => {
      apiClient.clearAccessToken();
      deleteCookie('is_logged_in');
      setShouldFetchProfile(false);
      queryClient.setQueryData(AUTH_KEYS.user, null);
      queryClient.invalidateQueries(); // Invalidate all queries on logout to clear sensitive data
      router.push("/");
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    // While we intentionally skip guest profile calls, treat as not loading.
    isLoading: shouldFetchProfile ? isLoading : false,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
