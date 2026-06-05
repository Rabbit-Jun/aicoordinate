import type { Metadata } from "next";
import { LandingBodyB } from "@/components/sections/b/LandingBodyB";
import {
  HEADLINE_A,
  SUB_A,
  PAIN_HEADLINE_A,
  PAIN_CARDS_A,
} from "../copy";

// 내부 열람용. AnalyticsProvider 미포함 → SDK init 자체 실행 안 됨.
// 추가 안전망: lib/analytics.ts의 pathname 가드(/\/dev(\/|$)/)가 init/track 모두 차단.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PageADev() {
  return (
    <LandingBodyB
      variant="a"
      heroHeadline={HEADLINE_A}
      heroSub={SUB_A}
      painHeadline={PAIN_HEADLINE_A}
      painCards={PAIN_CARDS_A}
      demoOrder="closet-first"
    />
  );
}
