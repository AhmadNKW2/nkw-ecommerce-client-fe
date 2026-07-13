import { NextResponse } from "next/server";

const FALLBACK_SITE_URL = "https://www.ordonsooq.com";

function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return FALLBACK_SITE_URL;
}

/**
 * App Router route so /llms.txt is never captured by [locale].
 * Public/llms.txt is a static fallback; this route always returns a valid body.
 */
export function GET() {
  const siteUrl = getSiteUrl();
  const body = `# OrdonSooq

OrdonSooq (أوردن سوق) is an online marketplace in Jordan for electronics, computers, laptops, and tech accessories.

## Key pages

- [Home](${siteUrl}/): Featured products and new arrivals
- [Search](${siteUrl}/search): Product search and filters
- [Categories](${siteUrl}/categories): Browse by category
- [Brands](${siteUrl}/brands): Shop by brand
- [Stores](${siteUrl}/vendors): Vendor storefronts
- [Contact](${siteUrl}/contact): Customer support
- [Privacy](${siteUrl}/privacy): Privacy policy
- [Terms](${siteUrl}/terms): Terms of service

## Optional

- [Sitemap](${siteUrl}/sitemap.xml): Machine-readable site map
- [Robots](${siteUrl}/robots.txt): Crawler rules
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
