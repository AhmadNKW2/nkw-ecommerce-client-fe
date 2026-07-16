import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { ListingLayout } from "@/components/layout/listing-layout";
import { cn } from "@/lib/utils";
import { buildEntityPageHref } from "@/lib/search/entity-routes";

interface EntityGridPageProps {
  type: 'brand' | 'category' | 'vendor';
  data: any[];
  isLoading: boolean;
  title: string;
  subtitle?: string;
  error?: any;
}

export function EntityGridPage({ type, data, isLoading, title, subtitle, error }: EntityGridPageProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const t = useTranslations();

  // Grid Configuration based on type
  const gridConfig = {
    brand: "grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8",
    category: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
    vendor: "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10",
  };

  const currentGridClass = gridConfig[type];

  // Breadcrumbs
  let rootBreadcrumb = { label: "", href: "" };
  if (type === 'brand') rootBreadcrumb = { label: t("nav.brands"), href: "/brands" };
  else if (type === 'category') rootBreadcrumb = { label: t("nav.categories"), href: "/categories" };
  else if (type === 'vendor') rootBreadcrumb = { label: t("nav.stores"), href: "/vendors" };

  // Render Loader
  if (isLoading) {
    return (
      <ListingLayout
        title={title}
        subtitle={subtitle}
        breadcrumbs={[
            { label: t("common.home"), href: "/" },
            rootBreadcrumb
        ]}
      >
        <div className={cn("grid gap-4 md:gap-5", currentGridClass)}>
           {Array.from({ length: (type === 'brand' || type === 'vendor') ? 20 : 12 }).map((_, i) => (
             <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
           ))}
        </div>
      </ListingLayout>
    );
  }

  // Render Empty State
  if (!isLoading && data.length === 0) {
     return (
        <ListingLayout
            title={title}
            subtitle={subtitle}
            breadcrumbs={[
                { label: t("common.home"), href: "/" },
                rootBreadcrumb
            ]}
        >
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <p className="text-lg text-gray-500">{t("common.noResults")}</p>
            </div>
        </ListingLayout>
     );
  }

  return (
    <ListingLayout
      title={title}
      subtitle={subtitle}
      breadcrumbs={[
        { label: t("common.home"), href: "/" },
        rootBreadcrumb,
      ]}
    >
      <div className={cn("grid gap-4 md:gap-5", currentGridClass)}>
        {data.map((item) => {
          // Normalize Data
          let id, name, image, description, slug, rating;
          
          if (type === 'category') {
             id = item.id;
             name = item.name;
             slug = item.slug;
             image = item.image;
             description = item.productCount ? `${item.productCount} ${t("common.products")}` : undefined;
          } else if (type === 'brand') {
             id = item.id;
             name = isAr ? item.name_ar : item.name_en;
             slug = item.slug;
             image = item.logo;
          } else if (type === 'vendor') {
             id = item.id;
             name = isAr ? item.name_ar : item.name_en;
             slug = item.slug;
             image = item.logo;
             description = isAr ? item.description_ar : item.description_en;
             rating = 4.8; // Mocked
          }

          const href = buildEntityPageHref(
            type === 'brand' ? 'brand' : type === 'vendor' ? 'vendor' : 'category',
            slug || String(id),
          );

          // Render Card
          if (type === 'brand') {
            return (
              <Link key={id} href={href} className="group block">
                <div className="aspect-square bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-lg relative">
                  {image ? (
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 20vw, 12vw"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-300">
                      {name?.[0]}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-center text-base md:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                  {name}
                </h3>
              </Link>
            );
          }

          return (
             <Link
                key={id}
                href={href}
              className="group block"
             >
              <div className="aspect-square bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-lg grid grid-rows-[minmax(0,1fr)_auto]">
                <div className="relative min-h-0 bg-white flex items-center justify-center border-b border-gray-100">
                            {image ? (
                            <div className={cn(
                              "relative rounded-lg",
                              type === 'vendor' ? "w-1/2 h-1/2 m-auto aspect-square" : "w-full h-full"
                            )}>
                                <Image
                                    src={image}
                                    alt={name}
                                    fill
                                    className={type === 'vendor' ? "object-contain" : "object-cover"}
                                />
                            </div>
                            ) : (
                            <span className="text-2xl font-bold text-gray-300">{name?.[0]}</span>
                            )}
                    </div>
                        <div className="p-3 md:p-3.5 flex flex-col items-center justify-center text-center gap-1.5">
                          <h3 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                            {name}
                        </h3>
                            
                        {type === 'vendor' && rating && (
                            <div className="flex items-center justify-center gap-1 text-yellow-500 text-xs md:text-sm">
                                <Star className="fill-current w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span className="font-bold text-gray-900">{rating}</span>
                                <span className="text-gray-400">(120)</span>
                            </div>
                        )}
                    </div>
                </div>
             </Link>
          );
        })}
      </div>
    </ListingLayout>
  );
}
