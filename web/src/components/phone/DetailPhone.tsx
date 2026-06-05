"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { StatusBar } from "./StatusBar";
import { usePlayInView } from "@/hooks/usePlayInView";
import { useTween, easeInOut } from "@/hooks/useTween";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// 디자인 HTML .dt-* / .co-header 정확값. 자연 360px 캔버스.
const COLORS = {
  text: "#111",
  textSub: "#333",
  textMute: "#8A8A8A",
  textGrey: "#9A9A9A",
  divider: "#F0F0F0",
  border: "#EFEFEF",
  bg: "#fff",
  thumbBg: "#F7F6F4",
  coral: "#E73349",
  grab: "#E2E2E2",
} as const;

type Props = {
  title: string;
  hero: { name: string; src: string };
  items: ReadonlyArray<{ name: string; src: string; cat?: string }>;
};

export function DetailPhone({ title, hero, items }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const reduce = usePrefersReducedMotion();
  const { tween, cancel } = useTween();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [translateY, setTranslateY] = useState(0);

  function later(fn: () => void, ms: number) {
    timersRef.current.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    cancel();
  }
  function maxScroll() {
    const t = trackRef.current;
    const s = scrollRef.current;
    if (!t || !s) return 0;
    return Math.max(0, t.scrollHeight - s.clientHeight);
  }

  function play() {
    clearTimers();
    setTranslateY(0);
    const target = -maxScroll();
    if (reduce) {
      setTranslateY(target);
      return;
    }
    later(() => {
      tween(0, target, 5200, easeInOut, setTranslateY, () => {
        later(() => {
          tween(target, 0, 1100, easeInOut, setTranslateY, () => {
            later(play, 700);
          });
        }, 1500);
      });
    }, 500);
  }

  function stop() {
    clearTimers();
    setTranslateY(0);
  }

  usePlayInView({ ref: wrapRef, play, stop });

  return (
    <div
      ref={wrapRef}
      className="relative flex h-full flex-col bg-white"
      style={{ fontFamily: "Pretendard, sans-serif", color: COLORS.text, wordBreak: "keep-all" }}
    >
      <StatusBar />
      <div className="relative flex items-center justify-center" style={{ height: 50 }}>
        <span aria-hidden style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>‹</span>
        <span style={{ fontSize: 20, fontWeight: 700 }}>{title}</span>
      </div>

      {/* .dt-scroll — flex 1, border-top 1px #F0F0F0 */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-hidden"
        style={{ borderTop: `1px solid ${COLORS.divider}`, background: "#fff" }}
      >
        <div
          ref={trackRef}
          className="will-change-transform"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {/* .dt-hero — height 560, flex center */}
          <div
            className="relative flex items-center justify-center"
            style={{ height: 560, background: "#fff" }}
          >
            <Image
              src={hero.src}
              alt={hero.name}
              fill
              sizes="360px"
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
            {/* .dt-tag — left 16 top 16, bg coral, font 13-700 */}
            <span
              className="absolute inline-flex items-center"
              style={{
                left: 16,
                top: 16,
                gap: 6,
                background: COLORS.coral,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                padding: "7px 13px",
                borderRadius: 999,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              선택한 코디
            </span>
            {/* .dt-hint — bottom 14, animated bob */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: 0, right: 0, bottom: 14, gap: 4, color: COLORS.textGrey, fontSize: 13, fontWeight: 600 }}
            >
              <span>아래로 내려서 입은 옷 보기</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* .dt-sheet — bg #fff, radius 22 top, margin-top -22, padding 22 18 30 */}
          <div
            style={{
              background: "#fff",
              borderRadius: "22px 22px 0 0",
              marginTop: -22,
              position: "relative",
              boxShadow: "0 -10px 26px rgba(0,0,0,0.06)",
              padding: "22px 18px 30px",
            }}
          >
            <div style={{ width: 42, height: 5, borderRadius: 999, background: COLORS.grab, margin: "0 auto 18px" }} aria-hidden />
            <h3 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>{hero.name}</h3>
            <p style={{ marginTop: 7, fontSize: 14, fontWeight: 500, color: COLORS.textMute, lineHeight: 1.5 }}>
              하나의 마네킹이 일관되게 착장한 코디입니다.
            </p>

            <div
              className="flex items-center"
              style={{ margin: "22px 0 14px", gap: 8, fontSize: 16, fontWeight: 700, color: COLORS.text }}
            >
              사용된 옷 <span style={{ color: COLORS.coral }}>{items.length}</span>
            </div>

            {/* .dt-items — grid 1fr 1fr, gap 12 */}
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {items.map((it) => (
                <div
                  key={it.name}
                  className="overflow-hidden"
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 14,
                    background: "#fff",
                  }}
                >
                  <div className="relative" style={{ aspectRatio: "1 / 1", background: COLORS.thumbBg }}>
                    <Image
                      src={it.src}
                      alt={it.name}
                      fill
                      sizes="158px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div style={{ padding: "11px 13px 13px" }}>
                    {it.cat && (
                      <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.coral }}>{it.cat}</p>
                    )}
                    <p style={{ marginTop: 3, fontSize: 14, fontWeight: 600, color: COLORS.textSub }}>{it.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
