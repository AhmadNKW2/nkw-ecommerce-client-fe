export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL environment variable is required. Set it in .env.local or your deployment environment.",
    );
  }

  return url.replace(/\/$/, "");
}
