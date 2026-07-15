/** Amman local time for storefront delivery cutoffs. */
export const DELIVERY_TIMEZONE = "Asia/Amman";

/** Order-by hour (24h) for next-day delivery in Amman. */
export const NEXT_DAY_CUTOFF_HOUR = 14;

export type DeliveryArrivalKind = "tomorrow" | "inTwoDays" | "sunday";

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

export function formatCutoffLabel(locale: string, hour = NEXT_DAY_CUTOFF_HOUR): string {
  const sample = ammanWallTimeToUtc({
    year: 2026,
    month: 1,
    day: 15,
    hour,
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

/**
 * Next-day shipping rules (Amman):
 * - Sun–Thu before 2:00 PM → arrives tomorrow
 * - Sun–Wed after 2:00 PM → arrives in 2 days
 * - Thu after 2:00 PM, Fri, Sat → arrives Sunday
 */
export function getDeliveryEstimate(now: Date = new Date(), locale = "en"): DeliveryEstimate {
  const parts = getAmmanParts(now);
  const cutoffLabel = formatCutoffLabel(locale);
  const todayCutoff = ammanWallTimeToUtc({
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: NEXT_DAY_CUTOFF_HOUR,
    minute: 0,
    second: 0,
  });

  const beforeCutoff = now.getTime() < todayCutoff.getTime();
  const weekday = parts.weekday;

  // Friday / Saturday → Sunday delivery (no live next-day countdown).
  if (weekday === 5 || weekday === 6) {
    return {
      remainingMs: null,
      arrivalKind: "sunday",
      cutoffLabel,
      beforeCutoff: false,
      weekday,
    };
  }

  // Sunday–Thursday before cutoff → tomorrow.
  if (beforeCutoff) {
    return {
      remainingMs: todayCutoff.getTime() - now.getTime(),
      arrivalKind: "tomorrow",
      cutoffLabel,
      beforeCutoff: true,
      weekday,
    };
  }

  // Thursday after cutoff → Sunday.
  if (weekday === 4) {
    return {
      remainingMs: null,
      arrivalKind: "sunday",
      cutoffLabel,
      beforeCutoff: false,
      weekday,
    };
  }

  // Sunday–Wednesday after cutoff → in two days.
  return {
    remainingMs: null,
    arrivalKind: "inTwoDays",
    cutoffLabel,
    beforeCutoff: false,
    weekday,
  };
}
