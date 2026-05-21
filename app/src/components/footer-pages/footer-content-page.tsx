import { Link } from "@/i18n/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ListingLayout } from "@/components/layout/listing-layout";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FooterPageBreadcrumb {
  label: string;
  href: string;
}

export interface FooterPageHighlight {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface FooterPageSection {
  id: string;
  title: string;
  body?: string[];
  items?: string[];
}

export interface FooterPageFaqItem {
  question: string;
  answer: string;
}

export interface FooterPageFaqGroup {
  title: string;
  items: FooterPageFaqItem[];
}

export interface FooterPageCta {
  title: string;
  description: string;
  primary?: {
    label: string;
    href: string;
  };
  secondary?: {
    label: string;
    href: string;
  };
}

interface FooterContentPageProps {
  breadcrumbs: FooterPageBreadcrumb[];
  badge?: string;
  title: string;
  subtitle: string;
  intro?: string;
  highlights?: FooterPageHighlight[];
  sections?: FooterPageSection[];
  faqGroups?: FooterPageFaqGroup[];
  cta?: FooterPageCta;
  variant?: "default" | "legal";
  children?: React.ReactNode;
}

const SURFACE_ACCENTS = [
  {
    card: "border-secondary/20 bg-linear-to-br from-white via-white to-secondary/10",
    edge: "from-secondary via-primary2 to-primary",
    icon: "bg-secondary/10 text-secondary",
    badge: "bg-secondary text-white",
    bullet: "bg-secondary",
    chip: "border-secondary/15 bg-secondary/10 text-secondary",
  },
  {
    card: "border-primary/15 bg-linear-to-br from-white via-white to-primary/10",
    edge: "from-primary2 via-primary to-secondary",
    icon: "bg-primary/10 text-primary",
    badge: "bg-primary text-white",
    bullet: "bg-primary",
    chip: "border-primary/10 bg-primary/5 text-primary",
  },
  {
    card: "border-primary2/20 bg-linear-to-br from-white via-white to-primary2/10",
    edge: "from-primary via-primary2 to-secondary",
    icon: "bg-primary2/10 text-primary2",
    badge: "bg-primary2 text-white",
    bullet: "bg-primary2",
    chip: "border-primary2/15 bg-primary2/10 text-primary",
  },
] as const;

export function FooterContentPage({
  breadcrumbs,
  badge,
  title,
  subtitle,
  intro,
  highlights = [],
  sections = [],
  faqGroups = [],
  cta,
  variant = "default",
  children,
}: FooterContentPageProps) {
  const hasLegalLayout = variant === "legal" && sections.length > 1;
  const heroTags =
    sections.length > 0
      ? sections.slice(0, 3).map((section) => section.title)
      : faqGroups.length > 0
        ? faqGroups.slice(0, 3).map((group) => group.title)
        : highlights.slice(0, 3).map((highlight) => highlight.title);

  return (
    <ListingLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-8 md:space-y-10">
        <section className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-primary via-primary2 to-secondary px-6 py-8 text-white shadow-s1 md:px-8 md:py-10 lg:px-10 lg:py-12">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(255, 255, 255, 0.2), transparent 30%), radial-gradient(circle at bottom right, rgba(67, 136, 233, 0.22), transparent 28%)",
            }}
          />
          <div className="absolute -top-16 ltr:right-0 rtl:left-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 ltr:left-8 rtl:right-8 h-32 w-32 rounded-full bg-primary2/25 blur-3xl" />

          <div className="relative space-y-6">
            {badge ? (
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                {badge}
              </span>
            ) : null}

            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl lg:text-[42px]">{title}</h1>
              <p className="max-w-3xl text-base leading-8 text-white/85 md:text-lg">{subtitle}</p>
              {intro ? <p className="max-w-3xl text-sm leading-7 text-white/75 md:text-base">{intro}</p> : null}
            </div>

