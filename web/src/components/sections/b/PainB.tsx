import type { ReactNode } from "react";

export type PainCard = {
  lead: string;
  body: string;
  tone: "yellow" | "blue" | "green";
};

// 기본 카피 = /b. /a에서는 props로 override.
const DEFAULT_HEADLINE: ReactNode = "매일 아침 옷 걱정 쉽지 않죠?";

// FIXES 7번: c-yellow/c-blue/c-green → globals.css에 surface-yellow/blue/green 토큰 정식 등록 후 매핑.
const DEFAULT_CARDS: ReadonlyArray<PainCard> = [
  {
    lead: "“옷장에 옷은 많은데, 결국 늘 입던 그 조합”",
    body: "이제는 새로운 코디를 입고 싶어요ㅠㅠ",
    tone: "yellow",
  },
  {
    lead: "“옷장 앞에서 한참 고민하다 시간만 흘려보낸 적 있죠?”",
    body: "잘 어울릴줄 알았는데 입고보니 전체적인 무드가 미묘한 것 같아…",
    tone: "blue",
  },
  {
    lead: "“전체적인 무드에 맞게 입었는지 걱정 되시나요?”",
    body: "캐주얼, 포멀, 클래식, 빈티지… 하나의 분위기로 잘 맞춰 입었는지 걱정이에요ㅠ.ㅜ",
    tone: "green",
  },
];

const TONE_BG: Record<PainCard["tone"], string> = {
  yellow: "bg-surface-yellow",
  blue: "bg-surface-blue",
  green: "bg-surface-green",
};

type Props = {
  headline?: ReactNode;
  cards?: ReadonlyArray<PainCard>;
};

export function PainB({
  headline = DEFAULT_HEADLINE,
  cards = DEFAULT_CARDS,
}: Props = {}) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance text-foreground text-center">
          {headline}
        </h2>
        <ul className="mt-10 flex flex-col gap-4">
          {cards.map((c) => (
            <li
              key={c.lead}
              className={`rounded-2xl border border-border p-5 sm:p-6 ${TONE_BG[c.tone]}`}
            >
              <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                {c.lead}
              </p>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
