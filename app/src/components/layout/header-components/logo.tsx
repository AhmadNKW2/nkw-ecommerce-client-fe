"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useSeoSettings } from "@/hooks/useSeoSettings";
import { resolveLocalizedSiteName } from "@/lib/site-branding";

interface LogoProps {
  /** If true, renders as a Link, otherwise just the logo content */
  asLink?: boolean;
  className?: string;
  imageClassName?: string;
}

export function Logo({ asLink = true, className, imageClassName }: LogoProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const { data: seoSettings } = useSeoSettings();
  const logoSrc = isArabic ? "/SVG/Logo%20AR.svg" : "/SVG/Logo%20EN.svg";
  const siteName = resolveLocalizedSiteName(locale, seoSettings);

  const logoContent = (
    <Image
      src={logoSrc}
      alt={siteName}
      width={isArabic ? 649 : 853}
      height={isArabic ? 238 : 176}
      priority
      className={cn("h-9 w-auto md:h-11", imageClassName)}
    />
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className={cn("inline-flex items-center shrink-0", className)}
      >
        {logoContent}
      </Link>
    );
  }

  return (
    <span className={cn("inline-flex items-center shrink-0", className)}>
      {logoContent}
    </span>
  );
}
