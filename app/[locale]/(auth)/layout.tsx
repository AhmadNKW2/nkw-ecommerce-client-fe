import type { Metadata } from "next";
import React from "react";
import { buildNoIndexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildNoIndexMetadata();

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
