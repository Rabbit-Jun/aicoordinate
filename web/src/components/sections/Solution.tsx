import Image from "next/image";
import { Check } from "lucide-react";

type Item = { src: string; alt: string };
type Combo = { id: number; items: readonly Item[] };

const SOLUTION_CONTENT = {
  pillLabel: "핵심 기능 ①",
  title: {
    before: "내 옷장 사진을 찍기만 하면,\n",
    highlight: "한 번도 안 해본 조합",
    after: "이 나옵니다",
  },
  description:
    "AI가 옷 하나하나를 인식하고, 내 체형·퍼스널 컬러·오늘 날씨를 종합해서 어울리는 조합 3가지를 찾아드려요.\n구석에 처박혀 있던 옷도 빠짐없이 활용합니다.",
  bullets: [
    "옷 사진만 올리면 AI가 자동으로 옷장 정리 (카테고리·색·스타일·계절)",
    "오늘 날씨 + 약속 자리에 맞춰 3가지 조합 자동 추천",
    "마음에 안 들면 다시. 옷장 안에서 무한 조합",
  ],
} as const;

const COMBOS: readonly Combo[] = [
  {
    id: 1,
    items: [
      { src: "/mockup/tweed-jaket.png", alt: "트위드 재킷" },
      { src: "/mockup/navy-blouse.png", alt: "네이비 블라우스" },
      { src: "/mockup/navy-trousers.png", alt: "네이비 트라우저" },
    ],
  },
  {
    id: 2,
    items: [
      { src: "/mockup/jaket.png", alt: "재킷" },
      { src: "/mockup/tee.png", alt: "티셔츠" },
      { src: "/mockup/jeen.png", alt: "진" },
    ],
  },
  {
    id: 3,
    items: [
      { src: "/mockup/jaket.png", alt: "재킷" },
      { src: "/mockup/skarf.png", alt: "스카프" },
      { src: "/mockup/navy-trousers.png", alt: "네이비 트라우저" },
    ],
  },
];

export function Solution() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <article className="order-2 lg:order-1">
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              {SOLUTION_CONTENT.pillLabel}
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-balance whitespace-pre-line leading-[1.2]">
              {SOLUTION_CONTENT.title.before}
              <span className="text-accent">
                {SOLUTION_CONTENT.title.highlight}
              </span>
              {SOLUTION_CONTENT.title.after}
            </h2>
            <p className="mt-5 text-base sm:text-lg text-muted text-pretty whitespace-pre-line">
              {SOLUTION_CONTENT.description}
            </p>
            <ul className="mt-7 space-y-3">
              {SOLUTION_CONTENT.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 mt-0.5 shrink-0">
                    <Check size={14} className="text-accent" aria-hidden />
                  </span>
                  <span className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <figure className="order-1 lg:order-2 min-w-0 m-0">
            <PhoneMockup />
            <figcaption className="sr-only">
              AI가 추천한 오늘의 옷장 조합 3가지 미리보기
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      {/* Outer device frame — 두꺼운 베젤로 입체감 (shadow 없이) */}
      <div className="rounded-[2.75rem] bg-foreground p-2.5">
        {/* Inner screen */}
        <div className="rounded-[2.25rem] bg-surface aspect-[9/16] flex flex-col overflow-hidden">
          {/* Notch */}
          <div className="flex justify-center pt-2.5">
            <div
              aria-hidden
              className="h-1.5 w-16 rounded-full bg-foreground/30"
            />
          </div>
          {/* Header */}
          <div className="px-4 pt-3 pb-3 border-b border-border">
            <p className="text-[10px] font-medium text-muted">오늘 · 18°C 맑음</p>
            <p className="mt-0.5 text-sm font-bold text-foreground">
              오늘의 추천
            </p>
          </div>
          {/* Combos */}
          <div className="flex-1 p-3 flex flex-col gap-2.5 min-h-0">
            {COMBOS.map((c) => (
              <ComboCard key={c.id} combo={c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComboCard({ combo }: { combo: Combo }) {
  return (
    <div className="rounded-xl border border-border bg-background p-2.5">
      <div className="flex items-center justify-between text-[10px] font-semibold mb-1.5">
        <span className="text-accent">조합 {combo.id}</span>
        <span className="text-muted font-normal">AI 추천</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {combo.items.map((item, idx) => (
          <div
            key={`${combo.id}-${idx}-${item.src}`}
            className="relative aspect-square rounded-md bg-surface overflow-hidden"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="64px"
              className="object-contain p-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
