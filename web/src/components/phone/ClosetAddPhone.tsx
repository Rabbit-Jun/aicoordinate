"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { StatusBar } from "./StatusBar";
import { usePlayInView } from "@/hooks/usePlayInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// 디자인 HTML closet-add-phone 정밀 매핑 + initClosetAdd 동작 재현.
// 시퀀스:
//   1500ms 대기 → cl-add 펄스(450ms) → add-screen 슬라이드업
//   → 4200ms 유지 → 슬라이드다운 → 1100ms 대기 → loop

const COLORS = {
  text: "#111",
  textTab: "#BDBDBD",
  textMute: "#9A9A9A",
  divider: "#EEE",
  pillBorder: "#E6E6E6",
  cardBg: "#F4F2EF",
  // .add-screen / .as-*
  asCardBorder: "#E6E6E6",
  asCardDark: "#1A1A1A",
  asSearchBg: "#EFEFF1",
} as const;

type Card = { name: string; src: string };

type Props = {
  title: string;
  tabs: ReadonlyArray<string>;
  // 첫 set 4장 (정적 표시 — closet-add는 카테고리 순환 X)
  cards: ReadonlyArray<Card>;
  addButton: { background: string; color: string };
};

// 옵션 카드 데이터 (디자인 HTML 1302~1322 원문)
const ADD_OPTIONS = [
  { label: "앨범", dark: true, icon: "image" },
  { label: "카메라", dark: false, icon: "camera" },
  { label: "WEB 검색", dark: false, icon: "link" },
  { label: "쇼핑몰 주문내역", dark: false, icon: "cart" },
] as const;

export function ClosetAddPhone({ title, tabs, cards, addButton }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = usePrefersReducedMotion();
  const [pulsing, setPulsing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  function later(fn: () => void, ms: number) {
    timersRef.current.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }
  function reset() {
    setPulsing(false);
    setShowAdd(false);
  }

  function play() {
    clearTimers();
    reset();
    if (reduce) {
      setShowAdd(true);
      return;
    }
    // 디자인 HTML initClosetAdd 시퀀스 그대로
    later(() => {
      setPulsing(true);
      later(() => {
        setPulsing(false);
        setShowAdd(true);
      }, 430);
      later(() => {
        setShowAdd(false);
        later(play, 1100);
      }, 4200);
    }, 1500);
  }

  function stop() {
    clearTimers();
    reset();
  }

  usePlayInView({ ref: wrapRef, play, stop });

  return (
    <div
      ref={wrapRef}
      className="relative flex h-full flex-col bg-white"
      style={{ fontFamily: "Pretendard, sans-serif", color: COLORS.text, wordBreak: "keep-all" }}
    >
      <StatusBar />

      {/* .co-header */}
      <div className="relative flex items-center justify-center" style={{ height: 50 }}>
        <span aria-hidden style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>‹</span>
        <span style={{ fontSize: 20, fontWeight: 700 }}>{title}</span>
      </div>

      {/* .cl-filters (cl-add 포함 — pulsing 시 addPulse animation) */}
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
        {/* .cl-add — 펄스 트리거 (animation: add-pulse 0.55s) */}
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
            animation: pulsing ? "add-pulse 0.55s ease" : undefined,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </div>

      {/* .cl-tabs */}
      <div
        className="flex items-start justify-between"
        style={{ padding: "0 16px", borderBottom: `1px solid ${COLORS.divider}` }}
      >
        {tabs.map((t, i) => (
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

      {/* .cat-grid (정적 첫 set) */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            padding: "16px 16px 24px",
          }}
        >
          {cards.slice(0, 4).map((c) => (
            <div
              key={c.name}
              className="overflow-hidden"
              style={{
                borderRadius: 14,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div className="relative" style={{ aspectRatio: "158 / 196", background: "#fff" }}>
                <Image
                  src={c.src}
                  alt={c.name}
                  fill
                  sizes="158px"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <span
                className="block"
                style={{
                  padding: "9px 11px 11px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#333",
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

        {/* .add-screen — top 42, translateY 102%→0, transition .44s cubic-bezier */}
        <div
          aria-hidden={!showAdd}
          className="absolute flex flex-col"
          style={{
            left: 0,
            right: 0,
            top: 42,
            bottom: 0,
            background: "#fff",
            padding: "14px 18px 20px",
            overflow: "hidden",
            transform: showAdd ? "translateY(0)" : "translateY(102%)",
            transition: "transform .44s cubic-bezier(.22,.9,.3,1)",
            textAlign: "left",
            zIndex: 7,
          }}
        >
          {/* .as-top */}
          <div className="flex items-center" style={{ gap: 12 }}>
            <span aria-hidden style={{ color: "#111", flex: "0 0 auto" }}>
              <svg width="12" height="20" viewBox="0 0 13 22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 2 2 11l9 9" />
              </svg>
            </span>
            <span style={{ flex: 1, fontSize: 19, fontWeight: 700, color: "#111" }}>옷 추가</span>
            <span aria-hidden style={{ color: "#444", flex: "0 0 auto" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </span>
          </div>

          {/* .as-h */}
          <div style={{ margin: "22px 0 14px", fontSize: 22, fontWeight: 800, color: "#111" }}>
            옷장에 옷 추가하기
          </div>

          {/* .as-grid.as-grid-fill */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: 12,
              flex: 1,
              minHeight: 0,
              paddingBottom: 4,
            }}
          >
            {ADD_OPTIONS.map((opt) => (
              <div
                key={opt.label}
                className="flex flex-col justify-center"
                style={{
                  borderRadius: 14,
                  border: `1px solid ${opt.dark ? COLORS.asCardDark : COLORS.asCardBorder}`,
                  background: opt.dark ? COLORS.asCardDark : "transparent",
                  color: opt.dark ? "#fff" : "#111",
                  padding: "0 20px",
                  gap: 12,
                }}
              >
                <AddCardIcon icon={opt.icon} />
                <span style={{ fontSize: 18, fontWeight: 700 }}>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCardIcon({ icon }: { icon: "image" | "camera" | "link" | "cart" }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (icon) {
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.5-3.5L9 20" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      );
  }
}
