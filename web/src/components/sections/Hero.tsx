import Image from "next/image";
import { HeroCTA } from "./HeroCTA";
import type { Variant } from "@/lib/variant";

type HeroStat = { value: string; label: string };
type HeroContent = {
  badge: string;
  headline: { before: string; highlight: string; after: string };
  subheadline: string;
  ctaText: string;
  ctaSubtext: string;
  stats: readonly HeroStat[];
};

const HERO_CONTENT: Record<Variant, HeroContent> = {
  A: {
    badge: "🎨 베타 대기열 모집 중",
    headline: {
      before: "옷장에 ",
      highlight: "100벌",
      after: " 있는데,\n매일 똑같은 옷만 입고 있나요?",
    },
    subheadline:
      "있는 옷도 조합이 어려워서 결국 어제 입던 옷.\nAI가 내 옷장에서 한 번도 안 해본 새 조합을 찾아드려요.\n새 옷 사지 않고도, 매일 새 룩.",
    ctaText: "내 옷장 코디 받아보기",
    ctaSubtext: "베타 무료 · 가입 30초 · 카드 필요 없음",
    stats: [
      { value: "3가지", label: "매일 받는 새 조합 추천" },
      { value: "0원", label: "옷 추가 구매" },
      { value: "30초", label: "가입부터 시작까지" },
    ],
  },
  B: {
    badge: "🎨 베타 대기열 모집 중",
    headline: {
      before: "",
      highlight: "모델 사진",
      after: " 보고 샀다가,\n후회한 적 있죠?",
    },
    subheadline:
      "모델 핏은 모델이 입어서 예쁜 거예요.\n내 키, 내 체형, 내 비율에 옷을 입혀보면 완전히 다른 모습.\n사진 한 장이면 AI가 내 모습으로 미리 보여드립니다.",
    ctaText: "내 모습으로 입어보기",
    ctaSubtext: "베타 무료 · 사진 1장 · 1분 안에 결과",
    stats: [
      { value: "1장", label: "필요한 내 사진" },
      { value: "1분", label: "가입부터 결과까지" },
      { value: "0원", label: "사기 전 미리보기" },
    ],
  },
};

export function Hero({ variant }: { variant: Variant }) {
  const content = HERO_CONTENT[variant];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-warm to-background">
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center text-sm font-medium text-accent">
              {content.badge}
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-balance whitespace-pre-line leading-[1.15]">
              {content.headline.before}
              <span className="text-accent">{content.headline.highlight}</span>
              {content.headline.after}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted text-pretty whitespace-pre-line max-w-xl mx-auto lg:mx-0">
              {content.subheadline}
            </p>
            <div className="mt-8 flex flex-col items-center lg:items-start gap-2.5">
              <HeroCTA targetId="waitlist">{content.ctaText}</HeroCTA>
              <p className="text-xs text-muted">{content.ctaSubtext}</p>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {content.stats.map((s) => (
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
            {variant === "A" ? <WardrobeVisual /> : <FitPreviewVisual />}
          </div>
        </div>
      </div>
    </section>
  );
}

const WARDROBE_ITEMS = [
  { src: "/mockup/jaket.png", alt: "재킷" },
  { src: "/mockup/navy-blouse.png", alt: "네이비 블라우스" },
  { src: "/mockup/tweed-jaket.png", alt: "트위드 재킷" },
  { src: "/mockup/tee.png", alt: "티셔츠" },
  { src: "/mockup/navy-trousers.png", alt: "네이비 트라우저" },
  { src: "/mockup/jeen.png", alt: "진" },
  { src: "/mockup/skarf.png", alt: "스카프" },
] as const;

function WardrobeVisual() {
  return (
    <div className="relative rounded-3xl border border-border bg-surface p-4 sm:p-5 shadow-sm">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {WARDROBE_ITEMS.map((item) => (
          <div
            key={item.src}
            className="relative aspect-square rounded-xl bg-background overflow-hidden"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 140px, 30vw"
              className="object-contain p-2"
            />
          </div>
        ))}
        <div
          aria-hidden
          className="relative aspect-square rounded-xl bg-surface-warm flex flex-col items-center justify-center text-center px-2 gap-0.5"
        >
          <span className="text-base font-bold text-accent leading-none">
            +90벌
          </span>
          <span className="text-[10px] text-muted leading-tight">
            잊고 있던 옷
          </span>
        </div>
      </div>
    </div>
  );
}

function FitPreviewVisual() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <ComparePane
        src="/mockup/model-before.jpg"
        alt="합성 전 사용자 사진"
        label="내 사진"
      />
      <ComparePane
        src="/mockup/model-after.png"
        alt="AI가 합성한 결과 사진"
        label="AI 미리보기"
        highlight
      />
    </div>
  );
}

function ComparePane({
  src,
  alt,
  label,
  highlight,
}: {
  src: string;
  alt: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <figure className="flex flex-col gap-2">
      <div
        className={`relative aspect-[3/4] rounded-2xl overflow-hidden border ${
          highlight
            ? "border-accent/40 ring-2 ring-accent/20"
            : "border-border"
        } bg-surface`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 240px, 45vw"
          className="object-cover"
        />
      </div>
      <figcaption
        className={`text-xs font-medium text-center ${
          highlight ? "text-accent" : "text-muted"
        }`}
      >
        {label}
      </figcaption>
    </figure>
  );
}
