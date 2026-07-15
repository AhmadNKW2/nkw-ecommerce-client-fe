/** Amman local time for storefront delivery cutoffs. */
export const DELIVERY_TIMEZONE = "Asia/Amman";

/** Default order-by hour (24h) for next-day delivery in Amman. */
export const DEFAULT_SHIPPING_CUTOFF_HOUR = 14;

export type DeliveryArrivalKind = "tomorrow" | "inTwoDays" | "sunday";

export type ShippingRuleTexts = {
  when_en: string;
  when_ar: string;
  arrives_en: string;
  arrives_ar: string;
};

export type ShippingRulesConfig = {
  enabled: boolean;
  cutoffHour: number;
  rule1: ShippingRuleTexts;
  rule2: ShippingRuleTexts;
  rule3: ShippingRuleTexts;
};

export type ShippingRulesSettingsSource = {
  shipping_rules_enabled?: boolean | null;
  shipping_cutoff_hour?: number | null;
  shipping_rule_1_when_en?: string | null;
  shipping_rule_1_when_ar?: string | null;
  shipping_rule_1_arrives_en?: string | null;
  shipping_rule_1_arrives_ar?: string | null;
  shipping_rule_2_when_en?: string | null;
  shipping_rule_2_when_ar?: string | null;
  shipping_rule_2_arrives_en?: string | null;
  shipping_rule_2_arrives_ar?: string | null;
  shipping_rule_3_when_en?: string | null;
  shipping_rule_3_when_ar?: string | null;
  shipping_rule_3_arrives_en?: string | null;
  shipping_rule_3_arrives_ar?: string | null;
};

export const DEFAULT_SHIPPING_RULES: ShippingRulesConfig = {
  enabled: true,
  cutoffHour: DEFAULT_SHIPPING_CUTOFF_HOUR,
  rule1: {
    when_en: "Order by {time} (Sun–Thu)",
    when_ar: "اطلب قبل {time} (الأحد–الخميس)",
    arrives_en: "Arrives tomorrow",
    arrives_ar: "يصل غداً",
  },
  rule2: {
    when_en: "Order after {time} (Sun–Wed)",
    when_ar: "اطلب بعد {time} (الأحد–الأربعاء)",
    arrives_en: "Arrives in 2 days",
    arrives_ar: "يصل خلال يومين",
  },
  rule3: {
    when_en: "Order Thu after cutoff, Fri, or Sat",
    when_ar: "اطلب بعد الموعد يوم الخميس أو الجمعة أو السبت",
    arrives_en: "Arrives Sunday",
    arrives_ar: "يصل يوم الأحد",
  },
};

function pickText(value: string | null | undefined, fallback: string) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

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

export function resolveShippingRulesConfig(
  settings?: ShippingRulesSettingsSource | null,
): ShippingRulesConfig {
  return {
    enabled: settings?.shipping_rules_enabled !== false,
    cutoffHour: normalizeCutoffHour(settings?.shipping_cutoff_hour),
    rule1: {
      when_en: pickText(settings?.shipping_rule_1_when_en, DEFAULT_SHIPPING_RULES.rule1.when_en),
      when_ar: pickText(settings?.shipping_rule_1_when_ar, DEFAULT_SHIPPING_RULES.rule1.when_ar),
      arrives_en: pickText(
        settings?.shipping_rule_1_arrives_en,
        DEFAULT_SHIPPING_RULES.rule1.arrives_en,
      ),
      arrives_ar: pickText(
        settings?.shipping_rule_1_arrives_ar,
        DEFAULT_SHIPPING_RULES.rule1.arrives_ar,
      ),
    },
    rule2: {
      when_en: pickText(settings?.shipping_rule_2_when_en, DEFAULT_SHIPPING_RULES.rule2.when_en),
      when_ar: pickText(settings?.shipping_rule_2_when_ar, DEFAULT_SHIPPING_RULES.rule2.when_ar),
      arrives_en: pickText(
        settings?.shipping_rule_2_arrives_en,
        DEFAULT_SHIPPING_RULES.rule2.arrives_en,
      ),
      arrives_ar: pickText(
        settings?.shipping_rule_2_arrives_ar,
        DEFAULT_SHIPPING_RULES.rule2.arrives_ar,
      ),
    },
    rule3: {
      when_en: pickText(settings?.shipping_rule_3_when_en, DEFAULT_SHIPPING_RULES.rule3.when_en),
      when_ar: pickText(settings?.shipping_rule_3_when_ar, DEFAULT_SHIPPING_RULES.rule3.when_ar),
      arrives_en: pickText(
        settings?.shipping_rule_3_arrives_en,
        DEFAULT_SHIPPING_RULES.rule3.arrives_en,
      ),
      arrives_ar: pickText(
        settings?.shipping_rule_3_arrives_ar,
        DEFAULT_SHIPPING_RULES.rule3.arrives_ar,
      ),
    },
  };
}

