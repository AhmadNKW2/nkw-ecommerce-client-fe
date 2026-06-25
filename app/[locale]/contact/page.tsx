import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactPageClient } from "@/components/footer-pages/contact-page-client";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { CONTACT_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("footerPages.contact");

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function ContactPage() {
  const locale = (await getLocale()) as Locale;

  return (
    <RouteIntlProvider locale={locale} namespaces={CONTACT_MESSAGE_NAMESPACES}>
      <ContactPageClient />
    </RouteIntlProvider>
  );
}
