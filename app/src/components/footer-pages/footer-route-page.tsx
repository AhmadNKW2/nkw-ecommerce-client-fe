import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  Accessibility,
  BadgePercent,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Cookie,
  FileText,
  Gift,
  HelpCircle,
  Mail,
  MapPin,
  Newspaper,
  PackageSearch,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";
import { SITE_CONFIG, FREE_SHIPPING_MIN_ORDER_AMOUNT, STANDARD_SHIPPING_FEE } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import {
  FooterContentPage,
  type FooterPageCta,
  type FooterPageFaqGroup,
  type FooterPageHighlight,
  type FooterPageSection,
} from "./footer-content-page";
import { ContactFormPlaceholder } from "./contact-form-placeholder";
import { TrackOrderLookupCard } from "./track-order-lookup-card";

export type FooterPageKey =
  | "sale"
  | "giftCards"
  | "contact"
  | "faqs"
  | "shipping"
  | "returns"
  | "trackOrder"
  | "about"
  | "careers"
  | "blog"
  | "press"
  | "affiliate"
  | "privacy"
  | "terms"
  | "cookies"
  | "accessibility";

interface FooterRoutePageProps {
  pageKey: FooterPageKey;
  children?: React.ReactNode;
}

function makeBreadcrumbs(homeLabel: string, currentLabel: string, href: string) {
  return [
    { label: homeLabel, href: "/" },
    { label: currentLabel, href },
  ];
}

export async function generateFooterPageMetadata(pageKey: FooterPageKey): Promise<Metadata> {
  const t = await getTranslations("footerPages");

  return {
    title: t(`${pageKey}.title`),
    description: t(`${pageKey}.subtitle`),
  };
}

