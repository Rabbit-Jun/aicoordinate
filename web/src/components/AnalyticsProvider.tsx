"use client";

import { useEffect } from "react";
import { initAnalytics, track, type LandingVariant } from "@/lib/analytics";

type Props = {
  variant?: LandingVariant;
};

export function AnalyticsProvider({ variant = "default" }: Props = {}) {
  useEffect(() => {
    initAnalytics();
    track({ name: "landing_viewed", props: { variant } });
  }, [variant]);

  return null;
}
