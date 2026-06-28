import { initDataFast, type DataFastWeb } from "datafast";

const DATAFAST_WEBSITE_ID = "dfid_pBw3gDtRrFTG7ufI7iO0e";

type DataFastProperties = Record<string, string | number | boolean>;

let clientPromise: Promise<DataFastWeb> | null = null;

export function initDataFastClient(): Promise<DataFastWeb> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("DataFast is only available in the browser"));
  }

  if (!clientPromise) {
    clientPromise = initDataFast({
      websiteId: DATAFAST_WEBSITE_ID,
      autoCapturePageviews: true,
    });
  }

  return clientPromise;
}

export async function trackDataFastEvent(
  eventName: string,
  properties: DataFastProperties = {},
) {
  try {
    const client = await initDataFastClient();
    await client.track(eventName, properties);
  } catch (error) {
    console.error("DataFast tracking failed:", error);
  }
}
