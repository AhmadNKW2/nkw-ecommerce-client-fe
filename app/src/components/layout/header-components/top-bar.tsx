"use client";

import { FREE_SHIPPING_MIN_ORDER_AMOUNT } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { useSeoSettings } from "@/hooks/useSeoSettings";

export function TopBar() {
  const t = useTranslations("topBar");
  const { data: seoSettings, isPending } = useSeoSettings();

  // Only reserve height when we have no dehydrated SEO yet. Never collapse from a
  // painted bar → null (that shifts the sticky header and tanked field CLS).
  if (isPending && !seoSettings) {
    return (
      <div
        className="bg-secondary text-white py-2 text-center text-sm min-h-9"
        aria-hidden="true"
      >
        <p className="invisible">
          {t("announcement", { amount: FREE_SHIPPING_MIN_ORDER_AMOUNT })}
        </p>
      </div>
    );
  }

  if (seoSettings?.free_delivery_enabled === false) {
    return null;
  }

  const amount = seoSettings?.free_delivery_amount ?? FREE_SHIPPING_MIN_ORDER_AMOUNT;

  return (
    <div className="bg-secondary text-white py-2 text-center text-sm min-h-9">
      <p>{t("announcement", { amount })}</p>
    </div>
  );
}
