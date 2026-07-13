import { SITE_CONFIG } from "@/lib/constants";

export function buildCanonicalUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (normalizedPath === "/") {
    return `${SITE_CONFIG.url}/`;
  }

  return `${SITE_CONFIG.url}${normalizedPath}`;
}
