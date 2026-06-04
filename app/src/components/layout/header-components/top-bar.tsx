"use client";

import { FREE_SHIPPING_MIN_ORDER_AMOUNT } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";

export function TopBar() {
  const t = useTranslations('topBar');
  const { data: seoSettings } = useQuery({
    queryKey: ["seo-settings"],
    queryFn: settingsService.getSeoSettings,
    staleTime: 5 * 60 * 1000,
  });

  const amount = seoSettings?.free_delivery_amount ?? FREE_SHIPPING_MIN_ORDER_AMOUNT;
  
  return (
    <div className="bg-secondary text-white py-2 text-center text-sm">
      <p>{t('announcement', { amount })}</p>
    </div>
  );
}
