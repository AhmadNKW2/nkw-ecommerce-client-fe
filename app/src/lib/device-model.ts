type NavigatorUAData = {
  getHighEntropyValues: (hints: string[]) => Promise<{
    model?: string;
    platform?: string;
    platformVersion?: string;
  }>;
};

type NavigatorWithUAData = Navigator & {
  userAgentData?: NavigatorUAData;
};

let cachedModel: string | null | undefined;

/**
 * Best-effort device model from Chrome Client Hints (Android often returns
 * codes like SM-S928B). iPhone usually has no model beyond "iPhone".
 */
export async function resolveDeviceModelHint(): Promise<string | undefined> {
  if (typeof window === "undefined") return undefined;
  if (cachedModel !== undefined) return cachedModel || undefined;

  const nav = navigator as NavigatorWithUAData;
  if (!nav.userAgentData?.getHighEntropyValues) {
    cachedModel = null;
    return undefined;
  }

  try {
    const hints = await nav.userAgentData.getHighEntropyValues([
      "model",
      "platform",
      "platformVersion",
    ]);
    const model = hints.model?.trim();
    cachedModel = model || null;
    return model || undefined;
  } catch {
    cachedModel = null;
    return undefined;
  }
}
