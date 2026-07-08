"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button, Badge, Card, Checkbox, Radio, Input } from "@/components/ui";
import { RATING_OPTIONS } from "@/lib/constants";
import {
  resolveProductFieldToggles,
  useProductFieldToggles,
} from "@/hooks/useProductFieldToggles";
import type { FacetCount, FacetCountValue } from "@/lib/search/types";

const CATEGORY_FACET_FIELDS = ["categories_ids", "category", "category_id", "category_ids", "categories.name_en"];
const BRAND_FACET_FIELDS = ["brand_ids", "brand", "brand_id"];
const VENDOR_FACET_FIELDS = ["vendor_ids", "vendor_id", "vendor"];
const ATTRIBUTE_FACET_FIELDS = ["attributes_values_ids", "attr_pairs", "attributes"];
const SPECIFICATION_FACET_FIELDS = ["specifications_values_ids", "specifications"];

interface ProductFiltersProps {
  facets?: FacetCount[];
  selectedCategories?: string[];
  selectedBrands?: string[];
  selectedVendors?: string[];
  selectedAttributeValues?: string[];
  selectedSpecificationValues?: string[];
  priceRange?: { min: number; max: number };
  rating?: number;
  onFilterChange: (filters: FilterState) => void;
  facetLabelFallbacks?: Record<string, string>;
  className?: string;
}

export interface FilterState {
  categories: string[];
  brands: string[];
  vendors: string[];
  attributeValues: string[];
  specificationValues: string[];
  priceRange: { min: number; max: number } | null;
  rating: number | null;
}

type GroupedFacetItem = {
  value: string;
  label: string;
  count: number;
};

type GroupedFacetMap = Record<string, { title: string; items: GroupedFacetItem[] }>;

type FilterOptionRowProps = {
  checked: boolean;
  label: string;
  count?: number;
  control: React.ReactNode;
  onToggle: () => void;
  disabled?: boolean;
};

function findFacet(facets: FacetCount[], fieldNames: string[]) {
  return facets.find((facet) => fieldNames.includes(facet.field_name));
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

function labelForFacetValue(item: FacetCountValue) {
  return item.label?.trim() || item.value;
}

function hasUnresolvedNumericLabel(item: FacetCountValue) {
  return item.label === item.value && /^\d+$/.test(item.value);
}

function buildGroupedFacetMap(
  facet: FacetCount | undefined,
  locale: string,
  fallbackTitle: string
): GroupedFacetMap {
  if (!facet) return {};

  const groups: GroupedFacetMap = {};

  facet.counts.forEach((item) => {
    if (hasUnresolvedNumericLabel(item)) {
      return;
    }

    let groupKey = item.group_key ?? fallbackTitle;
    let groupLabel = item.group_label ?? fallbackTitle;
    let itemLabel = labelForFacetValue(item);

    if (!item.group_key && !item.group_label) {
      const parts = item.value.split(":");

      if (parts.length === 4) {
        groupKey = parts[0];
        groupLabel = locale === "ar" ? (parts[1] || parts[0]) : parts[0];
        itemLabel = locale === "ar" ? (parts[3] || parts[2]) : parts[2];
      } else if (parts.length === 2 && parts[0].includes("|")) {
        const groupParts = parts[0].split("|");
        const valueParts = parts[1].split("|");

        groupKey = groupParts[0];
        groupLabel = locale === "ar" && groupParts[1] ? groupParts[1] : groupParts[0];
        itemLabel = locale === "ar" && valueParts[1] ? valueParts[1] : valueParts[0];
      }
    }

    if (!groups[groupKey]) {
      groups[groupKey] = { title: groupLabel, items: [] };
    }

    groups[groupKey].items.push({
      value: item.value,
      label: itemLabel,
      count: item.count,
    });
  });

  return groups;
}

function FilterOptionRow({ checked, label, count, control, onToggle, disabled = false }: FilterOptionRowProps) {
  return (
    <div className={cn("flex items-center gap-2", disabled && "opacity-45")}>
      <div
        className="shrink-0"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {control}
      </div>
      <button
        type="button"
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 text-start transition-colors",
          disabled ? "cursor-not-allowed" : "hover:text-primary"
        )}
        onClick={disabled ? undefined : onToggle}
        disabled={disabled}
      >
        <span className={cn("min-w-0 flex-1 wrap-break-word text-sm text-primary", disabled && "text-third")}>
          {label}
        </span>
        {typeof count === "number" ? (
          <span className="text-xs text-third">
            ({count})
          </span>
        ) : null}
      </button>
    </div>
  );
}

