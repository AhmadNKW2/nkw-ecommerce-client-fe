"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PackageX, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
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

const LOW_STOCK_THRESHOLD = 5;

function ProductStockStatus({ stock }: { stock: number }) {
  const t = useTranslations("product");
  const inStock = stock > 0;
  const isLow = inStock && stock <= LOW_STOCK_THRESHOLD;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-3.5 py-3",
        inStock
          ? "border-secondary/50 bg-secondary/7"
          : "border-danger/20 bg-danger/5",
      )}
    >
      <span
        className={cn(
          "mt-1.5 size-2.5 shrink-0 rounded-full",
          !inStock && "bg-danger",
          inStock && !isLow && "bg-secondary",
          isLow && "bg-amber-500",
        )}
        aria-hidden
      />
      <div className="min-w-0 space-y-0.5">
        <p
          className={cn(
            "text-[15px] font-bold leading-snug tracking-tight",
            inStock ? "text-primary" : "text-danger2",
          )}
        >
          {inStock ? (isLow ? t("lowStock") : t("inStock")) : t("outOfStock")}
        </p>
        <p
          className={cn(
            "text-sm leading-snug",
            inStock ? "text-third" : "text-danger/80",
          )}
        >
          {inStock
            ? isLow
              ? t("lowStockCount", { count: stock })
              : t("inStockReady")
            : t("outOfStockDesc")}
        </p>
      </div>
      {!inStock ? (
        <PackageX className="ms-auto size-4 shrink-0 text-danger/70" aria-hidden />
      ) : null}
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

function getEstimateLine(
  t: ReturnType<typeof useTranslations<"product">>,
  estimate: DeliveryEstimate,
  locale: string,
) {
  const richValues = {
    date: estimate.arrivalDateLabel,
    time:
      estimate.remainingMs != null
        ? formatRemainingDuration(estimate.remainingMs, locale)
        : "",
    cta: (chunks: ReactNode) => (
      <span className="font-bold text-primary">{chunks}</span>
    ),
    when: (chunks: ReactNode) => (
      <span className="font-bold text-secondary">{chunks}</span>
    ),
  };

  if (estimate.beforeCutoff && estimate.remainingMs != null && estimate.remainingMs > 0) {
    return t.rich("deliveryEstimate.orderInForArrival", richValues);
  }

  return t.rich("deliveryEstimate.orderNowForArrival", richValues);
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
    () => getDeliveryEstimate(now, locale, shippingRules),
    [locale, now, shippingRules],
  );

  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(deliveryFee);
  const currencyUnit = locale === "ar" ? "د.أ" : "JD";
  const estimateLine = estimate ? getEstimateLine(t, estimate, locale) : null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)]",
        className,
      )}
      aria-label={t("deliveryTitle")}
    >
      <div className="flex items-center gap-2">
        <Truck className="size-5 shrink-0 text-[#111827]" aria-hidden />
        <h3 className="text-base font-bold leading-[1.45] text-[#111827]">
          {t("deliveryTitle")}
        </h3>
      </div>

      <p className="mt-2 text-sm font-normal leading-[1.45] text-[#6B7280]">
        {t("deliveryCoverage")}
      </p>

      <div className="mt-4">
        <p className="text-[15px] font-normal leading-[1.45] text-[#6B7280]">
          {t.rich("deliveryFeeOnly", {
            amount: formattedAmount,
            currency: currencyUnit,
            price: (chunks) => (
              <span className="text-[22px] font-bold leading-[1.3] text-secondary">
                {chunks}
              </span>
            ),
          })}
        </p>
      </div>

      {estimateLine ? (
        <>
          <div className="my-5 h-px w-full bg-[#E5E7EB]" role="separator" />
          <p className="text-[15px] font-normal leading-[1.5] text-[#6B7280]">
            {estimateLine}
          </p>
        </>
      ) : null}
    </section>
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
