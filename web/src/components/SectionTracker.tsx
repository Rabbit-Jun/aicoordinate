"use client";

import { useRef, type ReactNode } from "react";
import { useSectionViewed } from "@/hooks/useSectionViewed";
import type { LandingVariant, SectionName } from "@/lib/analytics";

// server 섹션도 ref 달기 위한 client wrapper. children을 그대로 렌더하고
// 자체 <div>에 ref만 단다. 자체 div는 일반 block (display 영향 없도록 className 미지정).

export function SectionTracker({
  section,
  variant,
  children,
}: {
  section: SectionName;
  variant: LandingVariant;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useSectionViewed(ref, section, variant);
  return <div ref={ref}>{children}</div>;
}
