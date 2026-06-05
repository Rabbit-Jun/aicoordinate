"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";

type Pair = {
  flat: string;
  mannequin: string;
  alt: string;
};

const PAIRS: ReadonlyArray<Pair> = [
  {
    flat: "/mockup/compare/flatlay-cardigan-cargo.png",
    mannequin: "/mockup/compare/mannequin-cardigan-cargo.jpg",
    alt: "블루 카디건 + 카고숏 코디",
  },
  {
    flat: "/mockup/compare/flatlay-shirt-skirt.png",
    mannequin: "/mockup/compare/mannequin-shirt-skirt.jpg",
    alt: "셔츠 + 스커트 코디",
  },
  {
    flat: "/mockup/compare/flatlay-cardigan-denim.png",
    mannequin: "/mockup/compare/mannequin-cardigan-denim.jpg",
    alt: "가디건 + 카고진 코디",
  },
  {
    flat: "/mockup/compare/flatlay-stripe-blazer.png",
    mannequin: "/mockup/compare/mannequin-stripe-blazer.jpg",
    alt: "스트라이프 + 블레이저 코디",
  },
];

type Row = {
  label: string;
  old: string;
  ours: string;
};

const ROWS: ReadonlyArray<Row> = [
  {
    label: "코디 표현",
    old: "쇼핑몰 모델 사진 그대로 (남/녀 뒤섞임)",
    ours: "하나의 마네킹이 일관되게 착장",
  },
  {
    label: "내 모습 반영",
    old: "남의 모델 사진뿐",
    ours: "마네킹을 나처럼 (체형·헤어·톤)",
  },

];

const INTERVAL_MS = 3000;

export function Comparison() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % PAIRS.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance text-foreground text-center leading-[1.2]">
          <span className="text-accent">같은 옷</span>인데,
          <br />
          이렇게 다릅니다
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted text-pretty max-w-xl mx-auto text-center">
          쇼핑몰에서 긁어온 코디는 남의 모델 사진이 뒤섞여요.
          <br />
          우리는 하나의 마네킹이 일관되게 입어드려요.
        </p>

        <div
          className="mt-12 grid grid-cols-2 gap-4 sm:gap-8 max-w-2xl mx-auto"
          aria-label="같은 코디를 기존 앱과 AI Coordinate가 표현하는 방식 비교"
        >
          <PhoneFrame
            label="기존 코디 앱"
            emphasis={false}
            screenBgClass="bg-white"
          >
            {PAIRS.map((pair, i) => (
              <CarouselImage
                key={pair.flat}
                src={pair.flat}
                alt={`기존 코디 앱: ${pair.alt} — 쇼핑몰 모델 사진이 섞인 flat lay`}
                active={i === activeIndex}
                priority={i === 0}
                fit="contain"
              />
            ))}
          </PhoneFrame>
          <PhoneFrame label="AI Coordinate" emphasis>
            {PAIRS.map((pair, i) => (
              <CarouselImage
                key={pair.mannequin}
                src={pair.mannequin}
                alt={`AI Coordinate: ${pair.alt} — 하나의 여성 마네킹이 일관되게 착장`}
                active={i === activeIndex}
                priority={i === 0}
              />
            ))}
          </PhoneFrame>
        </div>

        <Dots count={PAIRS.length} active={activeIndex} />

        <ComparisonTable />
      </div>
    </section>
  );
}

function PhoneFrame({
  label,
  emphasis,
  screenBgClass = "bg-background",
  children,
}: {
  label: string;
  emphasis: boolean;
  screenBgClass?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div
        className={
          "relative w-full rounded-[2rem] sm:rounded-[2.5rem] bg-foreground p-1.5 sm:p-2 shadow-xl " +
          (emphasis
            ? "ring-4 ring-accent shadow-[0_0_48px_-12px_var(--accent)]"
            : "")
        }
      >
        <div
          className={
            "relative aspect-[9/16] overflow-hidden rounded-[1.4rem] sm:rounded-[1.8rem] " +
            screenBgClass
          }
        >
          {children}
        </div>
      </div>
      <figcaption
        className={
          "text-xs sm:text-sm font-semibold " +
          (emphasis ? "text-accent" : "text-muted")
        }
      >
        {label}
      </figcaption>
    </figure>
  );
}

function CarouselImage({
  src,
  alt,
  active,
  priority,
  fit = "cover",
}: {
  src: string;
  alt: string;
  active: boolean;
  priority: boolean;
  fit?: "cover" | "contain";
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 640px) 320px, 45vw"
      priority={priority}
      aria-hidden={!active}
      className={
        (fit === "contain" ? "object-contain" : "object-cover") +
        " transition-opacity duration-700 " +
        (active ? "opacity-100" : "opacity-0")
      }
    />
  );
}

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <div
      className="mt-6 flex items-center justify-center gap-2"
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={
            "h-1.5 rounded-full transition-all duration-500 " +
            (i === active ? "w-6 bg-accent" : "w-1.5 bg-border")
          }
        />
      ))}
    </div>
  );
}

function ComparisonTable() {
  return (
    <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted w-24">
              항목
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted">
              기존 코디 앱
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-accent">
              AI Coordinate
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r, i) => (
            <tr
              key={r.label}
              className={i > 0 ? "border-t border-border" : ""}
            >
              <td className="px-4 py-4 text-xs text-muted align-top">
                {r.label}
              </td>
              <td className="px-4 py-4 align-top text-foreground/70 leading-relaxed">
                <div className="flex items-start gap-2">
                  <X
                    size={14}
                    className="mt-0.5 text-muted shrink-0"
                    aria-hidden
                  />
                  <span>{r.old}</span>
                </div>
              </td>
              <td className="px-4 py-4 align-top text-foreground font-medium leading-relaxed">
                <div className="flex items-start gap-2">
                  <Check
                    size={14}
                    className="mt-0.5 text-accent shrink-0"
                    aria-hidden
                  />
                  <span>{r.ours}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-accent text-accent-foreground px-6 py-4 text-center text-sm font-semibold">
        🎁 가입 시 코디 30개 무료
      </div>
    </div>
  );
}
