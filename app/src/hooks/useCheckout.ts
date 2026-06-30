"use client";

import { useAuth } from "./useAuth";
import { useAuthModal } from "@/contexts/auth-modal-context";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  resolveFeatureToggles,
  useFeatureToggles,
} from "@/hooks/useFeatureToggles";

export function useCheckout() {
  const { user } = useAuth();
  const { data: featureToggles, isLoading: isFeatureTogglesLoading } = useFeatureToggles();
  const { easyPurchaseEnabled } = resolveFeatureToggles(featureToggles);
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();

  const handleCheckout = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!user && !easyPurchaseEnabled && !isFeatureTogglesLoading) {
      openAuthModal("login", { returnTo: "/checkout" });
      return;
    }

    if (!user && !easyPurchaseEnabled && isFeatureTogglesLoading) {
      return;
    }

    if (pathname === '/checkout') {
      return;
    }

    router.push("/checkout");
  };

  return { handleCheckout };
}
