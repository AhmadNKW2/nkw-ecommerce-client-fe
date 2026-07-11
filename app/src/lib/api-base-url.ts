/**
 * Single source for the backend API base URL (includes `/api` suffix).
 */
export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}
