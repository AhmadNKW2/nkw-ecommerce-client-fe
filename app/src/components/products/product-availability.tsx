"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, PackageX, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { CURRENCY_CONFIG } from "@/lib/constants";
import {
  formatRemainingDuration,
  getDeliveryEstimate,
  resolveShippingRulesConfig,
  type DeliveryEstimate,
  type ShippingRulesConfig,
} from "@/lib/delivery-estimate";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/transformers";
import type { SeoSettings } from "@/types/api.types";

function ProductStockStatus({ stock }: { stock: number }) {
  const t = useTranslations("product");
  const inStock = stock > 0;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        inStock
          ? "border-success/25 bg-success/8 text-success"
          : "border-danger/25 bg-danger/8 text-danger",
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
          inStock ? "bg-success/15 text-success" : "bg-danger/15",
        )}
      >
        {inStock ? (
          <CheckCircle2 className="size-4" aria-hidden />
        ) : (
          <PackageX className="size-4" aria-hidden />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-snug">
          {inStock ? t("inStock") : t("outOfStock")}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-80">
          {inStock ? t("inStockReady") : t("outOfStockDesc")}
        </p>
      </div>
    </div>
  );
}

function useLiveNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

function getEstimateMessage(
  t: (key: string, values?: Record<string, string | number>) => string,
  estimate: DeliveryEstimate,
  locale: string,
) {
  if (estimate.beforeCutoff && estimate.remainingMs != null && estimate.remainingMs > 0) {
    return t("deliveryEstimate.orderWithinForDate", {
      time: formatRemainingDuration(estimate.remainingMs, locale),
      date: estimate.arrivalDateLabel,
    });
  }

  if (estimate.arrivalKind === "inTwoDays") {
    return t("deliveryEstimate.orderNowInTwoDays", {
      date: estimate.arrivalDateLabel,
    });
  }

  return t("deliveryEstimate.orderNowForDate", {
    date: estimate.arrivalDateLabel,
  });
}

function ProductDeliveryPanel({
  deliveryFee,
  shippingRules,
  className,
}: {
  deliveryFee: number;
  shippingRules: ShippingRulesConfig;
  className?: string;
}) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const now = useLiveNow();
  const estimate = useMemo(
    () => getDeliveryEstimate(now, locale, shippingRules.cutoffHour),
    [locale, now, shippingRules.cutoffHour],
  );

  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(deliveryFee);
  const currencyUnit = locale === "ar" ? CURRENCY_CONFIG.symbolAr : "JD";
  const estimateMessage = shippingRules.enabled
    ? getEstimateMessage(t, estimate, locale)
    : null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-secondary/15 bg-linear-to-br from-secondary/5 via-white to-primary2/5",
        className,
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
          <Truck className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold leading-snug text-primary">
            {t("kingdomDelivery")}
          </p>
          <p className="text-sm leading-snug text-third">
            {locale === "ar" ? (
              <>
                {t("kingdomDeliveryFeePrefix")}{" "}
                <span className="font-semibold text-primary">
                  {formattedAmount} {currencyUnit}
                </span>{" "}
                {t("kingdomDeliveryFeeSuffix")}
              </>
            ) : (
              <>
                {t("kingdomDeliveryFeePrefix")}{" "}
                <span className="font-semibold text-primary">
                  {formattedAmount} {currencyUnit}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {estimateMessage ? (
        <div className="border-t border-secondary/10 px-4 py-3.5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
              <Clock3 className="size-4" aria-hidden />
            </div>
            <p className="min-w-0 text-sm font-medium leading-snug text-primary">
              {estimateMessage}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProductAvailabilityBlock({
  stock,
  deliveryFee,
  seoSettings,
  className,
}: {
  stock: number;
  deliveryFee: number;
  seoSettings?: SeoSettings | null;
  className?: string;
}) {
  const shippingRules = resolveShippingRulesConfig(seoSettings);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <ProductStockStatus stock={stock} />
      <ProductDeliveryPanel deliveryFee={deliveryFee} shippingRules={shippingRules} />
    </div>
  );
}
