"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { usePlayInView } from "@/hooks/usePlayInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// 디자인 HTML .phones / .pcol / .phone.before / .phone.after / .cmp-* 정밀 매핑.
// 폰 내부 UI는 디자인 토큰 면제, HTML 정확값 직접 사용.
const COLORS = {
  ink: "#1A1410", // var(--ink)
  coral: "#E73349", // var(--coral)
  text: "#111",
  textMute: "#9A9A9A",
  textName: "#222",
  divider: "#F0F0F0",
  borderLite: "#E2E2E2",
  borderImg: "#EFEFEF",
  batt: "#E5484D",
  dotOff: "#e3cfc6",
} as const;

type Pair = {
  before: string;
  after: string;
  alt: string;
};

// 디자인 HTML 1383~1407 cmp-layer 4쌍 (img-07/06, img-02/04, img-01/03, img-08/05)
const PAIRS: ReadonlyArray<Pair> = [
  { before: "/app-mockup/img-07.webp", after: "/app-mockup/img-06.webp", alt: "가디건 코디" },
  { before: "/app-mockup/img-02.webp", after: "/app-mockup/img-04.webp", alt: "데님 코디" },
  { before: "/app-mockup/img-01.webp", after: "/app-mockup/img-03.webp", alt: "셔츠 스커트 코디" },
  { before: "/app-mockup/img-08.webp", after: "/app-mockup/img-05.webp", alt: "블레이저 코디" },
];

const INTERVAL_MS = 3000;

