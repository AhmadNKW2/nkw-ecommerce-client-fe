import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { CheckoutPageClient } from "./checkout-page-client";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { CHECKOUT_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { buildNoIndexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildNoIndexMetadata("Checkout");

export default async function CheckoutPage() {
  const locale = (await getLocale()) as Locale;

  return (
    <RouteIntlProvider locale={locale} namespaces={CHECKOUT_MESSAGE_NAMESPACES}>
      <CheckoutPageClient />
    </RouteIntlProvider>
  );
}