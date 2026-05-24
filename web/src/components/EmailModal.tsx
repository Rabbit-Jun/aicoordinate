"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { track } from "@/lib/analytics";
import { WaitlistForm } from "./sections/WaitlistForm";
import type { PlanChoice } from "./AppShell";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialPlan: PlanChoice | null;
};

type Step = "plan" | "email" | "done";

const PLAN_OPTIONS: ReadonlyArray<{
  value: PlanChoice;
  title: string;
  subtitle: string;
  highlighted: boolean;
}> = [
  {
    value: "free",
    title: "무료로 시작하기",
    subtitle: "월 크레딧 1개 · 옷장 100개",
    highlighted: true,
  },
  {
    value: "subscribe",
    title: "구독으로 시작하기",
    subtitle: "월 3,900원 · 옷장 무제한 · 월 크레딧 2개",
    highlighted: false,
  },
];

export function EmailModal({ isOpen, onClose, initialPlan }: Props) {
  const [step, setStep] = useState<Step>("plan");
  const [plan, setPlan] = useState<PlanChoice | null>(initialPlan);

  // 모달이 열릴 때마다 상태 초기화.
  // initialPlan이 있으면 플랜 선택 단계 건너뛰고 바로 이메일 단계로.
  useEffect(() => {
    if (!isOpen) return;
    if (initialPlan) {
      setPlan(initialPlan);
      setStep("email");
    } else {
      setPlan(null);
      setStep("plan");
    }
  }, [isOpen, initialPlan]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // 모달 열린 동안 body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handlePlanSelect(p: PlanChoice) {
    track({ name: "plan_selected", props: { plan: p } });
    setPlan(p);
    setStep("email");
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 motion-safe:animate-[fade-in_180ms_ease-out]"
    >
      <div className="w-full sm:max-w-md bg-white text-foreground rounded-t-2xl sm:rounded-2xl shadow-xl motion-safe:animate-[fade-in_240ms_ease-out]">
        <div className="h-1.5 bg-accent rounded-t-2xl" aria-hidden />

        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="email-modal-title"
              className="text-xl sm:text-2xl font-bold tracking-tight"
            >
              {step === "plan"
                ? "어떻게 시작하실래요?"
                : "출시 준비 중이에요"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="-mt-1 -mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:bg-border"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          {step === "plan" && (
            <div
              key="plan"
              className="motion-safe:animate-[fade-in_200ms_ease-out]"
            >
              <p className="mt-3 text-sm leading-relaxed text-muted">
                두 플랜 다 부담 없이 시작할 수 있어요. 어떤 플랜으로 출시
                안내를 받으실래요?
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                {PLAN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    data-track="plan_selected"
                    onClick={() => handlePlanSelect(opt.value)}
                    className={`
                      w-full rounded-2xl px-5 py-3.5 text-left
                      transition-transform duration-150 will-change-transform
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white
                      hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
                      ${
                        opt.highlighted
                          ? "bg-accent text-accent-foreground"
                          : "border border-border bg-background text-foreground hover:border-accent hover:text-accent"
                      }
                    `}
                  >
                    <span className="block text-base font-semibold">
                      {opt.title}
                    </span>
                    <span
                      className={
                        "mt-0.5 block text-xs " +
                        (opt.highlighted ? "opacity-90" : "text-muted")
                      }
                    >
                      {opt.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "email" && (
            <div
              key="email"
              className="motion-safe:animate-[fade-in_200ms_ease-out]"
            >
              <p className="mt-3 text-sm leading-relaxed text-muted">
                곧 출시 예정이에요! 지금 이메일을 남겨두시면 출시할 때 가장
                먼저 알려드리고{" "}
                <span className="font-semibold text-accent">
                  코디 10개를 선물
                </span>
                로 드려요.
              </p>

              <div className="mt-5">
                <WaitlistForm
                  theme="light"
                  ctaText="등록하고 선물 받기"
                  pricingIntent={plan}
                  onSuccess={() => setStep("done")}
                />
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-muted">
                ⚠️ 앱은 곧 출시 예정이에요. 등록하시면 출시할 때 안내 메일을
                1번 보내드려요.
              </p>
            </div>
          )}

          {step === "done" && <DoneBlock onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

function DoneBlock({ onClose }: { onClose: () => void }) {
  return (
    <div className="mt-4 text-center">
      <p className="text-3xl" aria-hidden>
        🎉
      </p>
      <p className="mt-2 text-base font-semibold">등록 완료!</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        출시되면 가장 먼저 알려드릴게요.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-semibold transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:opacity-80"
      >
        닫기
      </button>
    </div>
  );
}
