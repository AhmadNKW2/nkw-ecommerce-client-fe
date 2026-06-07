import { ResponsiveGrid } from "@/components/ui";

export function SearchSkeleton() {
  return (
    <ResponsiveGrid>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden animate-pulse bg-white">
          <div className="aspect-square bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
            <div className="h-4 bg-gray-200 rounded w-3/5" />
            <div className="h-5 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </ResponsiveGrid>
  );
}
