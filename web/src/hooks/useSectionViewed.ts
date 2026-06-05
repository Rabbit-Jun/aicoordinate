"use client";

import { useEffect, type RefObject } from "react";
import {
  track,
  type LandingVariant,
  type SectionName,
} from "@/lib/analytics";

// 페이지뷰당 1회만 발사. threshold 0.5 진입 시 track + io.disconnect.
// cleanup: useEffect return으로 io.disconnect 호출 (이탈/언마운트 시 안전 정리).

export function useSectionViewed(
  ref: RefObject<HTMLElement | null>,
  section: SectionName,
  variant: LandingVariant,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      // observer 미지원 환경: viewport 진입 가정해 1회 발사
      track({ name: "section_viewed", props: { section, variant } });
      return;
    }

    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            !fired &&
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.5
          ) {
            fired = true;
            track({ name: "section_viewed", props: { section, variant } });
            io.disconnect();
          }
        }
      },
      { threshold: [0, 0.5] },
    );
    io.observe(el);

    return () => {
      io.disconnect();
    };
  }, [ref, section, variant]);
}
