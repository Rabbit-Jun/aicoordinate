"use client";

import { useEffect } from "react";
import { initAnalytics, track } from "@/lib/analytics";
import { resolveVariant } from "@/lib/variant";

export function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics();
    track({ name: "landing_viewed" });

    // 클라이언트에서 URL을 다시 읽어 variant 결정.
    // 서버 컴포넌트(page.tsx)와 동일한 resolveVariant를 공유해 결과 일치를 보장.
    const params = new URLSearchParams(window.location.search);
    const variant = resolveVariant({
      utm_content: params.get("utm_content") ?? undefined,
    });
    track({ name: "hypothesis_variant_viewed", props: { variant } });
  }, []);

  return null;
}
