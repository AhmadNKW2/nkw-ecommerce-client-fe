"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import {
  getClientId,
  markLocalClientIdAsAdmin,
} from "@/lib/analytics";

const STAFF_ROLES = new Set([
  "admin",
  "constant_token_admin",
  "catalog_manager",
  "vendor_admin",
  "store_admin",
]);

/**
 * Admin user logged in on the storefront → take the existing client id
 * and mark it as an admin device (no separate admin client id).
 */
export function RegisterAdminStorefrontDevice() {
  const { user } = useAuth();
  const doneForUserRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (!user?.role || !STAFF_ROLES.has(user.role)) return;
    if (doneForUserRef.current === user.id) return;

    const clientId = getClientId();
    if (!clientId) return;

    doneForUserRef.current = user.id;

    void apiClient
      .post("/analytics/admin-clients/register", {
        browserKey: clientId,
        source: "storefront",
        userAgent: navigator.userAgent.slice(0, 512),
      })
      .then(() => {
        markLocalClientIdAsAdmin();
      })
      .catch(() => {
        doneForUserRef.current = null;
      });
  }, [user?.role, user?.id]);

  return null;
}
