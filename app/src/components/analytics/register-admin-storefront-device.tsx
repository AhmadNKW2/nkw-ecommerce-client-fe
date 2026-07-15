"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";

const BROWSER_STORAGE_KEY = "ordonsooq_browser_key";
const ADMIN_CLIENT_COOKIE = "os_admin_client";

const STAFF_ROLES = new Set([
  "admin",
  "constant_token_admin",
  "catalog_manager",
  "vendor_admin",
  "store_admin",
]);

function getOrCreateBrowserKey(): string {
  let id = window.localStorage.getItem(BROWSER_STORAGE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(BROWSER_STORAGE_KEY, id);
  }
  return id;
}

function setAdminClientCookie(browserKey: string) {
  const maxAge = 60 * 60 * 24 * 400;
  const host = window.location.hostname;
  const parts = [
    `${ADMIN_CLIENT_COOKIE}=${encodeURIComponent(browserKey)}`,
    "path=/",
    `max-age=${maxAge}`,
    "SameSite=Lax",
  ];
  if (host.endsWith("ordonsooq.com")) {
    parts.push("domain=.ordonsooq.com");
    if (window.location.protocol === "https:") parts.push("Secure");
  }
  document.cookie = parts.join("; ");
}

/**
 * When a staff account is logged in on the storefront, register this browser
 * as an admin device so Visitors analytics ignores it.
 */
export function RegisterAdminStorefrontDevice() {
  const { user } = useAuth();
  const registeredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.role || !STAFF_ROLES.has(user.role)) return;

    const browserKey = getOrCreateBrowserKey();
    if (registeredRef.current === browserKey) return;
    registeredRef.current = browserKey;
    setAdminClientCookie(browserKey);

    void apiClient
      .post("/analytics/admin-clients/register", {
        browserKey,
        source: "storefront",
        userAgent: navigator.userAgent.slice(0, 512),
      })
      .catch(() => {
        registeredRef.current = null;
      });
  }, [user?.role, user?.id]);

  return null;
}
