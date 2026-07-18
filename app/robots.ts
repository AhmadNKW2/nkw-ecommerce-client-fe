import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

const PRIVATE_PATHS = [
  "/cart",
  "/checkout",
  "/profile",
  "/login",
  "/register",
  "/search",
  "/en/cart",
  "/en/checkout",
  "/en/profile",
  "/en/login",
  "/en/register",
  "/en/search",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
