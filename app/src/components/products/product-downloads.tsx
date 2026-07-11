"use client";

import { Download, FileText } from "lucide-react";
import { Card } from "@/components/ui";
import type { ProductDownload } from "@/types";

interface ProductDownloadsProps {
  downloads: ProductDownload[];
  title: string;
  downloadLabel: string;
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileExtension = (name: string) => {
  const parts = name.split(".");
  if (parts.length < 2) return "FILE";
  return parts[parts.length - 1].toUpperCase();
};

export function ProductDownloads({
  downloads,
  title,
  downloadLabel,
}: ProductDownloadsProps) {
  if (!downloads.length) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-primary mb-2">{title}</h2>
      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-3">
          {downloads.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="group flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 transition-all hover:border-primary/20 hover:bg-white hover:shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-primary group-hover:text-secondary">
                    {file.name}
                  </p>
                  <p className="mt-1 text-sm text-third">
                    {getFileExtension(file.name)}
                    {file.size ? ` • ${formatFileSize(file.size)}` : ""}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-secondary">
                <Download className="h-4 w-4" />
                {downloadLabel}
              </span>
            </a>
          ))}
        </div>
      </Card>
    </section>
  );
}
