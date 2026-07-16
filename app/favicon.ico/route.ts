import { getSeoSettingsCached } from "@/services/settings.service";

export const dynamic = "force-dynamic";

async function fetchSiteLogoImageResponse(): Promise<Response | null> {
  const settings = await getSeoSettingsCached();
  const logoUrl = settings?.site_logo?.trim();

  if (!logoUrl) {
    return null;
  }

  try {
    const imageResponse = await fetch(logoUrl, { cache: "no-store" });

    if (!imageResponse.ok) {
      return null;
    }

    const contentType =
      imageResponse.headers.get("content-type") || "image/png";
    const buffer = await imageResponse.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return null;
  }
}

export async function GET() {
  const response = await fetchSiteLogoImageResponse();
  return response ?? new Response(null, { status: 404 });
}
