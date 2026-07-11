"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
  HeadphonesIcon,
  PackageCheck,
} from "lucide-react";
import { SITE_CONFIG, FOOTER_DISABLED_LINK_LABELS, FOOTER_LINKS } from "@/lib/constants";
import { resolveSocialLinks, resolveSupportEmail } from "@/lib/site-contact";
import { Logo } from "./header-components";
import { IconButton } from "../ui/icon-button";
import { useLocale, useTranslations } from "next-intl";
import { useSeoSettings } from "@/hooks/useSeoSettings";
import { resolveLocalizedSiteName } from "@/lib/site-branding";

const FEATURES = [
  {
    title: "features.freeShipping",
    description: "features.freeShippingDesc",
    Icon: Truck,
  },
  {
    title: "features.securePayment",
    description: "features.securePaymentDesc",
    Icon: ShieldCheck,
  },
  {
    title: "features.support",
    description: "features.supportDesc",
    Icon: HeadphonesIcon,
  },
  {
    title: "features.fastDelivery",
    description: "features.fastDeliveryDesc",
    Icon: PackageCheck,
  },
] as const;

const FOOTER_COLUMNS = [
  { title: "footer.links.support", links: FOOTER_LINKS.support },
  { title: "footer.links.company", links: FOOTER_LINKS.company },
] as const;

const SOCIAL_ICON_OPTIONS = [
  { label: "Facebook", key: "facebook" as const, icon: "facebook" as const },
  { label: "Twitter", key: "twitter" as const, icon: "twitter" as const },
  { label: "Instagram", key: "instagram" as const, icon: "instagram" as const },
];

const PAYMENT_IMAGES = [
  { alt: "Visa", src: "/footer-icons/visa.svg" },
  { alt: "Mastercard", src: "/footer-icons/mastercard.svg" },
  { alt: "Cliq", src: "/footer-icons/cliq.svg" },
  { alt: "Apple Pay", src: "/footer-icons/apple-pay.svg" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations();
  const locale = useLocale();
  const { data: seoSettings } = useSeoSettings();
  const containerClass = "container mx-auto py-5 px-4 md:px-12";
  const siteName = resolveLocalizedSiteName(locale, seoSettings);
  const supportEmail = resolveSupportEmail(seoSettings);
  const socialLinks = resolveSocialLinks(seoSettings);
  const features = seoSettings?.free_delivery_enabled === false
    ? FEATURES.filter((feature) => feature.title !== "features.freeShipping")
    : FEATURES;
  const contactAddress = locale === "ar"
    ? SITE_CONFIG.contact.address.ar
    : SITE_CONFIG.contact.address.en;

  return (
    <footer className="bg-gray-900 text-third2">
      <div className={containerClass}>
        <div className="grid grid-cols-2 md:grid-cols-none md:grid-flow-col justify-between gap-5">
          {features.map(({ title, description, Icon }) => (
            <div key={title} className="flex items-center gap-5">
              <div className="p-3 bg-secondary rounded-full">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-semibold text-white">{t(title)}</h4>
                <p className="text-sm text-white/75">{t(description)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-800"></div>

      <div className={containerClass}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Logo asLink={true} />
            </div>
            <p className="text-third2 max-w-md mb-8">
              {t("footer.description")}
            </p>

            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-3 text-third2 hover:text-secondary transition-colors"
              >
                <Mail className="w-5 h-5" />
                {supportEmail}
              </a>
              <a
                href={`tel:${SITE_CONFIG.contact.phone}`}
                className="flex items-center gap-3 text-third2 hover:text-secondary transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span dir="ltr" className="text-left">{SITE_CONFIG.contact.phone}</span>
              </a>
              <div className="flex items-center gap-3 text-third2">
                <MapPin className="w-5 h-5" />
                <span>{contactAddress}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_ICON_OPTIONS.map(({ label, key, icon }) => {
                const href = socialLinks[key];
                if (!href) {
                  return null;
                }

                return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <IconButton variant="social" size="default" shape="circle" icon={icon} />
                </a>
                );
              })}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-white font-semibold mb-4">{t(column.title)}</h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {FOOTER_DISABLED_LINK_LABELS.has(link.label) ? (
                      <span className="text-third2">
                        {t(link.label)}
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-third2 hover:text-secondary transition-colors"
                      >
                        {t(link.label)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-800"></div>

      <div>
        <div className={containerClass}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-sm text-third2">
            <p>© {currentYear} {siteName}. All rights reserved</p>
            <div className="flex items-center gap-5">
              {FOOTER_LINKS.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-secondary transition-colors"
                >
                  {t(link.label)}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {PAYMENT_IMAGES.map((icon) => (
                <Image
                  key={icon.alt}
                  src={icon.src}
                  alt={icon.alt}
                  width={64}
                  height={32}
                  className="h-6 w-auto brightness-0 invert opacity-60"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
