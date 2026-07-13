import type { Metadata } from "next";
import { headers } from "next/headers";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Figtree, Almarai } from "next/font/google";
import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/providers";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { SITE_CONFIG } from "@/lib/constants";
import { buildCanonicalUrl } from "@/lib/canonical-url";
import { getQueryClient } from "@/lib/query-client";
import { routing } from "@/i18n/routing";
import { ROOT_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { homeKeys } from "@/hooks/useHome";
import { homeService } from "@/services/home.service";
import { getSeoSettingsCached } from "@/services/settings.service";
import { resolveLocalizedSiteName } from "@/lib/site-branding";
import { Analytics } from "@vercel/analytics/next";
import { DataFastAnalytics } from "@/components/analytics/datafast-analytics";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./../globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  display: "swap",
  variable: "--font-almarai",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

function resolveLocalizedValue(
  locale: string,
  englishValue: string | null | undefined,
  arabicValue: string | null | undefined,
  fallbackValue: string,
) {
  const normalizedEnglishValue = englishValue?.trim();
  const normalizedArabicValue = arabicValue?.trim();

  if (locale === "ar") {
    return normalizedArabicValue || normalizedEnglishValue || fallbackValue;
  }

  return normalizedEnglishValue || normalizedArabicValue || fallbackValue;
}

function normalizeTwitterHandle(twitterHandle?: string | null) {
  const trimmedHandle = twitterHandle?.trim();

  if (!trimmedHandle) {
    return "@storefront";
  }

  return trimmedHandle.startsWith("@") ? trimmedHandle : `@${trimmedHandle}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seoSettings = await getSeoSettingsCached();

  const siteName = resolveLocalizedSiteName(locale, seoSettings);
  const defaultTitle = resolveLocalizedValue(
    locale,
    seoSettings?.default_meta_title_en,
    seoSettings?.default_meta_title_ar,
    siteName,
  );
  const defaultDescription = resolveLocalizedValue(
    locale,
    seoSettings?.default_meta_description_en,
    seoSettings?.default_meta_description_ar,
    SITE_CONFIG.description,
  );
  const openGraphImage = seoSettings?.default_og_image || SITE_CONFIG.ogImage;
  const twitterHandle = normalizeTwitterHandle(seoSettings?.twitter_handle);
  const headersList = await headers();
  const canonicalPath = headersList.get("x-canonical-path");
  const canonicalUrl = canonicalPath ? buildCanonicalUrl(canonicalPath) : SITE_CONFIG.url;

  return {
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: canonicalUrl,
    },
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description: defaultDescription,
    keywords: ["e-commerce", "online shopping", "storefront", "shop", "buy"],
    authors: [{ name: `${siteName} Team` }],
    creator: siteName,
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_JO" : "en_US",
      url: SITE_CONFIG.url,
      title: defaultTitle,
      description: defaultDescription,
      siteName,
      images: openGraphImage ? [openGraphImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      creator: twitterHandle,
      images: openGraphImage ? [openGraphImage] : undefined,
    },
    robots: {
      index: seoSettings?.robots_index ?? true,
      follow: seoSettings?.robots_follow ?? true,
    },
    verification: {
      google:
        seoSettings?.google_verification?.trim() ||
        "VRP8dQHgN5TtLK__ogKu2905Gg6Jz01H0xANRkuzkVw",
    },
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  const queryClient = getQueryClient();

  setRequestLocale(locale);

  await queryClient.prefetchQuery({
    queryKey: homeKeys.data(),
    queryFn: () => homeService.getHomeData(),
  }).catch(() => undefined);

  const isRTL = locale === 'ar';
  const resolvedLocale = locale as Locale;
  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} className={`${figtree.variable} ${almarai.variable}`}>
      <head>
        <GoogleAnalytics />
        <DataFastAnalytics />
      </head>
      <body className={`${isRTL ? almarai.className : figtree.className} antialiased min-h-screen flex flex-col bg-gray-50/50`}>
        <RouteIntlProvider locale={resolvedLocale} namespaces={ROOT_MESSAGE_NAMESPACES}>
          <Providers>
            <HydrationBoundary state={dehydratedState}>
              <Header />
              <main className="flex-1">
                <PageWrapper>
                  {children}
                </PageWrapper>
              </main>
              <Footer />
            </HydrationBoundary>
          </Providers>
        </RouteIntlProvider>
        <Analytics />
      </body>
    </html>
  );
}
