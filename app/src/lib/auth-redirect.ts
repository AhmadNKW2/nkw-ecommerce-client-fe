export interface SearchParamsLike {
  toString(): string;
}

const AUTH_ROUTE_PATHS = new Set(["/login", "/register"]);

function decodeReturnTo(returnTo: string): string {
  try {
    return decodeURIComponent(returnTo);
  } catch {
    return returnTo;
  }
}

function getPathnameOnly(href: string): string {
  return href.split("?")[0]?.split("#")[0] ?? href;
}

export function normalizeReturnTo(returnTo?: string | null): string | undefined {
  if (!returnTo) {
    return undefined;
  }

  const decodedReturnTo = decodeReturnTo(returnTo).trim();

  if (!decodedReturnTo.startsWith("/") || decodedReturnTo.startsWith("//")) {
    return undefined;
  }

  if (AUTH_ROUTE_PATHS.has(getPathnameOnly(decodedReturnTo))) {
    return undefined;
  }

  return decodedReturnTo;
}

export function getReturnToFromPath(
  pathname: string,
  searchParams?: SearchParamsLike | null,
): string | undefined {
  const normalizedPathname = pathname.trim();

  if (!normalizedPathname.startsWith("/")) {
    return undefined;
  }

  const queryString = searchParams?.toString();

  return queryString ? `${normalizedPathname}?${queryString}` : normalizedPathname;
}

export function buildAuthHref(
  authPath: "/login" | "/register",
  returnTo?: string | null,
): string {
  const safeReturnTo = normalizeReturnTo(returnTo);

  if (!safeReturnTo) {
    return authPath;
  }

  return `${authPath}?returnTo=${encodeURIComponent(safeReturnTo)}`;
}

export function getSearchParamsFromWindow(): URLSearchParams | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return new URLSearchParams(window.location.search);
}

export function getReturnToFromWindow(pathname: string): string | undefined {
  return getReturnToFromPath(pathname, getSearchParamsFromWindow());
}

export function getReturnToQueryParamFromWindow(): string | undefined {
  return normalizeReturnTo(getSearchParamsFromWindow()?.get("returnTo"));
}