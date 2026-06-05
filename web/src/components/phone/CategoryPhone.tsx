"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { StatusBar } from "./StatusBar";
import { usePlayInView } from "@/hooks/usePlayInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// 디자인 HTML .cat-* / .cl-tabs 정확값.
const COLORS = {
  text: "#111",
  textSub: "#333",
  textTab: "#BDBDBD",
  divider: "#EEE",
  pillBorder: "#E6E6E6",
  cardBg: "#F4F2EF",
  coral: "#E73349",
} as const;

// 기본 탭 (코디 데모). 옷장 데모는 tabs prop으로 override.
const DEFAULT_TABS = ["전체", "캐주얼", "포멀", "클래식", "빈티지"];

type Card = { name: string; src: string };

type Props = {
  title: string;
  sets: ReadonlyArray<ReadonlyArray<Card>>;
  // 옷장 데모용 (단계: 2차 정밀 교정 패스 — 동작 복원)
  tabs?: ReadonlyArray<string>;
  addButton?: { background: string; color: string };
  // 디자인 HTML: 코디 1400, 옷장 1800
  stepIntervalMs?: number;
};

export function CategoryPhone({
  title,
  sets,
  tabs,
  addButton,
  stepIntervalMs = 1400,
}: Props) {
  const effectiveTabs = tabs ?? DEFAULT_TABS;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = usePrefersReducedMotion();
  const [tabIdx, setTabIdx] = useState(0);
  const [fade, setFade] = useState<"in" | "out">("in");

  function later(fn: () => void, ms: number) {
    timersRef.current.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function play() {
    clearTimers();
    setTabIdx(0);
    setFade("in");
    if (reduce) return;

    function step(i: number) {
      setFade("out");
      later(() => {
        const next = (i + 1) % effectiveTabs.length;
        setTabIdx(next);
        setFade("in");
        later(() => step(next), stepIntervalMs);
      }, 380);
    }
    later(() => step(0), stepIntervalMs);
  }

  function stop() {
    clearTimers();
    setTabIdx(0);
    setFade("in");
  }

  usePlayInView({ ref: wrapRef, play, stop });

  const current = sets[tabIdx] ?? [];

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

      {/* 필터 라인 — 디자인 HTML category-phone .cl-filters: 아이콘 pill + 모든 옷 + 등록일순 */}
      <div className="flex" style={{ gap: 10, padding: "6px 16px 14px" }}>
        <span
          className="inline-flex items-center justify-center"
          style={{
            border: `1px solid ${COLORS.pillBorder}`,
            borderRadius: 14,
            padding: "9px 11px",
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="8" cy="6" r="2" />
            <line x1="11" y1="6" x2="21" y2="6" />
            <line x1="3" y1="6" x2="6" y2="6" />
            <circle cx="16" cy="12" r="2" />
            <line x1="3" y1="12" x2="14" y2="12" />
            <line x1="18" y1="12" x2="21" y2="12" />
            <circle cx="9" cy="18" r="2" />
            <line x1="12" y1="18" x2="21" y2="18" />
            <line x1="3" y1="18" x2="7" y2="18" />
          </svg>
        </span>
        {["모든 옷", "등록일순"].map((t) => (
          <span
            key={t}
            className="inline-flex items-center"
            style={{
              border: `1px solid ${COLORS.pillBorder}`,
              borderRadius: 14,
              padding: "9px 15px",
              fontSize: 14.5,
              fontWeight: 600,
              color: "#222",
              background: "#fff",
              gap: 6,
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              whiteSpace: "nowrap",
            }}
          >
            {t}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        ))}
        {/* .cl-add — 옷장 데모(폰 2)에서만 렌더. inline override bg #FFFFFF / icon #181717 */}
        {addButton && (
          <span
            aria-hidden
            className="inline-flex items-center justify-center"
            style={{
              marginLeft: "auto",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: addButton.background,
              color: addButton.color,
              flex: "0 0 auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
        )}
      </div>

      <div
        className="flex items-start justify-between"
        style={{ padding: "0 16px", borderBottom: `1px solid ${COLORS.divider}` }}
      >
        {effectiveTabs.map((t, i) => {
          const on = i === tabIdx;
          return (
            <span
              key={t}
              className="relative"
              style={{
                padding: "6px 2px 14px",
                fontSize: 17,
                fontWeight: 700,
                color: on ? COLORS.text : COLORS.textTab,
                transition: "color .3s ease",
              }}
            >
              {t}
              {on && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -1,
                    height: 2.5,
                    background: COLORS.text,
                    borderRadius: 2,
                    transition: "opacity .3s ease",
                  }}
                />
              )}
            </span>
          );
        })}
      </div>

      {/* .cat-grid — grid 1fr 1fr, gap 12, padding 16 16 24, transition opacity .38s */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            padding: "16px 16px 24px",
            transition: "opacity .38s ease",
            opacity: fade === "out" ? 0 : 1,
          }}
        >
          {current.slice(0, 4).map((c) => (
            <div
              key={c.name}
              className="overflow-hidden"
              style={{
                borderRadius: 14,
                background: COLORS.cardBg,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div className="relative" style={{ aspectRatio: "158 / 196", background: COLORS.cardBg }}>
                <Image
                  src={c.src}
                  alt={c.name}
                  fill
                  sizes="158px"
                  style={{ objectFit: "cover", objectPosition: "center 12%" }}
                />
              </div>
              <span
                className="block"
                style={{
                  padding: "9px 11px 11px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.textSub,
                  background: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
