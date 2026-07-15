"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Package, PackageX, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { CURRENCY_CONFIG } from "@/lib/constants";
import {
  formatRemainingDuration,
  getDeliveryEstimate,
  type DeliveryArrivalKind,
} from "@/lib/delivery-estimate";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/transformers";

type StockStatus = "in" | "low" | "out";

function resolveStockStatus(stock: number, lowStockThreshold: number): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= lowStockThreshold) return "low";
  return "in";
}

function ProductStockStatus({
  stock,
  lowStockThreshold,
}: {
  stock: number;
  lowStockThreshold: number;
}) {
  const t = useTranslations("product");
  const status = resolveStockStatus(stock, lowStockThreshold);

  const styles =
    status === "in"
      ? "border-success/25 bg-success/8 text-secondary"
      : status === "low"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-danger/25 bg-danger/8 text-danger";

  const Icon = status === "out" ? PackageX : status === "low" ? Package : CheckCircle2;

  const label =
    status === "in"
      ? t("inStock")
      : status === "low"
        ? t("lowStockCount", { count: stock })
        : t("outOfStock");

  const detail =
    status === "in"
      ? t("inStockReady")
      : status === "low"
        ? t("lowStockHurry")
        : t("outOfStockDesc");

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        styles,
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
          status === "in" && "bg-success/15",
          status === "low" && "bg-amber-100",
          status === "out" && "bg-danger/15",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-snug">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-80">{detail}</p>
      </div>
    </div>
  );
}

function useLiveDeliveryEstimate(locale: string) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return getDeliveryEstimate(now, locale);
}

function getEstimateMessage(
  t: (key: string, values?: Record<string, string | number>) => string,
  arrivalKind: DeliveryArrivalKind,
  remainingMs: number | null,
  locale: string,
) {
  if (arrivalKind === "tomorrow" && remainingMs != null && remainingMs > 0) {
    return t("deliveryEstimate.orderForTomorrow", {
      time: formatRemainingDuration(remainingMs, locale),
    });
  }

  if (arrivalKind === "inTwoDays") {
    return t("deliveryEstimate.arrivesInTwoDays");
  }

  return t("deliveryEstimate.arrivesSunday");
}

function ProductDeliveryPanel({
  deliveryFee,
  className,
}: {
  deliveryFee: number;
  className?: string;
}) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const estimate = useLiveDeliveryEstimate(locale);

  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(deliveryFee);
  const currencyUnit = locale === "ar" ? CURRENCY_CONFIG.symbolAr : "JD";
  const estimateMessage = getEstimateMessage(
    t,
    estimate.arrivalKind,
    estimate.remainingMs,
    locale,
  );

  const rules = [
    {
      id: "before",
      when: t("shippingRules.beforeCutoff", { time: estimate.cutoffLabel }),
      arrives: t("shippingRules.arrivesTomorrow"),
    },
    {
      id: "after",
      when: t("shippingRules.afterCutoff", { time: estimate.cutoffLabel }),
      arrives: t("shippingRules.arrivesInTwoDays"),
    },
    {
      id: "weekend",
      when: t("shippingRules.weekend"),
      arrives: t("shippingRules.arrivesSunday"),
    },
  ];

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

      <div className="border-t border-secondary/10 px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
            <Clock3 className="size-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug text-primary">
              {estimateMessage}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-third">
              {t("deliveryEstimate.note")}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-gray-100 bg-white/80 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-third">
            {t("shippingRules.title")}
          </p>
          <ul className="mt-2 space-y-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="grid grid-cols-1 gap-0.5 text-xs leading-snug sm:grid-cols-[1.1fr_0.9fr] sm:gap-3"
              >
                <span className="text-third">{rule.when}</span>
                <span className="font-medium text-primary sm:text-end">
                  {rule.arrives}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ProductAvailabilityBlock({
  stock,
  deliveryFee,
  lowStockThreshold = 10,
  className,
}: {
  stock: number;
  deliveryFee: number;
  lowStockThreshold?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <ProductStockStatus stock={stock} lowStockThreshold={lowStockThreshold} />
      <ProductDeliveryPanel deliveryFee={deliveryFee} />
    </div>
  );
}
