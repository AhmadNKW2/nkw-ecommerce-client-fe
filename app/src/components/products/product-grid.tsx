"use client";

import { Product } from "@/types";
import { ProductCard } from "./product-card";
import { useTranslations } from "next-intl";
import { ResponsiveGrid } from "@/components/ui";

interface ProductGridProps {
  products: Product[];
  showActions?: boolean;
}

export function ProductGrid({
  products,
  showActions = true
}: ProductGridProps) {
  const t = useTranslations("productGrid");

  if (products.length === 0) {
    return (
      <div className="text-center">
        <p className="text-third text-lg">{t("emptyTitle")}</p>
        <p className="text-third text-sm mt-2">{t("emptySubtitle")}</p>
      </div>
    );
  }

  return (
    <ResponsiveGrid>
      {products.filter((product, index, self) => index === self.findIndex(p => p.id === product.id && p.defaultVariantId === product.defaultVariantId)).map((product) => (
        <ProductCard
          key={`${product.id}-${product.defaultVariantId ?? "base"}`}
          product={product}
          showActions={showActions}
          cartButtonVariant="floating"
          cartButtonColor="white"
          cartButtonIcon="add-to-cart"
        />
      ))}
    </ResponsiveGrid>
  );
}
