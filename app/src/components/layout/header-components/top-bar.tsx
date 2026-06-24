"use client";

import { FREE_SHIPPING_MIN_ORDER_AMOUNT } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { useSeoSettings } from "@/hooks/useSeoSettings";

export function TopBar() {
  const t = useTranslations('topBar');
  const { data: seoSettings, isPending } = useSeoSettings();

  // Avoid rendering a misleading free-delivery announcement before settings load.
  if (isPending) {
    return null;
  }

  if (seoSettings?.free_delivery_enabled === false) {
    return null;
  }

  const amount = seoSettings?.free_delivery_amount ?? FREE_SHIPPING_MIN_ORDER_AMOUNT;
  
  return (
    <div className="bg-secondary text-white py-2 text-center text-sm">
      <p>{t('announcement', { amount })}</p>
    </div>
  );
}