export function ProductFilters({
  facets = [],
  selectedCategories = [],
  selectedBrands = [],
  selectedVendors = [],
  selectedAttributeValues = [],
  selectedSpecificationValues = [],
  priceRange,
  rating,
  onFilterChange,
  facetLabelFallbacks,
  className,
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["price"]);

  const initialFilterState = useMemo<FilterState>(() => ({
    categories: selectedCategories,
    brands: selectedBrands,
    vendors: selectedVendors,
    attributeValues: selectedAttributeValues,
    specificationValues: selectedSpecificationValues,
    priceRange: priceRange || null,
    rating: rating || null,
  }), [
    priceRange,
    rating,
    selectedAttributeValues,
    selectedBrands,
    selectedCategories,
    selectedSpecificationValues,
    selectedVendors,
  ]);

  const [filters, setFilters] = useState<FilterState>({
    categories: selectedCategories,
    brands: selectedBrands,
    vendors: selectedVendors,
    attributeValues: selectedAttributeValues,
    specificationValues: selectedSpecificationValues,
    priceRange: priceRange || null,
    rating: rating || null,
  });

  const [localMinPrice, setLocalMinPrice] = useState<string>(priceRange?.min?.toString() || '');
  const [localMaxPrice, setLocalMaxPrice] = useState<string>((priceRange?.max === Infinity || !priceRange?.max) ? '' : priceRange.max.toString());

  useEffect(() => {
    setFilters(initialFilterState);
  }, [initialFilterState]);

  useEffect(() => {
    setLocalMinPrice(priceRange?.min?.toString() || '');
    setLocalMaxPrice((priceRange?.max === Infinity || !priceRange?.max) ? '' : priceRange.max.toString());
  }, [priceRange]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = toggleValue(filters.categories, categoryId);
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBrandChange = (brandId: string) => {
    const newBrands = toggleValue(filters.brands, brandId);
    const newFilters = { ...filters, brands: newBrands };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleVendorChange = (vendorId: string) => {
    const newVendors = toggleValue(filters.vendors, vendorId);
    const newFilters = { ...filters, vendors: newVendors };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAttributeValueChange = (attributeValueId: string) => {
    const attributeValues = toggleValue(filters.attributeValues, attributeValueId);
    const newFilters = { ...filters, attributeValues };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSpecificationValueChange = (specificationValueId: string) => {
    const specificationValues = toggleValue(filters.specificationValues, specificationValueId);
    const newFilters = { ...filters, specificationValues };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (range: { min: number; max: number } | null) => {
    const newFilters = { ...filters, priceRange: range };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const applyPriceRange = () => {
    const minStr = localMinPrice.trim();
    const maxStr = localMaxPrice.trim();

    if (!minStr && !maxStr) {
      handlePriceChange(null);
      return;
    }

    const parsedMin = minStr ? Number(minStr) : 0;
    const parsedMax = maxStr ? Number(maxStr) : Infinity;

    if (!Number.isFinite(parsedMin) || (!Number.isFinite(parsedMax) && parsedMax !== Infinity)) {
      return;
    }

    const normalizedMin = Math.max(0, Math.floor(parsedMin));
    const normalizedMax =
      parsedMax === Infinity ? Infinity : Math.max(0, Math.floor(parsedMax));

    if (normalizedMax !== Infinity && normalizedMin > normalizedMax) {
      handlePriceChange({ min: normalizedMax, max: normalizedMin });
      return;
    }

    handlePriceChange({ min: normalizedMin, max: normalizedMax });
  };

  const handleRatingChange = (newRating: number | null) => {
    const newFilters = { ...filters, rating: newRating };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters: FilterState = {
      categories: [],
      brands: [],
      vendors: [],
      attributeValues: [],
      specificationValues: [],
      priceRange: null,
      rating: null,
    };
    setFilters(newFilters);
    setLocalMinPrice('');
    setLocalMaxPrice('');
    onFilterChange(newFilters);
  };

  const t = useTranslations();
  const locale = useLocale();

  // Product field toggles — hide vendor/attribute/specification facets when
  // disabled. Fail open to all-enabled while loading or on error.
  const { data: productFieldToggles } = useProductFieldToggles();
  const {
    vendorsEnabled,
    ratingsEnabled,
    attributesEnabled,
    specificationsEnabled,
  } = resolveProductFieldToggles(productFieldToggles);

  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    filters.vendors.length +
    filters.attributeValues.length +
    filters.specificationValues.length +
    (filters.priceRange ? 1 : 0) +
    (ratingsEnabled && filters.rating ? 1 : 0);

  const categoryFacet = findFacet(facets, CATEGORY_FACET_FIELDS);
  const brandFacet = findFacet(facets, BRAND_FACET_FIELDS);
  const vendorFacet = findFacet(facets, VENDOR_FACET_FIELDS);
  const attributeFacet = findFacet(facets, ATTRIBUTE_FACET_FIELDS);
  const specificationFacet = findFacet(facets, SPECIFICATION_FACET_FIELDS);

  const resolvedCategoryCounts = useMemo(
    () => categoryFacet?.counts.filter((item) => !hasUnresolvedNumericLabel(item)) ?? [],
    [categoryFacet]
  );

  const resolvedBrandCounts = useMemo(
    () => brandFacet?.counts.filter((item) => !hasUnresolvedNumericLabel(item)) ?? [],
    [brandFacet]
  );

  const resolvedVendorCounts = useMemo(
    () => vendorFacet?.counts.filter((item) => !hasUnresolvedNumericLabel(item)) ?? [],
    [vendorFacet]
  );

  const attributeGroups = useMemo(
    () => buildGroupedFacetMap(attributeFacet, locale, t('common.attributes')),
    [attributeFacet, locale, t]
  );

  const specificationGroups = useMemo(
    () => buildGroupedFacetMap(specificationFacet, locale, t('product.specifications')),
    [locale, specificationFacet, t]
  );

  const facetLabelLookup = useMemo(() => {
    const lookup = new Map<string, string>();

    facets.forEach((facet) => {
      facet.counts.forEach((item) => {
        lookup.set(`${facet.field_name}:${item.value}`, labelForFacetValue(item));
      });
    });

    return lookup;
  }, [facets]);

  const resolveFacetLabel = (fieldNames: string[], value: string) => {
    for (const fieldName of fieldNames) {
      const fallbackLabel = facetLabelFallbacks?.[`${fieldName}:${value}`];
      if (fallbackLabel) return fallbackLabel;

      const label = facetLabelLookup.get(`${fieldName}:${value}`);
      if (label && label !== value) return label;
    }

    return value;
  };

  const resolveGroupedLabel = (
    groups: GroupedFacetMap,
    fieldNames: string[],
    value: string,
  ) => {
    for (const group of Object.values(groups)) {
      const match = group.items.find((item) => item.value === value);
      if (match) return match.label;
    }

    return resolveFacetLabel(fieldNames, value);
  };

  return (
    <Card className={cn("p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary">{t('common.filters')}</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:underline"
          >
            {t('common.clearAll', { count: activeFiltersCount })}
          </button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100 mt-4">
          {filters.categories.map((catValue) => (
            <Badge
              key={catValue}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleCategoryChange(catValue)}
            >
              {resolveFacetLabel(CATEGORY_FACET_FIELDS, catValue)}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {filters.brands.map((brandVal) => (
            <Badge
              key={brandVal}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleBrandChange(brandVal)}
            >
              {resolveFacetLabel(BRAND_FACET_FIELDS, brandVal)}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {vendorsEnabled && filters.vendors.map((vendorVal) => (
            <Badge
              key={vendorVal}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleVendorChange(vendorVal)}
            >
              {resolveFacetLabel(VENDOR_FACET_FIELDS, vendorVal)}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {attributesEnabled && filters.attributeValues.map((attributeValueId) => (
            <Badge
              key={attributeValueId}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleAttributeValueChange(attributeValueId)}
            >
              {resolveGroupedLabel(attributeGroups, ATTRIBUTE_FACET_FIELDS, attributeValueId)}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {specificationsEnabled && filters.specificationValues.map((specificationValueId) => (
            <Badge
              key={specificationValueId}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleSpecificationValueChange(specificationValueId)}
            >
              {resolveGroupedLabel(specificationGroups, SPECIFICATION_FACET_FIELDS, specificationValueId)}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {filters.priceRange && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                setLocalMinPrice('');
                setLocalMaxPrice('');
                handlePriceChange(null);
              }}
            >
              {filters.priceRange.min} - {filters.priceRange.max === Infinity ? "+" : filters.priceRange.max} {t('common.currency')}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {ratingsEnabled && filters.rating && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleRatingChange(null)}
            >
              {filters.rating}+ {t('common.stars')}
              <X className="w-3 h-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Categories Section */}
      {resolvedCategoryCounts.length > 0 && (
        <FilterSection
          title={t('common.categories')}
          isExpanded={expandedSections.includes("categories")}
          onToggle={() => toggleSection("categories")}
        >
          <div className="flex flex-col gap-3">
            {resolvedCategoryCounts.map((catCount) => (
              <FilterOptionRow
                key={catCount.value}
                checked={filters.categories.includes(catCount.value)}
                label={labelForFacetValue(catCount)}
                count={catCount.count}
                disabled={catCount.count === 0 && !filters.categories.includes(catCount.value)}
                onToggle={() => handleCategoryChange(catCount.value)}
                control={(
                  <Checkbox
                    id={`cat-${catCount.value}`}
                    checked={filters.categories.includes(catCount.value)}
                    disabled={catCount.count === 0 && !filters.categories.includes(catCount.value)}
                    onChange={() => handleCategoryChange(catCount.value)}
                  />
                )}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Section */}
      <FilterSection
        title={t('common.price')}
        isExpanded={expandedSections.includes("price")}
        onToggle={() => toggleSection("price")}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              placeholder={t('common.min') || 'Min'}
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applyPriceRange();
                }
              }}
              className="w-full text-sm h-9"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              min="0"
              placeholder={t('common.max') || 'Max'}
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applyPriceRange();
                }
              }}
              className="w-full text-sm h-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={applyPriceRange}
          >
            {t('common.apply') || 'Apply'}
          </Button>
        </div>
      </FilterSection>

      {/* Brands Section */}
      {resolvedBrandCounts.length > 0 && (
        <FilterSection
          title={t('common.brands')}
          isExpanded={expandedSections.includes("brands")}
          onToggle={() => toggleSection("brands")}
        >
          <div className="flex flex-col gap-3">
            {resolvedBrandCounts.map((brandCount) => (
              <FilterOptionRow
                key={brandCount.value}
                checked={filters.brands.includes(brandCount.value)}
                label={labelForFacetValue(brandCount)}
                count={brandCount.count}
                disabled={brandCount.count === 0 && !filters.brands.includes(brandCount.value)}
                onToggle={() => handleBrandChange(brandCount.value)}
                control={(
                  <Checkbox
                    id={`brand-${brandCount.value}`}
                    checked={filters.brands.includes(brandCount.value)}
                    disabled={brandCount.count === 0 && !filters.brands.includes(brandCount.value)}
                    onChange={() => handleBrandChange(brandCount.value)}
                  />
                )}
              />
            ))}
          </div>
        </FilterSection>
      )}


      {/* Attributes dynamically grouped by original attribute name */}
      {attributesEnabled && Object.entries(attributeGroups).map(([key, group]) => (
        <FilterSection
          key={key}
          title={group.title}
          isExpanded={expandedSections.includes(`attr-${key}`)}
          onToggle={() => toggleSection(`attr-${key}`)}
        >
          <div className="flex flex-col gap-3">
            {group.items.map((item) => (
              <FilterOptionRow
                key={item.value}
                checked={filters.attributeValues.includes(item.value)}
                label={item.label}
                count={item.count}
                disabled={item.count === 0 && !filters.attributeValues.includes(item.value)}
                onToggle={() => handleAttributeValueChange(item.value)}
                control={(
                  <Checkbox
                    id={`attr-${item.value}`}
                    checked={filters.attributeValues.includes(item.value)}
                    disabled={item.count === 0 && !filters.attributeValues.includes(item.value)}
                    onChange={() => handleAttributeValueChange(item.value)}
                  />
                )}
              />
            ))}
          </div>
        </FilterSection>
      ))}

      {/* Specifications Section */}
      {specificationsEnabled && Object.entries(specificationGroups).map(([key, group]) => (
        <FilterSection
          key={key}
          title={group.title}
          isExpanded={expandedSections.includes(`spec-${key}`)}
          onToggle={() => toggleSection(`spec-${key}`)}
        >
          <div className="flex flex-col gap-3">
            {group.items.map((item) => (
              <FilterOptionRow
                key={item.value}
                checked={filters.specificationValues.includes(item.value)}
                label={item.label}
                count={item.count}
                disabled={item.count === 0 && !filters.specificationValues.includes(item.value)}
                onToggle={() => handleSpecificationValueChange(item.value)}
                control={(
                  <Checkbox
                    id={`spec-${item.value}`}
                    checked={filters.specificationValues.includes(item.value)}
                    disabled={item.count === 0 && !filters.specificationValues.includes(item.value)}
                    onChange={() => handleSpecificationValueChange(item.value)}
                  />
                )}
              />
            ))}
          </div>
        </FilterSection>
      ))}

      {/* Vendors Section */}
      {vendorsEnabled && resolvedVendorCounts.length > 0 && (
        <FilterSection
          title={t('nav.stores') || 'Vendors'}
          isExpanded={expandedSections.includes("vendors")}
          onToggle={() => toggleSection("vendors")}
        >
          <div className="flex flex-col gap-3">
            {resolvedVendorCounts.map((vendorCount) => (
              <FilterOptionRow
                key={vendorCount.value}
                checked={filters.vendors.includes(vendorCount.value)}
                label={labelForFacetValue(vendorCount)}
                count={vendorCount.count}
                disabled={vendorCount.count === 0 && !filters.vendors.includes(vendorCount.value)}
                onToggle={() => handleVendorChange(vendorCount.value)}
                control={(
                  <Checkbox
                    id={`vendor-${vendorCount.value}`}
                    checked={filters.vendors.includes(vendorCount.value)}
                    disabled={vendorCount.count === 0 && !filters.vendors.includes(vendorCount.value)}
                    onChange={() => handleVendorChange(vendorCount.value)}
                  />
                )}
              />
            ))}
          </div>
        </FilterSection>
      )}


      {ratingsEnabled && (
      <FilterSection
        title={t('common.rating')}
        isExpanded={expandedSections.includes("rating")}
        onToggle={() => toggleSection("rating")}
      >
        <div className="flex flex-col gap-3">
          {RATING_OPTIONS.map((option) => (
            <FilterOptionRow
              key={option.value}
              checked={filters.rating === option.value}
              label={t(option.label)}
              onToggle={() => handleRatingChange(option.value)}
              control={(
                <Radio
                  id={`rating-${option.value}`}
                  name="rating"
                  checked={filters.rating === option.value}
                  onChange={() => handleRatingChange(option.value)}
                />
              )}
            />
          ))}
        </div>
      </FilterSection>
      )}
    </Card>
  );
}

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={isExpanded}
      >
        <span className="font-medium text-primary">{title}</span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex"
        >
          <ChevronDown className="w-4 h-4 text-third" />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? 16 : 0,
        }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className={cn(isExpanded ? "overflow-visible" : "overflow-hidden")}
      >
        <div
          className={cn(
            "max-h-[50vh] overflow-y-auto overscroll-contain pe-1",
            !isExpanded && "pointer-events-none"
          )}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
