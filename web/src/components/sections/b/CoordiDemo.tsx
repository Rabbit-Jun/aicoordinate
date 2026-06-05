"use client";

import { CoordiPhone, type CoordiCard } from "@/components/phone/CoordiPhone";
import { DetailPhone } from "@/components/phone/DetailPhone";
import { CategoryPhone } from "@/components/phone/CategoryPhone";
import { PhoneFrame } from "@/components/phone/PhoneFrame";
import { track } from "@/lib/analytics";
import { useEmailModal } from "@/components/AppShell";

// 디자인 HTML 1040~1051: 코디 카드 12종
const CODI_CARDS: ReadonlyArray<CoordiCard> = [
  { name: "셔츠 · 와이드 팬츠", src: "/app-mockup/img-40.webp" },
  { name: "폴로 니트 · 데님", src: "/app-mockup/img-56.webp" },
  { name: "자켓 · 롱스커트", src: "/app-mockup/img-48.webp" },
  { name: "니트 · 슬랙스", src: "/app-mockup/img-18.webp" },
  { name: "트위드 자켓 · 데님", src: "/app-mockup/img-53.webp" },
  { name: "스트라이프 티 · 블랙 데님", src: "/app-mockup/img-45.webp" },
  { name: "스트라이프 셔츠 · 브라운 팬츠", src: "/app-mockup/img-44.webp" },
  { name: "데님 셔츠 · 화이트 팬츠", src: "/app-mockup/img-21.webp" },
  { name: "케이블 니트 · 슬랙스", src: "/app-mockup/img-51.webp" },
  { name: "네이비 코트 · 그레이 팬츠", src: "/app-mockup/img-17.webp" },
  { name: "베이지 수트", src: "/app-mockup/img-27.webp" },
  { name: "블랙 수트", src: "/app-mockup/img-34.webp" },
];

const DETAIL_ITEMS = [
  { name: "케이블 니트", src: "/app-mockup/img-50.webp", cat: "상의" },
  { name: "와이드 슬랙스", src: "/app-mockup/img-47.webp", cat: "하의" },
  { name: "페니 로퍼", src: "/app-mockup/img-55.webp", cat: "신발" },
  { name: "브라운 벨트", src: "/app-mockup/img-31.webp", cat: "잡화" },
];

// 카테고리 폰 (코디 #3): 디자인 HTML cat-grid 4장 (전체 set만 명시). 나머지 set 4종은 의미 보존 위해 가상 매핑.
const CATEGORY_SETS: ReadonlyArray<ReadonlyArray<{ name: string; src: string }>> = [
  // 전체
  [
    { name: "셔츠 · 와이드 팬츠", src: "/app-mockup/img-40.webp" },
    { name: "스트라이프 셔츠 · 브라운 팬츠", src: "/app-mockup/img-44.webp" },
    { name: "케이블 니트 · 슬랙스", src: "/app-mockup/img-51.webp" },
    { name: "블랙 수트", src: "/app-mockup/img-34.webp" },
  ],
  // 캐주얼
  [
    { name: "폴로 니트 · 데님", src: "/app-mockup/img-56.webp" },
    { name: "스트라이프 티 · 블랙 데님", src: "/app-mockup/img-45.webp" },
    { name: "데님 셔츠 · 화이트 팬츠", src: "/app-mockup/img-21.webp" },
    { name: "니트 · 슬랙스", src: "/app-mockup/img-18.webp" },
  ],
  // 포멀
  [
    { name: "베이지 수트", src: "/app-mockup/img-27.webp" },
    { name: "블랙 수트", src: "/app-mockup/img-34.webp" },
    { name: "케이블 니트 · 슬랙스", src: "/app-mockup/img-51.webp" },
    { name: "셔츠 · 와이드 팬츠", src: "/app-mockup/img-40.webp" },
  ],
  // 클래식
  [
    { name: "네이비 코트 · 그레이 팬츠", src: "/app-mockup/img-17.webp" },
    { name: "트위드 자켓 · 데님", src: "/app-mockup/img-53.webp" },
    { name: "자켓 · 롱스커트", src: "/app-mockup/img-48.webp" },
    { name: "스트라이프 셔츠 · 브라운 팬츠", src: "/app-mockup/img-44.webp" },
  ],
  // 빈티지
  [
    { name: "트위드 자켓 · 데님", src: "/app-mockup/img-53.webp" },
    { name: "스트라이프 티 · 블랙 데님", src: "/app-mockup/img-45.webp" },
    { name: "네이비 코트 · 그레이 팬츠", src: "/app-mockup/img-17.webp" },
    { name: "데님 셔츠 · 화이트 팬츠", src: "/app-mockup/img-21.webp" },
  ],
];

export default function CoordiDemo() {
  return (
    <section
      style={{
        // 디자인 HTML .hero-gallery-wrap — gradient + padding 0 0 36px + text-center
        background: "var(--gallery-coordi-grad)",
        padding: "4px 0 36px",
        textAlign: "center",
      }}
    >
      {/* 상단 pill — 디자인 HTML .pill-badge.pill-btn (기본 coral) */}
      <CoordiPillButton />

      <DemoCaption num="1" body="당신의 비서가 만들어준 코디를" highlight="한눈에" />
      <PhoneFrame>
        <CoordiPhone title="나의 코디" cards={CODI_CARDS} />
      </PhoneFrame>

      <DemoCaption
        num="2"
        body="어떤 옷들을 사용했는지"
        highlight="한눈에"
        marginTop={32}
      />
      <PhoneFrame>
        <DetailPhone
          title="나의 코디"
          hero={{ name: "케이블 니트 · 슬랙스", src: "/app-mockup/img-51.webp" }}
          items={DETAIL_ITEMS}
        />
      </PhoneFrame>

      <DemoCaption
        num="3"
        body="캐주얼, 포멀, 클래식, 빈티지를"
        highlight="한눈에"
        marginTop={32}
      />
      <PhoneFrame>
        <CategoryPhone title="나의 코디" sets={CATEGORY_SETS} />
      </PhoneFrame>
    </section>
  );
}

// .pill-badge (14.5-700, padding 11-20, radius 999, gap 7, bg coral, shadow rgba(231,51,73,0.28))
function CoordiPillButton() {
  const { openModal } = useEmailModal();

  function handleClick() {
    track({ name: "plan_selected", props: { plan: "free", entry: "coordi_demo" } });
    openModal("coordi_demo");
  }

  return (
    <div style={{ paddingTop: 4 }}>
      <button
        type="button"
        data-track="plan_selected"
        onClick={handleClick}
        className="inline-flex items-center"
        style={{
          background: "var(--accent)" /* #E73349 — 폰 외부지만 토큰 동값 */,
          color: "#fff",
          gap: 7,
          fontSize: 14.5,
          fontWeight: 700,
          padding: "11px 20px",
          borderRadius: 999,
          boxShadow: "0 8px 20px rgba(231,51,73,0.28)",
          border: "none",
          cursor: "pointer",
        }}
      >
        옷장 속 옷들로 새롭게 코디하기
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
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
