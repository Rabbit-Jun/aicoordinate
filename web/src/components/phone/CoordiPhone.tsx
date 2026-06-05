"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { StatusBar } from "./StatusBar";
import { usePlayInView } from "@/hooks/usePlayInView";
import { useTween, easeInOut } from "@/hooks/useTween";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type CoordiCard = {
  name: string;
  src: string;
};

// 디자인 HTML .co-* / .cl-* / .cat-* (자연 360×680 캔버스) 정확한 hex.
// 폰 내부 UI는 앱 화면 묘사라 디자인 토큰 강제 X (단, 코랄은 토큰과 동값).
const COLORS = {
  text: "#111",
  textSub: "#333",
  textMute: "#8A8A8A",
  textTab: "#BDBDBD",
  divider: "#EEE",
  pillBorder: "#E6E6E6",
  cardBg: "#F4F2EF",
  checkBorder: "#D5D5D5",
  picked: "#9A9A9A",
  pickedBg: "rgba(255,255,255,0.86)",
  coral: "#E73349", // 디자인 HTML --coral
  successGreen: "#1F8A5B", // .co-select.press 누른 상태
} as const;

// FIXES.md #3, #4 — 코디 데모 기본 탭. 옷장에서는 tabs prop으로 override.
const DEFAULT_TABS: ReadonlyArray<string> = [
  "전체",
  "캐주얼",
  "포멀",
  "클래식",
  "빈티지",
];

type Props = {
  title: string;
  cards: ReadonlyArray<CoordiCard>;
  heroIndex?: number;
  // 옷장용 props (단계: 정밀 교정 패스 2)
  tabs?: ReadonlyArray<string>;
  pickedLabel?: string;
  addButton?: { background: string; color: string };
  zoomCaption?: string;
};

