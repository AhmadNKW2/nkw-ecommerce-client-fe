"use client";

import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ListingLayout } from "@/components/layout/listing-layout";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ContactFormPlaceholder } from "./contact-form-placeholder";

export function ContactPageClient() {
  const t = useTranslations("footerPages.contact");
  const commonT = useTranslations("common");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const address = isArabic ? SITE_CONFIG.contact.address.ar : SITE_CONFIG.contact.address.en;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_CONFIG.contact.address.en)}`;

  const contactMethods = [
    {
      icon: Phone,
      label: t("phone"),
      value: SITE_CONFIG.contact.phone,
      href: `tel:${SITE_CONFIG.contact.phone}`,
      dir: "ltr" as const,
    },
    {
      icon: Mail,
      label: t("email"),
      value: SITE_CONFIG.contact.email,
      href: `mailto:${SITE_CONFIG.contact.email}`,
    },
    {
      icon: MapPin,
      label: t("address"),
      value: address,
      href: mapsHref,
      external: true,
    },
    {
      icon: Clock3,
      label: t("hours"),
      value: t("hoursValue"),
    },
  ];

  return (
    <ListingLayout
      breadcrumbs={[
        { label: commonT("home"), href: "/" },
        { label: t("title"), href: "/contact" },
      ]}
      className="max-w-5xl py-8 md:py-12"
    >
      <div className="mb-10 text-center md:mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-third">{t("subtitle")}</p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contactMethods.map((method) => {
          const Icon = method.icon;
          const content = (
            <div className="flex h-full flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Icon className="size-5" />
              </div>
              <p
                className={cn(
                  "text-xs font-medium text-third",
                  !isArabic && "uppercase tracking-wide",
                )}
              >
                {method.label}
              </p>
              <p
                dir={method.dir}
                className="mt-2 text-sm font-semibold leading-relaxed text-primary"
              >
                {method.value}
              </p>
            </div>
          );

          if (!method.href) {
            return <div key={method.label}>{content}</div>;
          }

          return (
            <a
              key={method.label}
              href={method.href}
              target={method.external ? "_blank" : undefined}
              rel={method.external ? "noopener noreferrer" : undefined}
              className="block h-full"
            >
              {content}
            </a>
          );
        })}
      </div>

      <div className="mx-auto max-w-2xl">
        <ContactFormPlaceholder
          title={t("form.title")}
          description={t("form.description")}
          nameLabel={t("form.nameLabel")}
          emailLabel={t("form.emailLabel")}
          phoneLabel={t("form.phoneLabel")}
          messageLabel={t("form.messageLabel")}
          submitLabel={t("form.submitLabel")}
          successTitle={t("form.successTitle")}
          successDescription={t("form.successDescription")}
          resetLabel={t("form.resetLabel")}
          supportActionLabel={t("form.emailSupportAction")}
          supportHref={`mailto:${SITE_CONFIG.contact.email}`}
        />
      </div>
    </ListingLayout>
  );
}
