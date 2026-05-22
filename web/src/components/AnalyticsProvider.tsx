"use client";

import { useEffect } from "react";
import { initAnalytics, track } from "@/lib/analytics";

export function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics();
    track({ name: "landing_viewed" });
  }, []);

  return null;
}
