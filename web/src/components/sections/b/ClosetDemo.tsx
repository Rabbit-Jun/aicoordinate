"use client";

import { ClosetPhone } from "@/components/phone/ClosetPhone";
import { CategoryPhone } from "@/components/phone/CategoryPhone";
import { ClosetAddPhone } from "@/components/phone/ClosetAddPhone";
import { PhoneFrame } from "@/components/phone/PhoneFrame";
import type { CoordiCard } from "@/components/phone/CoordiPhone";
import { track } from "@/lib/analytics";
import { useEmailModal } from "@/components/AppShell";

// 디자인 HTML closet-phone .co-track 옷장 24장 (line 1039~1063 원문).
const CLOSET_CARDS: ReadonlyArray<CoordiCard> = [
  { name: "베이지 긴팔 티", src: "/app-mockup/img-24.webp" },
  { name: "블루 셔츠", src: "/app-mockup/img-38.webp" },
  { name: "스트라이프 긴팔", src: "/app-mockup/img-42.webp" },
  { name: "베이지 반팔 티", src: "/app-mockup/img-25.webp" },
  { name: "블루 반팔 셔츠", src: "/app-mockup/img-37.webp" },
  { name: "스트라이프 반팔", src: "/app-mockup/img-43.webp" },
  { name: "베이지 와이드 팬츠", src: "/app-mockup/img-28.webp" },
  { name: "블루 와이드 데님", src: "/app-mockup/img-39.webp" },
  { name: "블랙 와이드 팬츠", src: "/app-mockup/img-35.webp" },
  { name: "베이지 숏팬츠", src: "/app-mockup/img-26.webp" },
  { name: "아이보리 데님 숏", src: "/app-mockup/img-46.webp" },
  { name: "블랙 숏팬츠", src: "/app-mockup/img-33.webp" },
  { name: "숏 자켓", src: "/app-mockup/img-41.webp" },
  { name: "트렌치 코트", src: "/app-mockup/img-52.webp" },
  { name: "린넨 블레이저", src: "/app-mockup/img-22.webp" },
  { name: "베이지 A라인 스커트", src: "/app-mockup/img-23.webp" },
  { name: "블랙 플리츠 스커트", src: "/app-mockup/img-36.webp" },
  { name: "베이지 펜슬 스커트", src: "/app-mockup/img-29.webp" },
  { name: "페니 로퍼", src: "/app-mockup/img-55.webp" },
  { name: "더비 슈즈", src: "/app-mockup/img-20.webp" },
  { name: "첼시 부츠", src: "/app-mockup/img-49.webp" },
  { name: "브라운 벨트", src: "/app-mockup/img-31.webp" },
  { name: "다크브라운 벨트", src: "/app-mockup/img-19.webp" },
  { name: "블랙 벨트", src: "/app-mockup/img-32.webp" },
];

// 디자인 HTML initClosetCat (line 1796~1801): 5 카테고리 sets — 자산 키 → img-NN 매핑
const CLOSET_CAT_SETS = [
  // 전체
  [
    { name: "베이지 긴팔 티", src: "/app-mockup/img-24.webp" },
    { name: "베이지 와이드 팬츠", src: "/app-mockup/img-28.webp" },
    { name: "숏 자켓", src: "/app-mockup/img-41.webp" },
    { name: "페니 로퍼", src: "/app-mockup/img-55.webp" },
  ],
  // 상의
  [
    { name: "베이지 긴팔 티", src: "/app-mockup/img-24.webp" },
    { name: "블루 셔츠", src: "/app-mockup/img-38.webp" },
    { name: "베이지 반팔 티", src: "/app-mockup/img-25.webp" },
    { name: "스트라이프 반팔", src: "/app-mockup/img-43.webp" },
  ],
  // 하의
  [
    { name: "베이지 와이드 팬츠", src: "/app-mockup/img-28.webp" },
    { name: "블루 와이드 데님", src: "/app-mockup/img-39.webp" },
    { name: "베이지 숏팬츠", src: "/app-mockup/img-26.webp" },
    { name: "베이지 A라인 스커트", src: "/app-mockup/img-23.webp" },
  ],
  // 아우터 (HTML 3장)
  [
    { name: "숏 자켓", src: "/app-mockup/img-41.webp" },
    { name: "트렌치 코트", src: "/app-mockup/img-52.webp" },
    { name: "린넨 블레이저", src: "/app-mockup/img-22.webp" },
  ],
  // 신발·벨트
  [
    { name: "페니 로퍼", src: "/app-mockup/img-55.webp" },
    { name: "더비 슈즈", src: "/app-mockup/img-20.webp" },
    { name: "브라운 벨트", src: "/app-mockup/img-31.webp" },
    { name: "블랙 벨트", src: "/app-mockup/img-32.webp" },
  ],
] as const;