export type DeliveryEstimate = {
  /** Remaining ms until the active cutoff; null when the live countdown is not useful. */
  remainingMs: number | null;
  arrivalKind: DeliveryArrivalKind;
  /** Formatted cutoff time, e.g. "2:00 PM" / "٢:٠٠ م" */
  cutoffLabel: string;
  /** Whether we are still before today's next-day cutoff. */
  beforeCutoff: boolean;
  /** Weekday in Amman (0 = Sunday … 6 = Saturday). */
  weekday: number;
  /** Arrival calendar date in Amman, e.g. "Thu, Jul 16" / "الخميس، ١٦ يوليو". */
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

  // Resolve DST by measuring the Amman offset at the guessed instant.
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

export function formatRemainingDuration(ms: number, locale: string): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (locale === "ar") {
    if (hours <= 0) {
      return minutes === 1 ? "دقيقة واحدة" : `${minutes} دقيقة`;
    }
    if (minutes === 0) {
      return hours === 1 ? "ساعة واحدة" : `${hours} ساعات`;
    }
    const hoursPart = hours === 1 ? "ساعة واحدة" : `${hours} ساعات`;
    const minutesPart = minutes === 1 ? "دقيقة واحدة" : `${minutes} دقيقة`;
    return `${hoursPart} و${minutesPart}`;
  }

  if (hours <= 0) {
    return minutes === 1 ? "1 minute" : `${minutes} minutes`;
  }
  if (minutes === 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  const hoursPart = hours === 1 ? "1 hour" : `${hours} hours`;
  const minutesPart = minutes === 1 ? "1 minute" : `${minutes} minutes`;
  return `${hoursPart} ${minutesPart}`;
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

function daysUntilSunday(weekday: number): number {
  // 0 Sunday … 6 Saturday. Already Sunday → 0, otherwise days forward to Sunday.
  return weekday === 0 ? 0 : 7 - weekday;
}

export function formatArrivalDateLabel(
  locale: string,
  ammanDay: { year: number; month: number; day: number },
): string {
  const utcNoon = Date.UTC(ammanDay.year, ammanDay.month - 1, ammanDay.day, 12);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(utcNoon));
}

function resolveArrivalDay(
  parts: ReturnType<typeof getAmmanParts>,
  arrivalKind: DeliveryArrivalKind,
) {
  if (arrivalKind === "tomorrow") {
    return addAmmanCalendarDays(parts, 1);
  }
  if (arrivalKind === "inTwoDays") {
    return addAmmanCalendarDays(parts, 2);
  }
  return addAmmanCalendarDays(parts, daysUntilSunday(parts.weekday) || 7);
}

/**
 * Next-day shipping rules (Amman):
 * - Sun–Thu before cutoff → arrives tomorrow
 * - Sun–Wed after cutoff → arrives in 2 days
 * - Thu after cutoff, Fri, Sat → arrives Sunday
 */
export function getDeliveryEstimate(
  now: Date = new Date(),
  locale = "en",
  cutoffHour = DEFAULT_SHIPPING_CUTOFF_HOUR,
): DeliveryEstimate {
  const hour = normalizeCutoffHour(cutoffHour);
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
  const weekday = parts.weekday;

  let arrivalKind: DeliveryArrivalKind;
  let remainingMs: number | null = null;
  let estimateBeforeCutoff = false;

  // Friday / Saturday → Sunday delivery (no live next-day countdown).
  if (weekday === 5 || weekday === 6) {
    arrivalKind = "sunday";
  } else if (beforeCutoff) {
    // Sunday–Thursday before cutoff → tomorrow.
    arrivalKind = "tomorrow";
    remainingMs = todayCutoff.getTime() - now.getTime();
    estimateBeforeCutoff = true;
  } else if (weekday === 4) {
    // Thursday after cutoff → Sunday.
    arrivalKind = "sunday";
  } else {
    // Sunday–Wednesday after cutoff → in two days.
    arrivalKind = "inTwoDays";
  }

  const arrivalDay = resolveArrivalDay(parts, arrivalKind);

  return {
    remainingMs,
    arrivalKind,
    cutoffLabel,
    beforeCutoff: estimateBeforeCutoff,
    weekday,
    arrivalDateLabel: formatArrivalDateLabel(locale, arrivalDay),
  };
}
