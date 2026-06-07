import type { HTMLAttributes, ReactNode } from "react";

interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ResponsiveGrid({
  children,
  ...props
}: ResponsiveGridProps) {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 lg:gap-5"
      {...props}
    >
      {children}
    </div>
  );
}
