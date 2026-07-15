/** Amman local time for storefront delivery cutoffs. */
export const DELIVERY_TIMEZONE = "Asia/Amman";

/** Default order-by hour (24h) for next-day delivery in Amman. */
export const DEFAULT_SHIPPING_CUTOFF_HOUR = 14;

export type ShippingCutoffMode = "before" | "after" | "any";
export type ShippingArrivalMode = "offset_days" | "next_weekday";

/** Weekday: 0 = Sunday … 6 = Saturday. */
export type ShippingDeliveryRule = {
  id: string;
  days: number[];
  cutoffMode: ShippingCutoffMode;
  arrivalMode: ShippingArrivalMode;
  arrivalOffsetDays?: number;
  arrivalWeekday?: number;
};

export type ShippingRulesConfig = {
  enabled: boolean;
  cutoffHour: number;
  rules: ShippingDeliveryRule[];
};

export type ShippingRulesSettingsSource = {
  shipping_rules_enabled?: boolean | number | string | null;
  shipping_cutoff_hour?: number | null;
  shipping_rules?: ShippingDeliveryRule[] | null;
};

export const DEFAULT_SHIPPING_RULES: ShippingRulesConfig = {
  enabled: false,
  cutoffHour: DEFAULT_SHIPPING_CUTOFF_HOUR,
  rules: [],
};

export function normalizeCutoffHour(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(Number(value))) {
    return DEFAULT_SHIPPING_CUTOFF_HOUR;
  }
  const hour = Math.trunc(Number(value));
  if (hour < 0 || hour > 23) {
    return DEFAULT_SHIPPING_CUTOFF_HOUR;
  }
  return hour;
}

function normalizeRules(rules: unknown): ShippingDeliveryRule[] {
  if (!Array.isArray(rules)) {
    return [];
  }

  return rules
    .map((rule): ShippingDeliveryRule | null => {
      if (!rule || typeof rule !== "object") {
        return null;
      }

      const record = rule as Record<string, unknown>;
      const days = Array.isArray(record.days)
        ? [
            ...new Set(
              record.days
                .map((day) => Number(day))
                .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6),
            ),
          ].sort((a, b) => a - b)
        : [];

      if (days.length === 0) {
        return null;
      }

      const cutoffMode: ShippingCutoffMode =
        record.cutoffMode === "after" || record.cutoffMode === "any"
          ? record.cutoffMode
          : "before";
      const arrivalMode: ShippingArrivalMode =
        record.arrivalMode === "next_weekday" ? "next_weekday" : "offset_days";

      return {
        id: typeof record.id === "string" ? record.id : "rule",
        days,
        cutoffMode,
        arrivalMode,
        arrivalOffsetDays: Math.min(
          14,
          Math.max(1, Math.trunc(Number(record.arrivalOffsetDays) || 1)),
        ),
        arrivalWeekday: Math.min(
          6,
          Math.max(0, Math.trunc(Number(record.arrivalWeekday) || 0)),
        ),
      };
    })
    .filter((rule): rule is ShippingDeliveryRule => rule != null);
}

export function resolveShippingRulesConfig(
  settings?: ShippingRulesSettingsSource | null,
): ShippingRulesConfig {
  const rules = normalizeRules(settings?.shipping_rules);
  // Treat enabled flag loosely so "1"/truthy API values still activate rules.
  const enabledFlag = settings?.shipping_rules_enabled;
  const enabled =
    enabledFlag === true ||
    enabledFlag === 1 ||
    enabledFlag === "true" ||
    enabledFlag === "1";

  return {
    enabled: Boolean(enabled),
    cutoffHour: normalizeCutoffHour(settings?.shipping_cutoff_hour),
    rules,
  };
}

export type DeliveryEstimate = {
  /** Remaining ms until the active cutoff; null when the live countdown is not useful. */
  remainingMs: number | null;
  /** Formatted cutoff time, e.g. "2:00 PM" */
  cutoffLabel: string;
  /** Whether we are still before today's cutoff for the matched rule. */
  beforeCutoff: boolean;
  /** Weekday in Amman (0 = Sunday … 6 = Saturday). */
  weekday: number;
  /** Arrival calendar date, e.g. "السبت 18/06/2026". */
  arrivalDateLabel: string;
};

function getAmmanParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: DELIVERY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: weekdayMap[parts.weekday ?? "Sun"] ?? 0,
  };
}

/** Convert an Amman wall-clock datetime to a UTC Date. */
function ammanWallTimeToUtc(parts: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  second?: number;
}): Date {
  const utcGuess = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute ?? 0,
    parts.second ?? 0,
  );

  const ammanAtGuess = getAmmanParts(new Date(utcGuess));
  const asUtcMs = Date.UTC(
    ammanAtGuess.year,
    ammanAtGuess.month - 1,
    ammanAtGuess.day,
    ammanAtGuess.hour,
    ammanAtGuess.minute,
    ammanAtGuess.second,
  );
  const offsetMs = asUtcMs - utcGuess;

  return new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute ?? 0,
      parts.second ?? 0,
    ) - offsetMs,
  );
}

