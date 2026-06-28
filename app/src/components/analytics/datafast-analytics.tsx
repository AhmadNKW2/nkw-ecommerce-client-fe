"use client";

import { useEffect } from "react";
import { initDataFastClient } from "@/lib/datafast";

export function DataFastAnalytics() {
  useEffect(() => {
    void initDataFastClient();
  }, []);

  return null;
}
