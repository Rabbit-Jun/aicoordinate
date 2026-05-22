import { AppBadges } from "./AppBadges";

const FREE_FEATURES: ReadonlyArray<string> = [
  "가입 선물 코디 10개 즉시",
  "매달 무료 크레딧 1개 ",
  "내 옷장 100벌까지",
  "마네킹 코디 + 격자뷰",
];

const SUBSCRIPTION_EXTRAS: ReadonlyArray<string> = [
  "옷장 무제한",
  "매달 크레딧 1개 보너스",
  "광고 없음",
];

export function Pricing() {
  return (
    <section id="waitlist" className="bg-surface-warm">
      <div className="mx-auto max-w-3xl px-6 pt-24 pb-32 sm:pt-28 sm:pb-36">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance text-foreground text-center">
          부담 없이 시작하세요
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted text-pretty max-w-xl mx-auto text-center">
          가입만 해도 코디 10개를 선물로 드려요.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlanCard
            name="무료 요금제"
            price={null}
            highlighted
            features={FREE_FEATURES}
          />
          <PlanCard
            name="구독 요금제"
            price="월 3,900원"
            prefix="무료의 모든 기능 +"
            features={SUBSCRIPTION_EXTRAS}
          />
        </div>

        {/* 크레딧 공통 안내 — 무료·구독 상관없이 누구나 충전 가능. 구독 카드 안에 넣지 말 것. */}
        <p className="mt-6 mx-auto max-w-xl text-center text-sm leading-relaxed text-muted">
          <span className="font-semibold text-foreground">
            코디가 더 필요하면?
          </span>{" "}
          크레딧 1개(코디 5개){" "}
          <span className="font-semibold text-foreground">500원</span>{" "}
          — 무료·구독 상관없이 누구나 충전
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-sm font-semibold text-foreground">
            지금 시작하면 코디 10개 무료 🎁
          </p>
          <AppBadges />
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  name,
  price,
  highlighted = false,
  prefix,
  features,
}: {
  name: string;
  price: string | null;
  highlighted?: boolean;
  prefix?: string;
  features: ReadonlyArray<string>;
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl bg-white text-left
        ${
          highlighted
            ? "shadow-md ring-1 ring-accent/30"
            : "shadow-sm border border-border"
        }
      `}
    >
      <div
        aria-hidden
        className={`h-1.5 ${highlighted ? "bg-accent" : "bg-border"}`}
      />
      <div className="p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-bold text-foreground">{name}</h3>
          {price && (
            <p className="text-sm font-semibold text-foreground">{price}</p>
          )}
        </div>
        {prefix && (
          <p className="mt-3 text-sm font-semibold text-accent">{prefix}</p>
        )}
        <ul className={`${prefix ? "mt-3" : "mt-4"} space-y-2.5`}>
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <span aria-hidden className="mt-0.5 text-accent shrink-0">
                ✓
              </span>
              <span className="leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
