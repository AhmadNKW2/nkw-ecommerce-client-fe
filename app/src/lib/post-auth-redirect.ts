import { normalizeReturnTo } from "./auth-redirect";

const POST_AUTH_REDIRECT_STORAGE_KEY = "ordonsooq.post-auth-redirect";

function getRedirectStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.sessionStorage;
}

export function setPostAuthRedirect(returnTo?: string | null): void {
  const storage = getRedirectStorage();

  if (!storage) {
    return;
  }

  const safeReturnTo = normalizeReturnTo(returnTo);

  if (!safeReturnTo) {
    storage.removeItem(POST_AUTH_REDIRECT_STORAGE_KEY);
    return;
  }

  storage.setItem(POST_AUTH_REDIRECT_STORAGE_KEY, safeReturnTo);
}

export function getPostAuthRedirect(): string | undefined {
  const storage = getRedirectStorage();

  if (!storage) {
    return undefined;
  }

  return normalizeReturnTo(storage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY));
}

export function clearPostAuthRedirect(): void {
  const storage = getRedirectStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(POST_AUTH_REDIRECT_STORAGE_KEY);
}

export function consumePostAuthRedirect(returnTo?: string | null): string | undefined {
  const explicitReturnTo = normalizeReturnTo(returnTo);
  const storedReturnTo = getPostAuthRedirect();

  clearPostAuthRedirect();

  return explicitReturnTo ?? storedReturnTo;
}