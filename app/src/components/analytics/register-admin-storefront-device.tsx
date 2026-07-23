'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { getClientId, markLocalClientIdAsAdmin } from '@/lib/analytics';

const STAFF_ROLES = new Set([
  'admin',
  'constant_token_admin',
  'vendor_admin',
  'store_admin',
]);

let lastRegisteredKey: string | null = null;
let lastRegisteredAt = 0;
let inFlight: Promise<void> | null = null;
const REREGISTER_MS = 2_000;

/**
 * Staff logged in on the storefront → re-register this browser's client id
 * on load/refresh and on every route change. Same admin can have many devices.
 */
export function RegisterAdminStorefrontDevice() {
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!user?.role || !STAFF_ROLES.has(user.role)) return;

    const clientId = getClientId();
    if (!clientId) return;

    const freshEnough =
      lastRegisteredKey === clientId &&
      Date.now() - lastRegisteredAt < REREGISTER_MS;
    if (freshEnough && !inFlight) return;

    if (inFlight) {
      void inFlight;
      return;
    }

    inFlight = apiClient
      .post('/analytics/admin-clients/register', {
        browserKey: clientId,
        source: 'storefront',
        userAgent: navigator.userAgent.slice(0, 512),
      })
      .then(() => {
        markLocalClientIdAsAdmin();
        lastRegisteredKey = clientId;
        lastRegisteredAt = Date.now();
      })
      .catch(() => {
        lastRegisteredKey = null;
        lastRegisteredAt = 0;
      })
      .finally(() => {
        inFlight = null;
      });
  }, [user?.role, user?.id, pathname]);

  return null;
}
