import Image from "next/image";
import type { ReactNode } from "react";
import { HeroStartButton } from "./HeroStartButton";

type Cody = { src: string; alt: string };

const HERO_VISUALS: readonly Cody[] = [
  {
    src: "/mockup/cody-shirt-cargo.jpg",
    alt: "하늘색 오버핏 셔츠와 화이트 나시, 와이드 카고 데님으로 코디한 마네킹",
  },
  {
    src: "/mockup/cody-stripe-knit.jpg",
    alt: "스트라이프 반집업 니트와 와이드 카고 데님으로 코디한 마네킹",
  },
  {
    src: "/mockup/cody-padding-wide.jpg",
    alt: "차콜 퀼팅 패딩과 화이트 티, 그레이 와이드 스웨트로 코디한 마네킹",
  },
  {
    src: "/mockup/cody-hood-cargo.jpg",
    alt: "네이비 후드집업과 화이트 티, 와이드 카고 데님으로 코디한 마네킹",
  },
];

// 데스크탑에서 4장에 미세 stagger(top offset + 회전)로 옷걸이 줄 느낌.
// Tailwind JIT가 정적 분석으로 잡도록 string literal로 보관.
const RACK_STAGGER = [
  "mt-1 rotate-[-1.5deg]",
  "mt-5 rotate-[1deg]",
  "mt-0 rotate-[-1deg]",
  "mt-3 rotate-[1.5deg]",
] as const;

const HERO_STATS = [
  { value: "5가지", label: "매월 받는 코디 추천" },
  { value: "0원", label: "옷 추가 구매" },
  { value: "30초", label: "가입부터 시작까지" },
] as const;

const DEFAULT_HEADLINE: ReactNode = (
  <>
    <span className="text-accent">내 옷장</span>에{" "}
    <span className="text-accent">100벌</span> 있는데,
    <br />
    매일 똑같은 옷만?
  </>
);

const DEFAULT_SUBHEADLINE: ReactNode = (
  <>
    있는 옷도 조합이 어려운 건, 입은 모습이 안 그려지기 때문이에요.
    <br />
    AI가 내 옷장에서 새 조합을 찾아, 마네킹이 입은 모습으로 보여드려요.
    <br />
    새 옷 사지 않고도, 매일 새 룩.
  </>
);

type HeroProps = {
  headline?: ReactNode;
  subheadline?: ReactNode;
};

export function Hero({
  headline = DEFAULT_HEADLINE,
  subheadline = DEFAULT_SUBHEADLINE,
}: HeroProps = {}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-warm to-background">
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-balance leading-[1.15]">
              {headline}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted text-pretty max-w-xl mx-auto lg:mx-0">
              {subheadline}
            </p>
            <div className="mt-8 flex flex-col items-center lg:items-start gap-3">
              <HeroStartButton />
              <p className="text-xs text-muted">
                지금 가입 시 코디 10개 무료 🎁
              </p>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {HERO_STATS.map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      {s.value}
                    </span>
                    <span className="mt-1 block text-xs text-muted leading-snug">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0">
            <MannequinRack />
          </div>
        </div>
      </div>
    </section>
  );
}

function MannequinRack() {
  return (
    <div className="mx-auto w-full max-w-[480px]">
      {/* 차별점 강조 배지 — 데스크탑/모바일 격자 공통 상단 1회 표시 */}
      <p className="mb-4 text-center">
        <span className="inline-flex items-center rounded-full bg-accent text-accent-foreground px-4 py-1.5 text-sm font-medium">
          🧥 새 옷 아니에요, 내 옷장 옷이에요
        </span>
      </p>

      {/* 데스크탑/태블릿 (md+): 4장 가로 정렬 + 미세 stagger — 옷걸이 줄 느낌 */}
      <ul
        aria-label="내 옷장 코디 4장 미리보기"
        className="hidden md:grid md:grid-cols-4 md:gap-3"
      >
        {HERO_VISUALS.map((v, i) => (
          <li
            key={v.src}
            className={`
              relative aspect-[5/13] rounded-2xl overflow-hidden
              border border-border bg-surface shadow-sm
              transition-transform duration-200 ease-out
              hover:-translate-y-1 hover:scale-[1.02]
              ${RACK_STAGGER[i]}
            `}
          >
            <Image
              src={v.src}
              alt={v.alt}
              fill
              priority={i === 0}
              sizes="120px"
              className="object-cover"
            />
          </li>
        ))}
      </ul>

      {/* 모바일 (< md): 가로 스크롤 + snap — 한 viewport에 ~2.3장 보임 */}
      <ul
        aria-label="내 옷장 코디 4장 미리보기"
        className="
          md:hidden
          flex overflow-x-auto snap-x snap-mandatory gap-3
          -mx-6 px-6 pb-2
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {HERO_VISUALS.map((v, i) => (
          <li key={v.src} className="flex-none w-[140px] snap-start">
            <div className="relative aspect-[5/13] rounded-2xl overflow-hidden border border-border bg-surface shadow-sm">
              <Image
                src={v.src}
                alt={v.alt}
                fill
                priority={i === 0}
                sizes="140px"
                className="object-cover"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