export function formatCutoffLabel(
  locale: string,
  hour = DEFAULT_SHIPPING_CUTOFF_HOUR,
): string {
  const sample = ammanWallTimeToUtc({
    year: 2026,
    month: 1,
    day: 15,
    hour: normalizeCutoffHour(hour),
    minute: 0,
  });

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-US", {
    timeZone: DELIVERY_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(sample);
}

/** Countdown label, e.g. "17 hours 21 minutes" / "17 ساعة 21 دقيقة". */
export function formatRemainingDuration(ms: number, locale: string): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (locale === "ar") {
    if (hours <= 0) {
      return `${minutes} دقيقة`;
    }
    if (minutes === 0) {
      return `${hours} ساعة`;
    }
    return `${hours} ساعة ${minutes} دقيقة`;
  }

  if (hours <= 0) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
  if (minutes === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

function addAmmanCalendarDays(
  base: { year: number; month: number; day: number },
  days: number,
) {
  const utc = Date.UTC(base.year, base.month - 1, base.day + days);
  const next = new Date(utc);
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

function daysUntilWeekday(currentWeekday: number, targetWeekday: number): number {
  const delta = (targetWeekday - currentWeekday + 7) % 7;
  return delta === 0 ? 7 : delta;
}

export function formatArrivalDateLabel(
  locale: string,
  ammanDay: { year: number; month: number; day: number },
): string {
  const utcNoon = Date.UTC(ammanDay.year, ammanDay.month - 1, ammanDay.day, 12);
  const weekday = new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-US", {
    timeZone: "UTC",
    weekday: "long",
  }).format(new Date(utcNoon));
  // e.g. "السبت 18/06/2026" / "Saturday 18/06/2026"
  const day = String(ammanDay.day).padStart(2, "0");
  const month = String(ammanDay.month).padStart(2, "0");
  return `${weekday} ${day}/${month}/${ammanDay.year}`;
}

function resolveArrivalDay(
  parts: ReturnType<typeof getAmmanParts>,
  rule: ShippingDeliveryRule,
) {
  if (rule.arrivalMode === "next_weekday") {
    const target = rule.arrivalWeekday ?? 0;
    return addAmmanCalendarDays(parts, daysUntilWeekday(parts.weekday, target));
  }

  return addAmmanCalendarDays(parts, rule.arrivalOffsetDays ?? 1);
}

function ruleMatches(
  rule: ShippingDeliveryRule,
  weekday: number,
  beforeCutoff: boolean,
): boolean {
  if (!rule.days.includes(weekday)) {
    return false;
  }

  if (rule.cutoffMode === "before") {
    return beforeCutoff;
  }
  if (rule.cutoffMode === "after") {
    return !beforeCutoff;
  }
  return true;
}

/**
 * Pick the best matching rule without using saved display order.
 * Prefer exact before/after over "any", then more specific day sets.
 */
function pickMatchingRule(
  rules: ShippingDeliveryRule[],
  weekday: number,
  beforeCutoff: boolean,
): ShippingDeliveryRule | null {
  const matches = rules.filter((rule) => ruleMatches(rule, weekday, beforeCutoff));
  if (matches.length === 0) {
    return null;
  }

  const cutoffRank = (mode: ShippingCutoffMode) => {
    if (mode === "before" || mode === "after") {
      return 0;
    }
    return 1;
  };

  return [...matches].sort((a, b) => {
    const byCutoff = cutoffRank(a.cutoffMode) - cutoffRank(b.cutoffMode);
    if (byCutoff !== 0) {
      return byCutoff;
    }
    const byDays = a.days.length - b.days.length;
    if (byDays !== 0) {
      return byDays;
    }
    return a.id.localeCompare(b.id);
  })[0];
}

/**
 * Evaluate configured shipping rules (Amman timezone).
 * Saved rule order is display-only and does not affect matching.
 * Returns null when rules are disabled, empty, or none match today.
 */
export function getDeliveryEstimate(
  now: Date = new Date(),
  locale = "en",
  config: ShippingRulesConfig = DEFAULT_SHIPPING_RULES,
): DeliveryEstimate | null {
  if (!config.enabled || config.rules.length === 0) {
    return null;
  }

  const hour = normalizeCutoffHour(config.cutoffHour);
  const parts = getAmmanParts(now);
  const cutoffLabel = formatCutoffLabel(locale, hour);
  const todayCutoff = ammanWallTimeToUtc({
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour,
    minute: 0,
    second: 0,
  });

  const beforeCutoff = now.getTime() < todayCutoff.getTime();
  const matched = pickMatchingRule(config.rules, parts.weekday, beforeCutoff);

  if (!matched) {
    return null;
  }

  const arrivalDay = resolveArrivalDay(parts, matched);
  const showCountdown = matched.cutoffMode === "before" && beforeCutoff;
  const remainingMs = showCountdown
    ? todayCutoff.getTime() - now.getTime()
    : null;

  return {
    remainingMs,
    cutoffLabel,
    beforeCutoff: showCountdown,
    weekday: parts.weekday,
    arrivalDateLabel: formatArrivalDateLabel(locale, arrivalDay),
  };
}
