import { FREE_SHIPPING_MIN_ORDER_AMOUNT, STANDARD_SHIPPING_FEE } from "@/lib/constants";
import type { SeoSettings } from "@/types/api.types";

export function resolveDeliveryFee(seoSettings?: SeoSettings | null): number {
  const fee = seoSettings?.delivery_fee;
  if (fee !== undefined && fee !== null && Number.isFinite(Number(fee))) {
    return Number(fee);
  }
  return STANDARD_SHIPPING_FEE;
}

export function resolveFreeShippingThreshold(seoSettings?: SeoSettings | null): number {
  return seoSettings?.free_delivery_amount ?? FREE_SHIPPING_MIN_ORDER_AMOUNT;
}

export function isFreeDeliveryEnabled(seoSettings?: SeoSettings | null): boolean {
  return seoSettings?.free_delivery_enabled !== false;
}

export function calculateShipping(subtotal: number, seoSettings?: SeoSettings | null): number {
  if (isFreeDeliveryEnabled(seoSettings) && subtotal >= resolveFreeShippingThreshold(seoSettings)) {
    return 0;
  }
  return resolveDeliveryFee(seoSettings);
}
