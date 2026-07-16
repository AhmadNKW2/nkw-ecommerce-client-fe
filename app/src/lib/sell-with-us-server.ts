import type { SellWithUsFormData } from "@/lib/sell-with-us";

const DEFAULT_ERROR_MESSAGE = "Unable to submit sell with us request.";

type SubmitSellWithUsOptions = {
  signal?: AbortSignal;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getPartnersLeadEndpoint(): string {
  const explicitUrl = process.env.SELL_WITH_US_PARTNERS_API_URL?.trim();

  if (explicitUrl) {
    return trimTrailingSlash(explicitUrl);
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!apiBaseUrl) {
    throw new SellWithUsSubmissionError(
      "Sell with us partner API is not configured.",
      500,
    );
  }

  return `${trimTrailingSlash(apiBaseUrl)}/partners/leads`;
}

function extractErrorMessage(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (Array.isArray(payload)) {
    const message = payload
      .map((entry) => extractErrorMessage(entry))
      .find((entry): entry is string => Boolean(entry));

    return message ?? null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (record.message) {
    return extractErrorMessage(record.message);
  }

  if (record.error) {
    return extractErrorMessage(record.error);
  }

  return null;
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  const rawBody = await response.text().catch(() => "");

  if (!rawBody.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

export class SellWithUsSubmissionError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SellWithUsSubmissionError";
    this.status = status;
  }
}

export async function submitSellWithUsSubmission(
  values: SellWithUsFormData,
  options: SubmitSellWithUsOptions = {},
): Promise<void> {
  const response = await fetch(getPartnersLeadEndpoint(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: values.fullName,
      company_name: values.companyName || undefined,
      phone_number: values.phone,
    }),
    cache: "no-store",
    signal: options.signal,
  });

  if (response.ok) {
    return;
  }

  const payload = await parseResponsePayload(response);
  const message = extractErrorMessage(payload) || DEFAULT_ERROR_MESSAGE;

  throw new SellWithUsSubmissionError(message, response.status);
}
