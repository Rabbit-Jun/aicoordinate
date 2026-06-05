import type { Metadata } from "next";
import { LandingBodyB } from "@/components/sections/b/LandingBodyB";

// 내부 열람용. AnalyticsProvider 미포함 → SDK init 자체 실행 안 됨.
// 추가 안전망: lib/analytics.ts의 pathname 가드(/\/dev(\/|$)/)가 init/track 모두 차단.
// /b는 컴포넌트 기본 카피를 그대로 사용하므로 props 없이 호출.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PageBDev() {
  return <LandingBodyB variant="b" demoOrder="coordi-first" />;
}
