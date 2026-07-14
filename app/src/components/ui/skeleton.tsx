import { cn } from "@/lib/utils";
import { ResponsiveGrid } from "./responsive-grid";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%]",
        className
      )}
      {...props}
    />
  );
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-r1 border border-gray-100 bg-white overflow-hidden h-full flex flex-col">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-1 flex flex-col grow gap-2 min-h-[7.5rem]">
        <Skeleton className="h-[3.75rem] w-full" />
        <Skeleton className="h-7 w-20 mx-auto mt-auto" />
      </div>
    </div>
  );
}

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ResponsiveGrid>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </ResponsiveGrid>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="rounded-r1 border border-gray-100 bg-white overflow-hidden">
      <Skeleton className="aspect-4/3 w-full" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

function BannerSkeleton() {
  return (
    <Skeleton className="w-full h-[400px] md:h-[500px] rounded-r1" />
  );
}

export { 
  Skeleton, 
  ProductCardSkeleton, 
  ProductGridSkeleton, 
  CategoryCardSkeleton,
  BannerSkeleton 
};
