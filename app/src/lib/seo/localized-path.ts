import { SITE_CONFIG } from "@/lib/constants";
import { routing } from "@/i18n/routing";

export function normalizePathname(pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) {
    return normalizedPath.slice(0, -1);
  }
  return normalizedPath || "/";
}

export function stripLocalePrefix(pathname: string): string {
  const normalizedPath = normalizePathname(pathname);
  const segments = normalizedPath.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  if (
    maybeLocale &&
    routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
  ) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }

  return normalizedPath;
}

export function getLocalizedPath(locale: string, pathname: string): string {
  const normalizedPath = normalizePathname(pathname);

  if (locale === routing.defaultLocale) {
    return normalizedPath;
  }

  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function getAbsoluteLocalizedUrl(locale: string, pathname: string): string {
  const path = getLocalizedPath(locale, pathname);
  return path === "/" ? `${SITE_CONFIG.url}/` : `${SITE_CONFIG.url}${path}`;
}

export function buildLanguageAlternates(
  pathnameWithoutLocale: string,
): Record<string, string> {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      getAbsoluteLocalizedUrl(locale, pathnameWithoutLocale),
    ]),
  ) as Record<string, string>;

  languages["x-default"] = getAbsoluteLocalizedUrl(
    routing.defaultLocale,
    pathnameWithoutLocale,
  );

  return languages;
}