// closet-add-phone 정적 4장 (initClosetCat 첫 set 동일)
const ADD_CARDS = CLOSET_CAT_SETS[0];

const CLOSET_TABS = ["전체", "상의", "하의", "아우터", "신발·벨트"] as const;

// 옷장 cl-add inline override (HTML 마크업 원문값)
const CLOSET_ADD = { background: "#FFFFFF", color: "#181717" };

export default function ClosetDemo() {
  return (
    <section
      style={{
        background: "var(--gallery-closet-grad)",
        padding: "44px 0 40px",
        textAlign: "center",
      }}
    >
      <ClosetPillButton />

      <DemoCaption num="1" body="내 옷을 카테고리별로" highlight="한눈에" />
      <PhoneFrame>
        <ClosetPhone cards={CLOSET_CARDS} heroName="트렌치 코트" />
      </PhoneFrame>

      <DemoCaption num="2" body="카테고리별로 모아서" highlight="한눈에" marginTop={32} />
      <PhoneFrame>
        <CategoryPhone
          title="나의 옷장"
          sets={CLOSET_CAT_SETS}
          tabs={CLOSET_TABS}
          addButton={CLOSET_ADD}
          stepIntervalMs={1800}
        />
      </PhoneFrame>

      <DemoCaption num="3" body="새 옷도 간편하게" highlight="추가" marginTop={32} />
      <PhoneFrame>
        <ClosetAddPhone
          title="나의 옷장"
          tabs={CLOSET_TABS}
          cards={ADD_CARDS}
          addButton={CLOSET_ADD}
        />
      </PhoneFrame>
    </section>
  );
}

function ClosetPillButton() {
  const { openModal } = useEmailModal();

  function handleClick() {
    track({ name: "plan_selected", props: { plan: "free", entry: "closet_demo" } });
    openModal("closet_demo");
  }

  return (
    <div style={{ paddingTop: 4 }}>
      <button
        type="button"
        data-track="plan_selected"
        onClick={handleClick}
        className="inline-flex items-center"
        style={{
          background: "#7C5CC4",
          color: "#fff",
          gap: 7,
          fontSize: 14.5,
          fontWeight: 700,
          padding: "11px 20px",
          borderRadius: 999,
          boxShadow: "0 8px 20px rgba(124,92,196,0.30)",
          border: "none",
          cursor: "pointer",
        }}
      >
        내 옷장 한눈에 보기
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

function DemoCaption({
  num,
  body,
  highlight,
  marginTop = 22,
}: {
  num: string;
  body: string;
  highlight: string;
  marginTop?: number;
}) {
  return (
    <p
      style={{
        color: "#BDBDBD",
        fontSize: 15,
        fontWeight: 600,
        margin: "14px auto 0",
        maxWidth: 280,
        lineHeight: 1.5,
        paddingTop: marginTop > 22 ? marginTop - 22 : 0,
      }}
    >
      {num}. {body} <span style={{ color: "#E73349" }}>{highlight}</span>
    </p>
  );
}