export function CoordiPhone({
  title,
  cards,
  heroIndex,
  tabs,
  pickedLabel = "선택한 코디",
  addButton,
  zoomCaption,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = usePrefersReducedMotion();
  const { tween, cancel } = useTween();

  const [translateY, setTranslateY] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [pressed, setPressed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [showBar, setShowBar] = useState(false);

  function later(fn: () => void, ms: number) {
    timersRef.current.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    cancel();
  }
  function reset() {
    setSelectedIdx(null);
    setShowBar(false);
    setZoomed(false);
    setPressed(false);
    setTranslateY(0);
  }
  function pickIndex() {
    return typeof heroIndex === "number" ? heroIndex : cards.length - 1;
  }
  function viewportH() {
    return scrollRef.current?.clientHeight ?? 0;
  }

  function play() {
    clearTimers();
    reset();
    const idx = pickIndex();
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[idx] as HTMLElement | undefined;
    if (!target) return;
    const desired = Math.max(
      -(track.scrollHeight - viewportH()),
      Math.min(0, viewportH() / 2 - (target.offsetTop + target.offsetHeight / 2)),
    );

    if (reduce) {
      setTranslateY(desired);
      setSelectedIdx(idx);
      setShowBar(true);
      return;
    }

    tween(0, desired, 4200, easeInOut, setTranslateY, () => {
      later(() => {
        setSelectedIdx(idx);
        setShowBar(true);
        later(() => {
          setPressed(true);
          later(() => {
            setZoomed(true);
            later(() => {
              setZoomed(false);
              later(play, 820);
            }, 2600);
          }, 650);
        }, 1000);
      }, 450);
    });
  }

  function stop() {
    clearTimers();
    reset();
  }

  usePlayInView({ ref: wrapRef, play, stop });

  const effectiveTabs = tabs ?? DEFAULT_TABS;
  const heroName = selectedIdx !== null ? cards[selectedIdx]?.name : "";
  const heroSrc = selectedIdx !== null ? cards[selectedIdx]?.src : null;

  return (
    <div
      ref={wrapRef}
      className="relative flex h-full flex-col bg-white"
      style={{ fontFamily: "Pretendard, sans-serif", color: COLORS.text, wordBreak: "keep-all" }}
    >
      <StatusBar />

      {/* .co-header — height 50, title 20-700 */}
      <div className="relative flex items-center justify-center" style={{ height: 50 }}>
        <span
          aria-hidden
          style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}
        >
          ‹
        </span>
        <span style={{ fontSize: 20, fontWeight: 700 }}>{title}</span>
      </div>

      {/* .cl-filters — gap 10, padding 6 16 14 */}
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
        {[`모든 옷`, `등록일순`].map((t) => (
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
        {/* .cl-add — 옷장 폰에서만 렌더 (디자인 HTML inline override bg #FFFFFF / icon #181717) */}
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

      {/* .cl-tabs — padding 0 16, border-bottom 1px #EEE */}
      <div
        className="flex items-start justify-between"
        style={{ padding: "0 16px", borderBottom: `1px solid ${COLORS.divider}` }}
      >
        {effectiveTabs.map((t, i) => (
          <span
            key={t}
            className="relative"
            style={{
              padding: "6px 2px 14px",
              fontSize: 17,
              fontWeight: 700,
              color: i === 0 ? COLORS.text : COLORS.textTab,
            }}
          >
            {t}
            {i === 0 && (
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
                }}
              />
            )}
          </span>
        ))}
      </div>

      {/* .co-scroll — flex 1 + overflow hidden */}
      <div ref={scrollRef} className="relative flex-1 overflow-hidden">
        {/* .co-track — grid 1fr 1fr, gap 12, padding 14 16 24 */}
        <div
          ref={trackRef}
          className="grid will-change-transform"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            padding: "14px 16px 24px",
            transform: `translateY(${translateY}px)`,
          }}
        >
          {cards.map((c, i) => {
            const isSel = selectedIdx === i;
            return (
              <div
                key={c.name + i}
                className="relative overflow-hidden"
                style={{
                  borderRadius: 14,
                  border: `2px solid ${isSel ? COLORS.coral : "transparent"}`,
                  background: COLORS.cardBg,
                  boxShadow: isSel ? "0 8px 20px rgba(231,51,73,0.20)" : undefined,
                  transition: "border-color .18s ease, box-shadow .18s ease",
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
                    fontWeight: isSel ? 700 : 600,
                    color: isSel ? COLORS.coral : COLORS.textSub,
                    background: "#fff",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.name}
                </span>
                {/* .co-check — top 9 right 9, 26×26, radius 50% */}
                <span
                  aria-hidden
                  className="absolute flex items-center justify-center"
                  style={{
                    top: 9,
                    right: 9,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: isSel ? COLORS.coral : COLORS.pickedBg,
                    border: `1.5px solid ${isSel ? COLORS.coral : COLORS.checkBorder}`,
                    color: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                    transform: isSel ? "scale(1.08)" : undefined,
                    transition: "background .16s ease, border-color .16s ease, transform .16s ease",
                  }}
                >
                  {isSel && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* .co-fade — bottom 40px gradient */}
        <div
          aria-hidden
          className="pointer-events-none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 40,
            background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 100%)",
          }}
        />
      </div>

      {/* .co-bar — padding 14 16 18, transform translateY 118% → 0 */}
      <div
        className="absolute flex items-center"
        style={{
          left: 0,
          right: 0,
          bottom: 0,
          gap: 12,
          padding: "14px 16px 18px",
          background: "#fff",
          borderTop: `1px solid ${COLORS.divider}`,
          boxShadow: "0 -8px 22px rgba(0,0,0,0.07)",
          transform: showBar ? "translateY(0)" : "translateY(118%)",
          transition: "transform .34s cubic-bezier(.22,.9,.3,1)",
          zIndex: 5,
        }}
      >
        <div className="flex flex-col" style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.picked }}>{pickedLabel}</span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {heroName || "—"}
          </span>
        </div>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          style={{
            flex: "0 0 auto",
            height: 50,
            padding: "0 30px",
            border: "none",
            borderRadius: 12,
            background: pressed ? COLORS.successGreen : COLORS.coral,
            color: "#fff",
            fontSize: 17,
            fontWeight: 700,
            boxShadow: pressed
              ? "0 8px 18px rgba(31,138,91,0.30)"
              : "0 8px 18px rgba(231,51,73,0.30)",
            transform: pressed ? "translateY(1px) scale(0.97)" : undefined,
            transition: "transform .12s ease, background .2s ease, box-shadow .2s ease",
          }}
        >
          {pressed ? "선택 완료 ✓" : "선택"}
        </button>
      </div>

      {/* .co-zoom — top 85, bottom 0, opacity transition */}
      <div
        aria-hidden={!zoomed}
        className="absolute"
        style={{
          left: 0,
          right: 0,
          top: 85,
          bottom: 0,
          background: "#fff",
          opacity: zoomed ? 1 : 0,
          pointerEvents: zoomed ? "auto" : "none",
          transition: "opacity .42s ease",
          zIndex: 6,
        }}
      >
        {heroSrc && (
          <div className="relative h-full">
            <Image
              src={heroSrc}
              alt={heroName}
              fill
              sizes="232px"
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
              {zoomCaption ?? "선택한 코디"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
