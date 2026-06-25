"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DesktopFiltersSidebarProps {
  children: ReactNode;
  className?: string;
  topClassName?: string;
}

export function DesktopFiltersSidebar({
  children,
  className,
  topClassName = "top-45",
}: DesktopFiltersSidebarProps) {
  return (
    <aside className={cn("hidden w-full shrink-0 lg:block lg:w-64", className)}>
      <div className={cn("sticky max-h-[calc(100vh-200px)] overflow-y-auto pr-1", topClassName)}>
        {children}
      </div>
    </aside>
  );
}