export async function FooterRoutePage({ pageKey, children }: FooterRoutePageProps) {
  const t = await getTranslations("footerPages");
  const commonT = await getTranslations("common");

  const homeLabel = commonT("home");

  const renderPage = (
    route: string,
    badge: string,
    title: string,
    subtitle: string,
    intro: string,
    highlights: FooterPageHighlight[],
    sections: FooterPageSection[],
    cta?: FooterPageCta,
    faqGroups?: FooterPageFaqGroup[],
    variant?: "default" | "legal",
    extraContent?: React.ReactNode,
  ) => (
    <FooterContentPage
      breadcrumbs={makeBreadcrumbs(homeLabel, title, route)}
      badge={badge}
      title={title}
      subtitle={subtitle}
      intro={intro}
      highlights={highlights}
      sections={sections}
      faqGroups={faqGroups}
      cta={cta}
      variant={variant}
    >
      {extraContent}
      {children}
    </FooterContentPage>
  );

  switch (pageKey) {
    case "sale": {
      return renderPage(
        "/sale",
        t("sale.badge"),
        t("sale.title"),
        t("sale.subtitle"),
        t("sale.intro"),
        [
          {
            icon: <BadgePercent className="size-5" />,
            title: t("sale.highlights.realDeals.title"),
            description: t("sale.highlights.realDeals.description"),
          },
          {
            icon: <Sparkles className="size-5" />,
            title: t("sale.highlights.freshDrops.title"),
            description: t("sale.highlights.freshDrops.description"),
          },
          {
            icon: <ShieldCheck className="size-5" />,
            title: t("sale.highlights.trustedPricing.title"),
            description: t("sale.highlights.trustedPricing.description"),
          },
        ],
        [
          {
            id: "how-it-works",
            title: t("sale.sections.howItWorks.title"),
            body: [t("sale.sections.howItWorks.body")],
            items: [
              t("sale.sections.howItWorks.items.livePricing"),
              t("sale.sections.howItWorks.items.visibleSavings"),
              t("sale.sections.howItWorks.items.fastRotation"),
            ],
          },
          {
            id: "smart-shopping",
            title: t("sale.sections.smartShopping.title"),
            body: [t("sale.sections.smartShopping.body")],
            items: [
              t("sale.sections.smartShopping.items.compare"),
              t("sale.sections.smartShopping.items.saveFavorites"),
              t("sale.sections.smartShopping.items.checkout"),
            ],
          },
        ],
        {
          title: t("sale.cta.title"),
          description: t("sale.cta.description"),
          primary: {
            label: t("sale.cta.primary"),
            href: "/products",
          },
          secondary: {
            label: t("sale.cta.secondary"),
            href: "/contact",
          },
        },
        undefined,
        "default",
      );
    }

    case "giftCards": {
      return renderPage(
        "/gift-cards",
        t("giftCards.badge"),
        t("giftCards.title"),
        t("giftCards.subtitle"),
        t("giftCards.intro"),
        [
          {
            icon: <Gift className="size-5" />,
            title: t("giftCards.highlights.flexible.title"),
            description: t("giftCards.highlights.flexible.description"),
          },
          {
            icon: <Sparkles className="size-5" />,
            title: t("giftCards.highlights.personal.title"),
            description: t("giftCards.highlights.personal.description"),
          },
          {
            icon: <WalletCards className="size-5" />,
            title: t("giftCards.highlights.easyToUse.title"),
            description: t("giftCards.highlights.easyToUse.description"),
          },
        ],
        [
          {
            id: "how-gift-cards-work",
            title: t("giftCards.sections.howItWorks.title"),
            body: [t("giftCards.sections.howItWorks.body")],
            items: [
              t("giftCards.sections.howItWorks.items.chooseAmount"),
              t("giftCards.sections.howItWorks.items.sendDetails"),
              t("giftCards.sections.howItWorks.items.redeemLater"),
            ],
          },
          {
            id: "great-for",
            title: t("giftCards.sections.whyPeopleLoveIt.title"),
            body: [t("giftCards.sections.whyPeopleLoveIt.body")],
            items: [
              t("giftCards.sections.whyPeopleLoveIt.items.birthdays"),
              t("giftCards.sections.whyPeopleLoveIt.items.corporate"),
              t("giftCards.sections.whyPeopleLoveIt.items.lastMinute"),
            ],
          },
        ],
        {
          title: t("giftCards.cta.title"),
          description: t("giftCards.cta.description"),
          primary: { label: t("giftCards.cta.primary"), href: "/contact" },
          secondary: { label: t("giftCards.cta.secondary"), href: "/products" },
        },
      );
    }

    case "contact": {
      const contactAddress = `${SITE_CONFIG.contact.address.en} / ${SITE_CONFIG.contact.address.ar}`;
      const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_CONFIG.contact.address.en)}`;

      return renderPage(
        "/contact",
        t("contact.badge"),
        t("contact.title"),
        t("contact.subtitle"),
        t("contact.intro"),
        [
          {
            icon: <Phone className="size-5" />,
            title: t("contact.highlights.phone.title"),
            description: SITE_CONFIG.contact.phone,
          },
          {
            icon: <Mail className="size-5" />,
            title: t("contact.highlights.email.title"),
            description: SITE_CONFIG.contact.email,
          },
          {
            icon: <MapPin className="size-5" />,
            title: t("contact.highlights.address.title"),
            description: contactAddress,
          },
          {
            icon: <Clock3 className="size-5" />,
            title: t("contact.highlights.hours.title"),
            description: t("contact.highlights.hours.description"),
          },
        ],
        [
          {
            id: "what-to-include",
            title: t("contact.sections.whatToInclude.title"),
            body: [t("contact.sections.whatToInclude.body")],
            items: [
              t("contact.sections.whatToInclude.items.orderNumber"),
              t("contact.sections.whatToInclude.items.productName"),
              t("contact.sections.whatToInclude.items.bestChannel"),
            ],
          },
          {
            id: "help-topics",
            title: t("contact.sections.helpTopics.title"),
            body: [t("contact.sections.helpTopics.body")],
            items: [
              t("contact.sections.helpTopics.items.orders"),
              t("contact.sections.helpTopics.items.productQuestions"),
              t("contact.sections.helpTopics.items.returns"),
            ],
          },
        ],
        {
          title: t("contact.cta.title"),
          description: t("contact.cta.description"),
          primary: { label: t("contact.cta.primary"), href: "/faqs" },
          secondary: { label: t("contact.cta.secondary"), href: "/shipping" },
        },
        undefined,
        "default",
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden border-secondary/20 bg-linear-to-br from-white via-white to-secondary/10 p-0">
            <div className="h-1.5 bg-linear-to-r from-secondary via-primary2 to-primary" />
            <div className="space-y-5 p-5 md:p-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-primary">{t("contact.contactCard.title")}</h2>
                <p className="text-sm leading-7 text-third md:text-base">{t("contact.contactCard.body")}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[20px] border border-secondary/15 bg-white/80 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-third">{t("contact.contactCard.phoneLabel")}</p>
                  <p className="mt-2 text-base font-semibold text-primary">{SITE_CONFIG.contact.phone}</p>
                </div>
                <div className="rounded-[20px] border border-primary/10 bg-white/80 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-third">{t("contact.contactCard.emailLabel")}</p>
                  <p className="mt-2 text-base font-semibold text-primary">{SITE_CONFIG.contact.email}</p>
                </div>
              </div>
              <div className="rounded-[20px] border border-primary2/20 bg-primary2/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-third">{t("contact.contactCard.addressLabel")}</p>
                <p className="mt-2 text-sm leading-7 text-primary md:text-base">{contactAddress}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={`tel:${SITE_CONFIG.contact.phone}`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-linear-to-r from-secondary to-primary2 px-5 py-2 text-sm font-medium text-white shadow-s1 transition-transform hover:-translate-y-0.5"
                >
                  {t("contact.contactCard.callAction")}
                </a>
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-primary/10 bg-white/80 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-white"
                >
                  {t("contact.contactCard.emailAction")}
                </a>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-primary2/20 bg-primary2/10 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary2/15"
                >
                  {t("contact.contactCard.directionsAction")}
                </a>
              </div>
            </div>
          </Card>
          <ContactFormPlaceholder
            title={t("contact.form.title")}
            description={t("contact.form.description")}
            nameLabel={t("contact.form.nameLabel")}
            emailLabel={t("contact.form.emailLabel")}
            phoneLabel={t("contact.form.phoneLabel")}
            messageLabel={t("contact.form.messageLabel")}
            submitLabel={t("contact.form.submitLabel")}
            successTitle={t("contact.form.successTitle")}
            successDescription={t("contact.form.successDescription")}
            noteLabel={t("contact.form.note")}
            resetLabel={t("contact.form.resetLabel")}
            supportActionLabel={t("contact.form.emailSupportAction")}
            supportHref={`mailto:${SITE_CONFIG.contact.email}`}
          />
        </div>,
      );
    }

    case "faqs": {
      return renderPage(
        "/faqs",
        t("faqs.badge"),
        t("faqs.title"),
        t("faqs.subtitle"),
        t("faqs.intro"),
        [
          {
            icon: <HelpCircle className="size-5" />,
            title: t("faqs.highlights.fastAnswers.title"),
            description: t("faqs.highlights.fastAnswers.description"),
          },
          {
            icon: <Truck className="size-5" />,
            title: t("faqs.highlights.delivery.title"),
            description: t("faqs.highlights.delivery.description"),
          },
          {
            icon: <ShieldCheck className="size-5" />,
            title: t("faqs.highlights.returns.title"),
            description: t("faqs.highlights.returns.description"),
          },
        ],
        [],
        {
          title: t("faqs.cta.title"),
          description: t("faqs.cta.description"),
          primary: { label: t("faqs.cta.primary"), href: "/contact" },
          secondary: { label: t("faqs.cta.secondary"), href: "/shipping" },
        },
        [
          {
            title: t("faqs.groups.shopping.title"),
            items: [
              { question: t("faqs.groups.shopping.q1"), answer: t("faqs.groups.shopping.a1") },
              { question: t("faqs.groups.shopping.q2"), answer: t("faqs.groups.shopping.a2") },
              { question: t("faqs.groups.shopping.q3"), answer: t("faqs.groups.shopping.a3") },
            ],
          },
          {
            title: t("faqs.groups.payment.title"),
            items: [
              { question: t("faqs.groups.payment.q1"), answer: t("faqs.groups.payment.a1") },
              { question: t("faqs.groups.payment.q2"), answer: t("faqs.groups.payment.a2") },
              { question: t("faqs.groups.payment.q3"), answer: t("faqs.groups.payment.a3") },
            ],
          },
          {
            title: t("faqs.groups.shipping.title"),
            items: [
              { question: t("faqs.groups.shipping.q1"), answer: t("faqs.groups.shipping.a1") },
              { question: t("faqs.groups.shipping.q2"), answer: t("faqs.groups.shipping.a2") },
              { question: t("faqs.groups.shipping.q3"), answer: t("faqs.groups.shipping.a3") },
            ],
          },
          {
            title: t("faqs.groups.account.title"),
            items: [
              { question: t("faqs.groups.account.q1"), answer: t("faqs.groups.account.a1") },
              { question: t("faqs.groups.account.q2"), answer: t("faqs.groups.account.a2") },
              { question: t("faqs.groups.account.q3"), answer: t("faqs.groups.account.a3") },
            ],
          },
        ],
      );
    }

    case "shipping": {
      return renderPage(
        "/shipping",
        t("shipping.badge"),
        t("shipping.title"),
        t("shipping.subtitle"),
        t("shipping.intro", {
          fee: String(STANDARD_SHIPPING_FEE),
          threshold: String(FREE_SHIPPING_MIN_ORDER_AMOUNT),
        }),
        [
          {
            icon: <Truck className="size-5" />,
            title: t("shipping.highlights.standard.title"),
            description: t("shipping.highlights.standard.description"),
          },
          {
            icon: <ShieldCheck className="size-5" />,
            title: t("shipping.highlights.reliable.title"),
            description: t("shipping.highlights.reliable.description"),
          },
          {
            icon: <PackageSearch className="size-5" />,
            title: t("shipping.highlights.visibility.title"),
            description: t("shipping.highlights.visibility.description"),
          },
        ],
        [
          {
            id: "delivery-windows",
            title: t("shipping.sections.deliveryWindows.title"),
            body: [t("shipping.sections.deliveryWindows.body")],
            items: [
              t("shipping.sections.deliveryWindows.items.processing"),
              t("shipping.sections.deliveryWindows.items.cityCoverage"),
              t("shipping.sections.deliveryWindows.items.busyPeriods"),
            ],
          },
          {
            id: "fees-thresholds",
            title: t("shipping.sections.fees.title"),
            body: [
              t("shipping.sections.fees.body", {
                fee: String(STANDARD_SHIPPING_FEE),
                threshold: String(FREE_SHIPPING_MIN_ORDER_AMOUNT),
              }),
            ],
            items: [
              t("shipping.sections.fees.items.standardFee", { fee: String(STANDARD_SHIPPING_FEE) }),
              t("shipping.sections.fees.items.freeThreshold", { threshold: String(FREE_SHIPPING_MIN_ORDER_AMOUNT) }),
              t("shipping.sections.fees.items.finalReview"),
            ],
          },
        ],
        {
          title: t("shipping.cta.title"),
          description: t("shipping.cta.description"),
          primary: { label: t("shipping.cta.primary"), href: "/products" },
          secondary: { label: t("shipping.cta.secondary"), href: "/contact" },
        },
      );
    }

    case "returns": {
      return renderPage(
        "/returns",
        t("returns.badge"),
        t("returns.title"),
        t("returns.subtitle"),
        t("returns.intro"),
        [
          {
            icon: <RotateCcw className="size-5" />,
            title: t("returns.highlights.clearPolicy.title"),
            description: t("returns.highlights.clearPolicy.description"),
          },
          {
            icon: <ShieldCheck className="size-5" />,
            title: t("returns.highlights.fairReview.title"),
            description: t("returns.highlights.fairReview.description"),
          },
          {
            icon: <Truck className="size-5" />,
            title: t("returns.highlights.supportedSteps.title"),
            description: t("returns.highlights.supportedSteps.description"),
          },
        ],
        [
          {
            id: "eligibility",
            title: t("returns.sections.eligibility.title"),
            body: [t("returns.sections.eligibility.body")],
            items: [
              t("returns.sections.eligibility.items.condition"),
              t("returns.sections.eligibility.items.packaging"),
              t("returns.sections.eligibility.items.proof"),
            ],
          },
          {
            id: "refunds-exchanges",
            title: t("returns.sections.refunds.title"),
            body: [t("returns.sections.refunds.body")],
            items: [
              t("returns.sections.refunds.items.review"),
              t("returns.sections.refunds.items.exchange"),
              t("returns.sections.refunds.items.timeline"),
            ],
          },
        ],
        {
          title: t("returns.cta.title"),
          description: t("returns.cta.description"),
          primary: { label: t("returns.cta.primary"), href: "/contact" },
          secondary: { label: t("returns.cta.secondary"), href: "/faqs" },
        },
      );
    }

    case "trackOrder": {
      return renderPage(
        "/track-order",
        t("trackOrder.badge"),
        t("trackOrder.title"),
        t("trackOrder.subtitle"),
        t("trackOrder.intro"),
        [
          {
            icon: <PackageSearch className="size-5" />,
            title: t("trackOrder.highlights.lookup.title"),
            description: t("trackOrder.highlights.lookup.description"),
          },
          {
            icon: <Truck className="size-5" />,
            title: t("trackOrder.highlights.status.title"),
            description: t("trackOrder.highlights.status.description"),
          },
          {
            icon: <HelpCircle className="size-5" />,
            title: t("trackOrder.highlights.support.title"),
            description: t("trackOrder.highlights.support.description"),
          },
        ],
        [
          {
            id: "status-guide",
            title: t("trackOrder.sections.statusGuide.title"),
            body: [t("trackOrder.sections.statusGuide.body")],
            items: [
              t("trackOrder.sections.statusGuide.items.confirmed"),
              t("trackOrder.sections.statusGuide.items.processing"),
              t("trackOrder.sections.statusGuide.items.delivered"),
            ],
          },
          {
            id: "need-help",
            title: t("trackOrder.sections.needHelp.title"),
            body: [t("trackOrder.sections.needHelp.body")],
            items: [
              t("trackOrder.sections.needHelp.items.keepNumber"),
              t("trackOrder.sections.needHelp.items.signIn"),
              t("trackOrder.sections.needHelp.items.contact"),
            ],
          },
        ],
        {
          title: t("trackOrder.cta.title"),
          description: t("trackOrder.cta.description"),
          primary: { label: t("trackOrder.cta.primary"), href: "/profile/orders" },
          secondary: { label: t("trackOrder.cta.secondary"), href: "/contact" },
        },
        undefined,
        "default",
        <TrackOrderLookupCard
          title={t("trackOrder.lookup.title")}
          description={t("trackOrder.lookup.description")}
          orderNumberLabel={t("trackOrder.lookup.orderNumberLabel")}
          emailLabel={t("trackOrder.lookup.emailLabel")}
          submitLabel={t("trackOrder.lookup.submitLabel")}
          successTitle={t("trackOrder.lookup.successTitle")}
          successDescription={t("trackOrder.lookup.successDescription")}
          accountCtaLabel={t("trackOrder.lookup.accountCta")}
          supportCtaLabel={t("trackOrder.lookup.supportCta")}
        />,
      );
    }

    case "about": {
      return renderPage(
        "/about",
        t("about.badge"),
        t("about.title"),
        t("about.subtitle"),
        t("about.intro"),
        [
          {
            icon: <Building2 className="size-5" />,
            title: t("about.highlights.rooted.title"),
            description: t("about.highlights.rooted.description"),
          },
          {
            icon: <ShieldCheck className="size-5" />,
            title: t("about.highlights.trust.title"),
            description: t("about.highlights.trust.description"),
          },
          {
            icon: <Users className="size-5" />,
            title: t("about.highlights.customerFirst.title"),
            description: t("about.highlights.customerFirst.description"),
          },
        ],
        [
          {
            id: "our-story",
            title: t("about.sections.story.title"),
            body: [t("about.sections.story.body")],
            items: [
              t("about.sections.story.items.curatedCatalog"),
              t("about.sections.story.items.localRelevance"),
              t("about.sections.story.items.clearJourney"),
            ],
          },
          {
            id: "our-promise",
            title: t("about.sections.promise.title"),
            body: [t("about.sections.promise.body")],
            items: [
              t("about.sections.promise.items.quality"),
              t("about.sections.promise.items.support"),
              t("about.sections.promise.items.transparency"),
            ],
          },
        ],
        {
          title: t("about.cta.title"),
          description: t("about.cta.description"),
          primary: { label: t("about.cta.primary"), href: "/products" },
          secondary: { label: t("about.cta.secondary"), href: "/contact" },
        },
      );
    }

    case "careers": {
      return renderPage(
        "/careers",
        t("careers.badge"),
        t("careers.title"),
        t("careers.subtitle"),
        t("careers.intro"),
        [
          {
            icon: <BriefcaseBusiness className="size-5" />,
            title: t("careers.highlights.growth.title"),
            description: t("careers.highlights.growth.description"),
          },
          {
            icon: <Users className="size-5" />,
            title: t("careers.highlights.collaboration.title"),
            description: t("careers.highlights.collaboration.description"),
          },
          {
            icon: <Sparkles className="size-5" />,
            title: t("careers.highlights.impact.title"),
            description: t("careers.highlights.impact.description"),
          },
        ],
        [
          {
            id: "culture",
            title: t("careers.sections.culture.title"),
            body: [t("careers.sections.culture.body")],
            items: [
              t("careers.sections.culture.items.ownership"),
              t("careers.sections.culture.items.customerFocus"),
              t("careers.sections.culture.items.learning"),
            ],
          },
          {
            id: "open-roles",
            title: t("careers.sections.roles.title"),
            body: [t("careers.sections.roles.body")],
            items: [
              t("careers.sections.roles.items.catalog"),
              t("careers.sections.roles.items.operations"),
              t("careers.sections.roles.items.support"),
            ],
          },
        ],
        {
          title: t("careers.cta.title"),
          description: t("careers.cta.description"),
          primary: { label: t("careers.cta.primary"), href: "/contact" },
          secondary: { label: t("careers.cta.secondary"), href: "/about" },
        },
      );
    }

    case "blog": {
      return renderPage(
        "/blog",
        t("blog.badge"),
        t("blog.title"),
        t("blog.subtitle"),
        t("blog.intro"),
        [
          {
            icon: <Bookmark className="size-5" />,
            title: t("blog.highlights.guides.title"),
            description: t("blog.highlights.guides.description"),
          },
          {
            icon: <Sparkles className="size-5" />,
            title: t("blog.highlights.trends.title"),
            description: t("blog.highlights.trends.description"),
          },
          {
            icon: <Users className="size-5" />,
            title: t("blog.highlights.community.title"),
            description: t("blog.highlights.community.description"),
          },
        ],
        [
          {
            id: "featured-stories",
            title: t("blog.sections.featured.title"),
            body: [t("blog.sections.featured.body")],
            items: [
              t("blog.sections.featured.items.story1"),
              t("blog.sections.featured.items.story2"),
              t("blog.sections.featured.items.story3"),
            ],
          },
          {
            id: "what-to-expect",
            title: t("blog.sections.expect.title"),
            body: [t("blog.sections.expect.body")],
            items: [
              t("blog.sections.expect.items.shoppingTips"),
              t("blog.sections.expect.items.brandStories"),
              t("blog.sections.expect.items.roundups"),
            ],
          },
        ],
        {
          title: t("blog.cta.title"),
          description: t("blog.cta.description"),
          primary: { label: t("blog.cta.primary"), href: "/products" },
          secondary: { label: t("blog.cta.secondary"), href: "/contact" },
        },
      );
    }

    case "press": {
      return renderPage(
        "/press",
        t("press.badge"),
        t("press.title"),
        t("press.subtitle"),
        t("press.intro"),
        [
          {
            icon: <Newspaper className="size-5" />,
            title: t("press.highlights.brandStory.title"),
            description: t("press.highlights.brandStory.description"),
          },
          {
            icon: <Building2 className="size-5" />,
            title: t("press.highlights.facts.title"),
            description: t("press.highlights.facts.description"),
          },
          {
            icon: <Mail className="size-5" />,
            title: t("press.highlights.mediaContact.title"),
            description: t("press.highlights.mediaContact.description"),
          },
        ],
        [
          {
            id: "company-overview",
            title: t("press.sections.overview.title"),
            body: [t("press.sections.overview.body")],
            items: [
              t("press.sections.overview.items.ecommerce"),
              t("press.sections.overview.items.customerExperience"),
              t("press.sections.overview.items.brandPartnerships"),
            ],
          },
          {
            id: "media-kit",
            title: t("press.sections.mediaKit.title"),
            body: [t("press.sections.mediaKit.body")],
            items: [
              t("press.sections.mediaKit.items.logo"),
              t("press.sections.mediaKit.items.brandSummary"),
              t("press.sections.mediaKit.items.contact"),
            ],
          },
        ],
        {
          title: t("press.cta.title"),
          description: t("press.cta.description"),
          primary: { label: t("press.cta.primary"), href: "/contact" },
          secondary: { label: t("press.cta.secondary"), href: "/about" },
        },
      );
    }

    case "affiliate": {
      return renderPage(
        "/affiliate",
        t("affiliate.badge"),
        t("affiliate.title"),
        t("affiliate.subtitle"),
        t("affiliate.intro"),
        [
          {
            icon: <BadgePercent className="size-5" />,
            title: t("affiliate.highlights.rewards.title"),
            description: t("affiliate.highlights.rewards.description"),
          },
          {
            icon: <Users className="size-5" />,
            title: t("affiliate.highlights.partners.title"),
            description: t("affiliate.highlights.partners.description"),
          },
          {
            icon: <Sparkles className="size-5" />,
            title: t("affiliate.highlights.simpleFlow.title"),
            description: t("affiliate.highlights.simpleFlow.description"),
          },
        ],
        [
          {
            id: "how-affiliate-works",
            title: t("affiliate.sections.howItWorks.title"),
            body: [t("affiliate.sections.howItWorks.body")],
            items: [
              t("affiliate.sections.howItWorks.items.apply"),
              t("affiliate.sections.howItWorks.items.share"),
              t("affiliate.sections.howItWorks.items.earn"),
            ],
          },
          {
            id: "ideal-partners",
            title: t("affiliate.sections.partners.title"),
            body: [t("affiliate.sections.partners.body")],
            items: [
              t("affiliate.sections.partners.items.creators"),
              t("affiliate.sections.partners.items.publishers"),
              t("affiliate.sections.partners.items.communities"),
            ],
          },
        ],
        {
          title: t("affiliate.cta.title"),
          description: t("affiliate.cta.description"),
          primary: { label: t("affiliate.cta.primary"), href: "/contact" },
          secondary: { label: t("affiliate.cta.secondary"), href: "/about" },
        },
      );
    }

    case "privacy": {
      return renderPage(
        "/privacy",
        t("privacy.badge"),
        t("privacy.title"),
        t("privacy.subtitle"),
        t("privacy.intro"),
        [],
        [
          {
            id: "data-collection",
            title: t("privacy.sections.collection.title"),
            body: [t("privacy.sections.collection.body")],
            items: [
              t("privacy.sections.collection.items.account"),
              t("privacy.sections.collection.items.orders"),
              t("privacy.sections.collection.items.support"),
            ],
          },
          {
            id: "how-we-use-data",
            title: t("privacy.sections.usage.title"),
            body: [t("privacy.sections.usage.body")],
            items: [
              t("privacy.sections.usage.items.fulfillment"),
              t("privacy.sections.usage.items.improvement"),
              t("privacy.sections.usage.items.marketing"),
            ],
          },
          {
            id: "sharing-retention",
            title: t("privacy.sections.sharing.title"),
            body: [t("privacy.sections.sharing.body")],
            items: [
              t("privacy.sections.sharing.items.providers"),
              t("privacy.sections.sharing.items.compliance"),
              t("privacy.sections.sharing.items.retention"),
            ],
          },
          {
            id: "cookies-security",
            title: t("privacy.sections.cookies.title"),
            body: [t("privacy.sections.cookies.body")],
            items: [
              t("privacy.sections.cookies.items.preferences"),
              t("privacy.sections.cookies.items.analytics"),
              t("privacy.sections.cookies.items.security"),
            ],
          },
        ],
        {
          title: t("privacy.cta.title"),
          description: t("privacy.cta.description"),
          primary: { label: t("privacy.cta.primary"), href: "/contact" },
        },
        undefined,
        "legal",
      );
    }

    case "terms": {
      return renderPage(
        "/terms",
        t("terms.badge"),
        t("terms.title"),
        t("terms.subtitle"),
        t("terms.intro"),
        [],
        [
          {
            id: "site-use",
            title: t("terms.sections.siteUse.title"),
            body: [t("terms.sections.siteUse.body")],
            items: [
              t("terms.sections.siteUse.items.accuracy"),
              t("terms.sections.siteUse.items.access"),
              t("terms.sections.siteUse.items.content"),
            ],
          },
          {
            id: "accounts-orders",
            title: t("terms.sections.accounts.title"),
            body: [t("terms.sections.accounts.body")],
            items: [
              t("terms.sections.accounts.items.credentials"),
              t("terms.sections.accounts.items.orderDetails"),
              t("terms.sections.accounts.items.availability"),
            ],
          },
          {
            id: "pricing-payments",
            title: t("terms.sections.pricing.title"),
            body: [t("terms.sections.pricing.body")],
            items: [
              t("terms.sections.pricing.items.prices"),
              t("terms.sections.pricing.items.payments"),
              t("terms.sections.pricing.items.promotions"),
            ],
          },
          {
            id: "returns-liability",
            title: t("terms.sections.returns.title"),
            body: [t("terms.sections.returns.body")],
            items: [
              t("terms.sections.returns.items.review"),
              t("terms.sections.returns.items.refunds"),
              t("terms.sections.returns.items.liability"),
            ],
          },
        ],
        {
          title: t("terms.cta.title"),
          description: t("terms.cta.description"),
          primary: { label: t("terms.cta.primary"), href: "/contact" },
        },
        undefined,
        "legal",
      );
    }

    case "cookies": {
      return renderPage(
        "/cookies",
        t("cookies.badge"),
        t("cookies.title"),
        t("cookies.subtitle"),
        t("cookies.intro"),
        [],
        [
          {
            id: "essential-cookies",
            title: t("cookies.sections.essential.title"),
            body: [t("cookies.sections.essential.body")],
            items: [
              t("cookies.sections.essential.items.session"),
              t("cookies.sections.essential.items.cart"),
              t("cookies.sections.essential.items.security"),
            ],
          },
          {
            id: "analytics-personalization",
            title: t("cookies.sections.analytics.title"),
            body: [t("cookies.sections.analytics.body")],
            items: [
              t("cookies.sections.analytics.items.performance"),
              t("cookies.sections.analytics.items.preferences"),
              t("cookies.sections.analytics.items.relevance"),
            ],
          },
          {
            id: "managing-cookies",
            title: t("cookies.sections.manage.title"),
            body: [t("cookies.sections.manage.body")],
            items: [
              t("cookies.sections.manage.items.browser"),
              t("cookies.sections.manage.items.tradeoff"),
              t("cookies.sections.manage.items.support"),
            ],
          },
        ],
        {
          title: t("cookies.cta.title"),
          description: t("cookies.cta.description"),
          primary: { label: t("cookies.cta.primary"), href: "/privacy" },
        },
        undefined,
        "legal",
      );
    }

    case "accessibility": {
      return renderPage(
        "/accessibility",
        t("accessibility.badge"),
        t("accessibility.title"),
        t("accessibility.subtitle"),
        t("accessibility.intro"),
        [
          {
            icon: <Accessibility className="size-5" />,
            title: t("accessibility.highlights.commitment.title"),
            description: t("accessibility.highlights.commitment.description"),
          },
          {
            icon: <ShieldCheck className="size-5" />,
            title: t("accessibility.highlights.structure.title"),
            description: t("accessibility.highlights.structure.description"),
          },
          {
            icon: <Mail className="size-5" />,
            title: t("accessibility.highlights.feedback.title"),
            description: t("accessibility.highlights.feedback.description"),
          },
        ],
        [
          {
            id: "our-approach",
            title: t("accessibility.sections.approach.title"),
            body: [t("accessibility.sections.approach.body")],
            items: [
              t("accessibility.sections.approach.items.navigation"),
              t("accessibility.sections.approach.items.content"),
              t("accessibility.sections.approach.items.forms"),
            ],
          },
          {
            id: "known-limitations",
            title: t("accessibility.sections.limitations.title"),
            body: [t("accessibility.sections.limitations.body")],
            items: [
              t("accessibility.sections.limitations.items.thirdParty"),
              t("accessibility.sections.limitations.items.media"),
              t("accessibility.sections.limitations.items.iteration"),
            ],
          },
        ],
        {
          title: t("accessibility.cta.title"),
          description: t("accessibility.cta.description"),
          primary: { label: t("accessibility.cta.primary"), href: "/contact" },
          secondary: { label: t("accessibility.cta.secondary"), href: "/faqs" },
        },
      );
    }

    default:
      return null;
  }
}
