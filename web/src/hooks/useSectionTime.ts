"use client";

import { useEffect, type RefObject } from "react";
import {
  track,
  flushAnalytics,
  type LandingVariant,
  type SectionName,
} from "@/lib/analytics";

// 섹션 체류 시간 측정.
// - 진입(가시율 ≥ 0.5) 시각을 기록, 이탈(< 0.5) 시 경과초 정수로 발사.
// - 1초 미만 노이즈 컷, 300초 초과는 300초로 캡(탭 방치 대비).
// - 재진입 시 별도 이벤트로 누적(Amplitude에서 합산/평균).
// - visibilitychange(hidden) / pagehide / 언마운트 시 진행 중인 측정 강제 발사 + flush.

const MIN_SECONDS = 1;
const MAX_SECONDS = 300;
const THRESHOLD = 0.5;

export function useSectionTime(
  ref: RefObject<HTMLElement | null>,
  section: SectionName,
  variant: LandingVariant,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return;

    let enterAt: number | null = null;

    function fire() {
      if (enterAt === null) return;
      const seconds = Math.round((Date.now() - enterAt) / 1000);
      enterAt = null;
      if (seconds < MIN_SECONDS) return;
      const capped = Math.min(seconds, MAX_SECONDS);
      track({
        name: "section_time",
        props: { section, variant, seconds: capped },
      });
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= THRESHOLD) {
            // 진입 — 이미 측정 중이면 무시(같은 임계 재진입 방지)
            if (enterAt === null) {
              enterAt = Date.now();
            }
          } else {
            // 이탈 — 현재 측정 종료 + 발사
            fire();
          }
        }
      },
      { threshold: [0, THRESHOLD] },
    );
    io.observe(el);

    // 탭 숨김 / 페이지 이탈 시 현재 측정 강제 발사 + flush
    function handleVisibility() {
      if (document.visibilityState === "hidden") {
        fire();
        flushAnalytics();
      }
    }
    function handlePageHide() {
      fire();
      flushAnalytics();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      // 언마운트 시에도 진행 중 측정 발사
      fire();
      io.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [ref, section, variant]);
}
