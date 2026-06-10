"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { LanguageSwitcher } from "./language-switcher";
import { useHome } from "@/hooks/useHome";
import { transformHomeCategory, type Locale } from "@/lib/transformers";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  topOffset?: number;
}

export function MobileNav({ isOpen, onClose, topOffset = 0 }: MobileNavProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [activeRootCategoryId, setActiveRootCategoryId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Close menu when route changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Fetch Categories
  const { data: homeData } = useHome();

  const rootCategories = useMemo(
    () =>
      (homeData?.categories || [])
        .filter((category) => category.level === 0 || category.parent_id === null)
        .map((category) => transformHomeCategory(category, locale)),
    [homeData?.categories, locale],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (rootCategories.length === 0) {
      setActiveRootCategoryId(null);
      return;
    }

    const activeStillExists = rootCategories.some(
      (category) => category.id === activeRootCategoryId,
    );

    if (!activeRootCategoryId || !activeStillExists) {
      setActiveRootCategoryId(rootCategories[0]?.id ?? null);
    }
  }, [isOpen, rootCategories, activeRootCategoryId]);

  const activeRootCategory =
    rootCategories.find((category) => category.id === activeRootCategoryId) ??
    rootCategories[0] ??
    null;
  const displayedCategories =
    activeRootCategory?.children && activeRootCategory.children.length > 0
      ? activeRootCategory.children
      : activeRootCategory
        ? [activeRootCategory]
        : [];

  const markImageLoaded = (imageKey: string) => {
    setLoadedImages((current) =>
      current[imageKey] ? current : { ...current, [imageKey]: true },
    );
  };

  return (
    <div
      className={cn(
        "lg:hidden fixed inset-x-0 bottom-16 bg-white z-40 transition-transform duration-200 flex flex-col border-t border-gray-100",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
      style={{ top: topOffset }}
    >
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex w-[34%] min-w-[108px] max-w-[132px] flex-col border-r border-gray-100 bg-gray-50">
          <div
            className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0"
          >
            {rootCategories.map((category) => {
              const isActive = category.id === activeRootCategory?.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveRootCategoryId(category.id)}
                  className={cn(
                    "relative w-full border-b border-gray-100 px-3 py-4 text-start text-sm leading-5 transition-colors",
                    isActive
                      ? "bg-white font-semibold text-primary"
                      : "bg-transparent text-primary/85 hover:bg-white/80",
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="mobile-nav-active-category"
                      className="absolute inset-0 bg-white"
                      transition={{ type: "spring", stiffness: 520, damping: 40 }}
                    />
                  ) : null}
                  <span className="relative line-clamp-2">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <div
            className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeRootCategory?.id ?? "empty"}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                {displayedCategories.length > 0 ? (
                  <div className="grid grid-cols-3 gap-x-3 gap-y-4">
                    {displayedCategories.map((category, index) => {
                      const imageKey = `${category.id}:${category.image ?? "no-image"}`;
                      const hasImage = Boolean(category.image);
                      const isImageLoaded = hasImage ? loadedImages[imageKey] : false;

                      return (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          onClick={onClose}
                          className="flex flex-col items-center text-center"
                        >
                          <div className="relative h-18 w-18 overflow-hidden rounded-full bg-linear-to-br from-secondary/20 via-primary/5 to-third/20">
                            {hasImage ? (
                              <>
                                <div
                                  className={cn(
                                    "absolute inset-0 bg-linear-to-br from-white/55 via-transparent to-white/25 transition-opacity duration-200",
                                    isImageLoaded ? "opacity-0" : "animate-pulse opacity-100",
                                  )}
                                />
                                <div
                                  className={cn(
                                    "absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-primary/45 transition-opacity duration-200",
                                    isImageLoaded ? "opacity-0" : "opacity-100",
                                  )}
                                >
                                  {category.name.slice(0, 2).toUpperCase()}
                                </div>
                                <Image
                                  src={category.image!}
                                  alt={category.name}
                                  fill
                                  sizes="72px"
                                  priority={isOpen && index < 6}
                                  onLoad={() => markImageLoaded(imageKey)}
                                  className={cn(
                                    "object-cover transition-all duration-200 ease-out",
                                    isImageLoaded
                                      ? "scale-100 opacity-100"
                                      : "scale-[1.04] opacity-0",
                                  )}
                                />
                              </>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-primary/60">
                                {category.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="mt-2 line-clamp-2 text-xs font-medium leading-4 text-primary">
                            {category.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-gray-500">
                    {t("common.noCategories")}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
