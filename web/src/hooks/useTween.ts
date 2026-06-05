"use client";

import { useCallback, useEffect, useRef } from "react";

export type Ease = (t: number) => number;

// 디자인 HTML script의 easeInOut과 동일 식.
export const easeInOut: Ease = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function useTween() {
  const rafRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tween = useCallback(
    (
      from: number,
      to: number,
      duration: number,
      ease: Ease,
      onUpdate: (v: number) => void,
      onDone?: () => void,
    ) => {
      cancel();
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        onUpdate(from + (to - from) * ease(t));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
          onDone?.();
        }
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [cancel],
  );

  // 언마운트 시 자동 cleanup.
  useEffect(() => cancel, [cancel]);

  return { tween, cancel };
}
