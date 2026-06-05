"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { WaitlistForm } from "./sections/WaitlistForm";
import { track, type ModalEntry } from "@/lib/analytics";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // 어디서 모달을 열었는지(분석용 동행 정보, 단계 2의 modal_step_viewed에서 사용 예정).
  entry: ModalEntry;
};

type Step = "email" | "done";

export function EmailModal({ isOpen, onClose, entry }: Props) {
  const [step, setStep] = useState<Step>("email");

  // 모달이 열릴 때마다 step 초기화.
  useEffect(() => {
    if (isOpen) setStep("email");
  }, [isOpen]);

  // 단계 진입 추적: 모달이 열린 상태에서 step이 바뀔 때마다 modal_step_viewed 발사.
  useEffect(() => {
    if (!isOpen) return;
    track({ name: "modal_step_viewed", props: { step, entry } });
  }, [isOpen, step, entry]);

  // 닫기 통합 함수 — X 버튼 / 백드롭 / ESC 3경로 모두 이 함수 호출 → modal_closed 1곳 발사.
  function trackClose() {
    track({ name: "modal_closed", props: { step, entry } });
    onClose();
  }

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") trackClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- trackClose는 step/entry 변화에 자동 재바인딩
  }, [isOpen, step, entry]);

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

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) trackClose();
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
              출시 준비 중이에요
            </h2>
            <button
              type="button"
              onClick={trackClose}
              aria-label="닫기"
              className="-mt-1 -mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:bg-border"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          {step === "email" && (
            <div
              key="email"
              className="motion-safe:animate-[fade-in_200ms_ease-out]"
            >
              <p className="mt-3 text-sm leading-relaxed text-muted">
                출시되면 가장 먼저 알려드려요. 얼리버드 선물:{" "}
                <span className="font-semibold text-accent">
                  코디 30개 무료 🎁
                </span>
              </p>

              <div className="mt-5">
                <WaitlistForm
                  theme="light"
                  ctaText="선물 받고 기다리기"
                  pricingIntent="free"
                  onSuccess={() => setStep("done")}
                />
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted">
                스팸 없어요. 출시 알림 1번만 보내드려요.
              </p>
            </div>
          )}

          {step === "done" && <DoneBlock onClose={trackClose} />}
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