export default function ComparisonBCarousel() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduce = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  function play() {
    if (reduce) return;
    stop();
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % PAIRS.length);
    }, INTERVAL_MS);
  }
  function stop() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  usePlayInView({ ref: wrapRef, play, stop });

  return (
    <div ref={wrapRef}>
      {/* .phones — grid 1fr 1fr, gap 16, align-items end, margin-top 44 */}
      <div
        className="mx-auto max-w-xl"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "end",
          marginTop: 44,
        }}
        aria-label="같은 코디를 기존 앱과 AI Coordinate가 표현하는 방식 비교"
      >
        {/* 좌: .pcol > .phone.before + .pl */}
        <div className="flex flex-col">
          <BeforePhone activeIndex={activeIndex} />
          <p
            style={{
              textAlign: "center",
              marginTop: 16,
              fontSize: 13.5,
              fontWeight: 600,
              color: "#7A6E66" /* --gray = text-muted 동값. 폰 외부지만 정확값 직접 사용 */,
            }}
          >
            기존 코디 앱
          </p>
        </div>

        {/* 우: .pcol > .phone.after + .pl.hl */}
        <div className="flex flex-col">
          <AfterPhone activeIndex={activeIndex} />
          <p
            style={{
              textAlign: "center",
              marginTop: 16,
              fontSize: 13.5,
              fontWeight: 700,
              color: COLORS.coral,
            }}
          >
            AI Coordinate
          </p>
        </div>
      </div>

      {/* .dots — gap 7, margin-top 26, dot 7×7 → on width 22 + coral */}
      <div
        className="flex justify-center"
        style={{ gap: 7, marginTop: 26 }}
        aria-hidden
      >
        {PAIRS.map((_, i) => (
          <i
            key={i}
            style={{
              display: "block",
              width: i === activeIndex ? 22 : 7,
              height: 7,
              borderRadius: 999,
              background: i === activeIndex ? COLORS.coral : COLORS.dotOff,
              transition: "width .4s ease, background .4s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// Before phone (기존 코디 앱) — SNS풍 UI 크롬
// =========================================================================
function BeforePhone({ activeIndex }: { activeIndex: number }) {
  return (
    <div
      style={{
        // .phone.before — bg #1A1410, radius 30, padding 9
        background: COLORS.ink,
        borderRadius: 30,
        padding: 9,
        overflow: "hidden",
      }}
    >
      <div
        className="flex flex-col"
        style={{
          // .phone .screen — bg #fff, radius 22, aspect 9/17
          background: "#fff",
          borderRadius: 22,
          aspectRatio: "9 / 17",
          overflow: "hidden",
        }}
      >
        {/* .cb-profile — padding 7-8-5, gap 5 */}
        <div className="flex items-center" style={{ gap: 5, padding: "7px 8px 5px", flex: "0 0 auto" }}>
          {/* .cb-ava — 16×16, border 1px #E2E2E2 */}
          <span
            className="flex items-center justify-center"
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: `1px solid ${COLORS.borderLite}`,
              flex: "0 0 auto",
            }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </span>
          {/* .cb-name — font 9-700 #222, ellipsis */}
          <span
            style={{
              flex: 1,
              fontSize: 9,
              fontWeight: 700,
              color: COLORS.textName,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            15일 전
          </span>
          {/* .cb-dots */}
          <span style={{ flex: "0 0 auto" }} aria-hidden>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#999">
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
            </svg>
          </span>
        </div>

        {/* .cb-body — flex 1, border 1px #EFEFEF, radius 8, margin 0 6 */}
        <div
          className="relative"
          style={{
            flex: 1,
            minHeight: 0,
            border: `1px solid ${COLORS.borderImg}`,
            borderRadius: 8,
            margin: "0 6px",
            overflow: "hidden",
          }}
        >
          {PAIRS.map((p, i) => (
            <Image
              key={p.before}
              src={p.before}
              alt={`기존 코디 앱: ${p.alt}`}
              fill
              sizes="(min-width: 640px) 200px, 40vw"
              priority={i === 0}
              aria-hidden={i !== activeIndex}
              style={{
                objectFit: "contain",
                objectPosition: "center",
                opacity: i === activeIndex ? 1 : 0,
                transition: "opacity .6s ease",
              }}
            />
          ))}
        </div>

        {/* .cb-icons — gap 11, padding 7-9-4 */}
        <div className="flex items-center" style={{ gap: 11, padding: "7px 9px 4px", flex: "0 0 auto" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 20l1-3.9A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
          </svg>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20.4 7 16 5a4 4 0 0 1-8 0L3.6 7a2 2 0 0 0-1.3 2.2l.6 3.5a1 1 0 0 0 1 .8H6v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6h2.1a1 1 0 0 0 1-.8l.6-3.5A2 2 0 0 0 20.4 7z" />
          </svg>
        </div>

        {/* .cb-nav — border-top 1px #F0F0F0, padding 5-12-7, space-between */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "5px 12px 7px",
            borderTop: `1px solid ${COLORS.divider}`,
            flex: "0 0 auto",
          }}
        >
          {/* 홈 */}
          <span className="flex items-center justify-center" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l9-8 9 8" />
              <path d="M5 10v10h14V10" />
            </svg>
          </span>
          {/* 그리드 */}
          <span className="flex items-center justify-center" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 3v18" />
            </svg>
          </span>
          {/* + 버튼 (24×24 #111 원) */}
          <span
            className="flex items-center justify-center"
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#111",
            }}
            aria-hidden
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          {/* 알림/벨 */}
          <span className="flex items-center justify-center" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#222">
              <path d="M12 2a3 3 0 0 1 3 3c0 .6-.2 1.2-.5 1.7L18 8a2 2 0 0 1 1 1.7V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9.7A2 2 0 0 1 6 8l3.5-1.3A3 3 0 0 1 9 5a3 3 0 0 1 3-3z" />
            </svg>
          </span>
          {/* 프로필 */}
          <span className="flex items-center justify-center" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="m15 9-4 1.5L9.5 15 13.5 13.5z" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// After phone (AI Coordinate) — 앱 크롬
// =========================================================================
function AfterPhone({ activeIndex }: { activeIndex: number }) {
  return (
    <div
      style={{
        // .phone.after — bg coral, shadow 0 12px 26px rgba(231,51,73,0.28)
        background: COLORS.coral,
        borderRadius: 30,
        padding: 9,
        overflow: "hidden",
        boxShadow: "0 12px 26px rgba(231,51,73,0.28)",
      }}
    >
      <div
        className="flex flex-col"
        style={{
          background: "#fff",
          borderRadius: 22,
          aspectRatio: "9 / 17",
          overflow: "hidden",
        }}
      >
        {/* .cmp-cstatus — padding 7-11-3, font 10-700 #111 */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "7px 11px 3px", fontSize: 10, fontWeight: 700, color: COLORS.text, flex: "0 0 auto" }}
        >
          <span>9:41</span>
          <span className="inline-flex items-center" style={{ gap: 4 }}>
            <svg width="13" height="10" viewBox="0 0 17 13" fill="none" stroke="#222" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M1 8.5 8.5 2 16 8.5" />
              <path d="M4 11l4.5-4 4.5 4" />
            </svg>
            {/* .batt — bg #E5484D, font 8-700, pad 0 4, radius 5 */}
            <span
              style={{
                background: COLORS.batt,
                color: "#fff",
                fontSize: 8,
                fontWeight: 700,
                padding: "0 4px",
                borderRadius: 5,
              }}
            >
              15
            </span>
          </span>
        </div>

        {/* .cmp-cheader — height 28, border-bottom 1px #F0F0F0 */}
        <div
          className="relative flex items-center justify-center"
          style={{ height: 28, borderBottom: `1px solid ${COLORS.divider}`, flex: "0 0 auto" }}
        >
          <span
            aria-hidden
            style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: COLORS.text }}
          >
            <svg width="9" height="15" viewBox="0 0 13 22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 2 2 11l9 9" />
            </svg>
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>나의 코디</span>
        </div>

        {/* .cmp-cbody — flex 1, relative */}
        <div className="relative" style={{ flex: 1, minHeight: 0 }}>
          {/* .cmp-aitag — left 8 top 8, bg coral, font 10-700, pad 4-9 */}
          <span
            className="absolute inline-flex items-center"
            style={{
              left: 8,
              top: 8,
              gap: 4,
              background: COLORS.coral,
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "4px 9px",
              borderRadius: 999,
              zIndex: 3,
            }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
            선택한 코디
          </span>

          {/* cmp-layer 크로스페이드 4장 */}
          {PAIRS.map((p, i) => (
            <Image
              key={p.after}
              src={p.after}
              alt={`AI Coordinate: ${p.alt}`}
              fill
              sizes="(min-width: 640px) 200px, 40vw"
              priority={i === 0}
              aria-hidden={i !== activeIndex}
              style={{
                objectFit: "contain",
                objectPosition: "center",
                background: "#fff",
                opacity: i === activeIndex ? 1 : 0,
                transition: "opacity .6s ease",
              }}
            />
          ))}

          {/* .cmp-chint — bottom 8, font 9-600 #9A9A9A center */}
          <div
            className="absolute text-center"
            style={{
              left: 0,
              right: 0,
              bottom: 8,
              fontSize: 9,
              fontWeight: 600,
              color: COLORS.textMute,
              zIndex: 3,
            }}
          >
            아래로 내려서 입은 옷 보기
          </div>
        </div>
      </div>
    </div>
  );
}
