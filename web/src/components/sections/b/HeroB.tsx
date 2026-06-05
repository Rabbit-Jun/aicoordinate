import type { ReactNode } from "react";
import { HeroBStartButton } from "./HeroBStartButton";

// 기본 카피 = /b. /a에서는 props로 override.
const DEFAULT_HEADLINE: ReactNode = (
  <>
    옷장에 옷은 많은데,
    <br />
    <span className="text-accent">상상이 안 가서 또 그 조합?</span>
  </>
);

const DEFAULT_SUB: ReactNode = (
  <>
    당신의 비서가 옷장 속 옷으로,
    <br />
    매일 새롭게 코디해 드립니다.
  </>
);

type Props = {
  headline?: ReactNode;
  sub?: ReactNode;
};

export function HeroB({
  headline = DEFAULT_HEADLINE,
  sub = DEFAULT_SUB,
}: Props = {}) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-3xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-[1.2] text-foreground">
          {headline}
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted text-pretty max-w-xl mx-auto">
          {sub}
        </p>
        <div className="mt-8 flex justify-center">
          <HeroBStartButton />
        </div>
      </div>
    </section>
  );
}
