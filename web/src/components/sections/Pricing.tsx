"use client";

import { track } from "@/lib/analytics";
import { useEmailModal } from "../AppShell";

const FREE_FEATURES: ReadonlyArray<string> = [
  "가입 선물 코디 30개 즉시",
  "매달 무료 크레딧 1개",
  "내 옷장 100벌까지",
  "마네킹 코디 + 격자뷰",
];

export function Pricing() {
  const { openModal } = useEmailModal();

  function startFree() {
    track({ name: "plan_selected", props: { plan: "free", entry: "pricing" } });
    openModal("pricing");
  }

  return (
    <section id="waitlist" className="bg-surface-warm">
      <div className="mx-auto max-w-3xl px-6 pt-24 pb-32 sm:pt-28 sm:pb-36">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance text-foreground text-center">
          부담 없이 시작하세요
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted text-pretty max-w-xl mx-auto text-center">
          가입만 해도 코디 30개를 선물로 드려요.
        </p>

        <div className="mt-10 mx-auto max-w-md">
          <FreeCard onCta={startFree} />
        </div>

        <p className="mt-6 mx-auto max-w-xl text-center text-sm leading-relaxed text-muted">
          <span className="font-semibold text-foreground">
            코디가 더 필요하면?
          </span>{" "}
          크레딧 1개(코디 5개){" "}
          <span className="font-semibold text-foreground">500원</span>{" "}
          — 누구나 충전 가능
        </p>
      </div>
    </section>
  );
}

function FreeCard({ onCta }: { onCta: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white text-left shadow-md ring-1 ring-accent/30">
      <div aria-hidden className="h-1.5 bg-accent" />
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground">무료 요금제</h3>
        <ul className="mt-4 space-y-2.5">
          {FREE_FEATURES.map((f) => (
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
        <button
          type="button"
          data-track="plan_selected"
          onClick={onCta}
          className="
            mt-6 w-full inline-flex items-center justify-center
            rounded-full px-5 py-3 text-sm font-semibold
            bg-accent text-accent-foreground
            transition-transform duration-150 will-change-transform
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white
            hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
          "
        >
          무료로 시작하기
        </button>
      </div>
    </div>
  );
}