            {heroTags.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {heroTags.map((tag, index) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                  >
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/15 px-2 text-[11px] font-semibold tracking-[0.18em] text-white/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {highlights.length > 0 ? (
          <section
            className={cn(
              "grid gap-4",
              highlights.length === 2
                ? "md:grid-cols-2"
                : highlights.length === 3
                  ? "md:grid-cols-3"
                  : "md:grid-cols-2 xl:grid-cols-4",
            )}
          >
            {highlights.map((highlight, index) => {
              const accent = SURFACE_ACCENTS[index % SURFACE_ACCENTS.length];

              return (
                <Card key={highlight.title} className={cn("group relative h-full overflow-hidden p-0", accent.card)}>
                  <div className={cn("h-1.5 bg-linear-to-r", accent.edge)} />
                  <div className="space-y-5 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className={cn("inline-flex rounded-[18px] p-3", accent.icon)}>{highlight.icon}</div>
                      <span
                        className={cn(
                          "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-xs font-semibold",
                          accent.badge,
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-lg font-semibold text-primary md:text-xl">{highlight.title}</h2>
                      <p className="text-sm leading-7 text-third md:text-base">{highlight.description}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className={cn("block h-2 w-10 rounded-full", accent.bullet)} />
                      <span className="block h-2 w-4 rounded-full bg-gray-200" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </section>
        ) : null}

        {children}

        {sections.length > 0 ? (
          <section
            className={cn(
              hasLegalLayout
                ? "mx-auto max-w-4xl space-y-5"
                : sections.length === 1
                  ? "grid grid-cols-1 gap-6"
                  : "grid gap-6 xl:grid-cols-2",
            )}
          >
            {sections.map((section, index) => {
              const accent = SURFACE_ACCENTS[index % SURFACE_ACCENTS.length];

              return (
                <Card
                  key={section.id}
                  id={section.id}
                  className={cn(
                    "relative overflow-hidden scroll-mt-24 p-0",
                    !hasLegalLayout && "h-full",
                    accent.card,
                  )}
                >
                  <div className={cn("h-1.5 bg-linear-to-r", accent.edge)} />
                  <div className="space-y-5 p-6 md:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                            accent.chip,
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h2 className={cn("font-semibold text-primary", hasLegalLayout ? "text-2xl" : "text-xl md:text-2xl")}>
                          {section.title}
                        </h2>
                      </div>
                      <span className={cn("mt-2 hidden h-2 w-16 rounded-full md:block", accent.bullet)} />
                    </div>
                    {section.body?.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-third md:text-base">
                        {paragraph}
                      </p>
                    ))}
                    {section.items?.length ? (
                      <ul className="space-y-3 text-sm leading-7 text-third md:text-base">
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-3 rounded-[18px] bg-white/75 px-4 py-3 shadow-sm">
                            <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", accent.bullet)} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </section>
        ) : null}

        {faqGroups.length > 0 ? (
          <section className={cn("grid gap-6", faqGroups.length === 1 ? "grid-cols-1" : "xl:grid-cols-2")}>
            {faqGroups.map((group, groupIndex) => {
              const accent = SURFACE_ACCENTS[groupIndex % SURFACE_ACCENTS.length];

              return (
                <Card key={group.title} className={cn("h-full overflow-hidden p-0", accent.card)}>
                  <div className={cn("h-1.5 bg-linear-to-r", accent.edge)} />
                  <div className="space-y-5 p-5 md:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-2xl font-semibold text-primary">{group.title}</h2>
                      <span
                        className={cn(
                          "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-xs font-semibold",
                          accent.badge,
                        )}
                      >
                        {String(group.items.length).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <details
                          key={item.question}
                          className="group rounded-[18px] border border-white/70 bg-white/80 px-4 py-4 transition hover:border-secondary/20 open:bg-white open:shadow-s1"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                            <span className="flex items-start gap-3">
                              <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", accent.bullet)} />
                              <span className="text-sm font-semibold text-primary md:text-base">{item.question}</span>
                            </span>
                            <span className="rounded-full bg-primary/5 p-2 text-third shadow-sm transition group-open:rotate-180 group-open:bg-secondary/10 group-open:text-secondary">
                              <ChevronDown className="size-4" />
                            </span>
                          </summary>
                          <p className="mt-3 text-sm leading-7 text-third md:text-base">{item.answer}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </section>
        ) : null}

        {cta ? (
          <section className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-primary via-primary2 to-secondary px-6 py-8 text-white shadow-s1 md:px-8 md:py-10">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 18% 24%, rgba(255, 255, 255, 0.18), transparent 24%), radial-gradient(circle at 82% 78%, rgba(67, 136, 233, 0.24), transparent 28%)",
              }}
            />
            <div className="absolute -top-10 ltr:right-0 rtl:left-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-2xl font-semibold md:text-3xl">{cta.title}</h2>
                <p className="text-sm leading-7 text-white/80 md:text-base">{cta.description}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {cta.primary ? (
                  <Link
                    href={cta.primary.href}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
                  >
                    <span>{cta.primary.label}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Link>
                ) : null}
                {cta.secondary ? (
                  <Link
                    href={cta.secondary.href}
                    className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <span>{cta.secondary.label}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </ListingLayout>
  );
}
