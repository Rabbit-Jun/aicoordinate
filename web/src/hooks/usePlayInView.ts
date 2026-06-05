"use client";

import { useEffect, useRef, type RefObject } from "react";

type Opts = {
  ref: RefObject<HTMLElement | null>;
  play: () => void;
  stop: () => void;
  threshold?: number;
  // observer 미지원 또는 즉시 진입 fallback (디자인 HTML과 동일 1700ms).
  fallbackDelayMs?: number;
};

// IntersectionObserver로 viewport 진입 시 play(), 이탈 시 stop().
// observer/timers/stop 호출은 useEffect cleanup에서 일괄 정리.
export function usePlayInView({
  ref,
  play,
  stop,
  threshold = 0.1,
  fallbackDelayMs = 1700,
}: Opts): void {
  const playRef = useRef(play);
  const stopRef = useRef(stop);
  playRef.current = play;
  stopRef.current = stop;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startedOnce = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    function tryPlay() {
      if (!startedOnce) {
        startedOnce = true;
        if (fallbackTimer !== null) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        playRef.current();
      }
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && entry.intersectionRatio > threshold) {
              tryPlay();
            } else if (!entry.isIntersecting) {
              startedOnce = false;
              stopRef.current();
            }
          }
        },
        { threshold: [0, threshold, 0.5] },
      );
      io.observe(el);
      fallbackTimer = setTimeout(tryPlay, fallbackDelayMs);

      return () => {
        if (fallbackTimer !== null) clearTimeout(fallbackTimer);
        io.disconnect();
        stopRef.current();
      };
    } else {
      // observer 미지원 환경: 즉시 재생
      playRef.current();
      return () => stopRef.current();
    }
  }, [ref, threshold, fallbackDelayMs]);
}
