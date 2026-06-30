export async function fetchEasyPurchaseEnabled(): Promise<boolean> {
  const rawApiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!rawApiUrl) {
    return false;
  }

  const apiUrl = rawApiUrl.replace(/\/$/, "");

  try {
    const response = await fetch(`${apiUrl}/settings/features`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const json = (await response.json()) as {
      easy_purchase_enabled?: boolean;
      data?: { easy_purchase_enabled?: boolean };
    };
    const payload = json.data ?? json;
    return Boolean(payload.easy_purchase_enabled);
  } catch {
    return false;
  }
}
