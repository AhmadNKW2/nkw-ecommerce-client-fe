import type { Metadata } from "next";
import { CartPageClient } from "./cart-page-client";
import { buildNoIndexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildNoIndexMetadata("Cart");

export default function CartPage() {
  return <CartPageClient />;
}