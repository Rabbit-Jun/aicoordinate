"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { track } from "@/lib/analytics";
import { WaitlistForm } from "./sections/WaitlistForm";

type Platform = "ios" | "android" | null;
type PollChoice = "yes" | "maybe" | "no";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  platform: Platform;
};

const POLL_OPTIONS: ReadonlyArray<{ choice: PollChoice; label: string }> = [
  { choice: "yes", label: "네, 그 정도면 써볼래요" },
  { choice: "maybe", label: "무료 기능만 써볼 것 같아요" },
  { choice: "no", label: "잘 모르겠어요" },
];

export function EmailModal({ isOpen, onClose, platform }: Props) {
  const [pollChoice, setPollChoice] = useState<PollChoice | null>(null);
  const [done, setDone] = useState(false);

  // 모달이 열릴 때마다 내부 상태 초기화 (이전 응답이 남아 다음 사용자 신호와 섞이지 않도록).
  useEffect(() => {
    if (isOpen) {
      setPollChoice(null);
      setDone(false);
    }
  }, [isOpen]);

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

  function handleVote(choice: PollChoice) {
    track({ name: "pricing_poll_voted", props: { choice } });
    setPollChoice(choice);
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
      className="
        fixed inset-0 z-50
        flex items-end sm:items-center justify-center
        bg-black/55
        motion-safe:animate-[fade-in_180ms_ease-out]
      "
    >
      <div
        className="
          w-full sm:max-w-md
          bg-white text-foreground
          rounded-t-2xl sm:rounded-2xl
          shadow-xl
          motion-safe:animate-[fade-in_240ms_ease-out]
        "
      >
        {/* 상단 코랄 액센트 바 */}
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
              onClick={onClose}
              aria-label="닫기"
              className="
                -mt-1 -mr-1 inline-flex h-9 w-9 items-center justify-center
                rounded-full text-muted
                transition-colors duration-150
                hover:bg-background hover:text-foreground
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
                active:bg-border
              "
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          {done ? (
            <DoneBlock onClose={onClose} />
          ) : (
            <>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                곧 출시 예정이에요! 지금 이메일을 남겨두시면 출시할 때 가장 먼저
                알려드리고{" "}
                <span className="font-semibold text-accent">
                  코디 10개를 선물
                </span>
                로 드려요.
              </p>

              <div className="mt-5">
                <p className="text-sm font-semibold">
                  출시되면 크레딧 1개(코디 5개) 500원에 써보실 의향이 있나요?
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {POLL_OPTIONS.map((opt) => {
                    const active = pollChoice === opt.choice;
                    return (
                      <button
                        key={opt.choice}
                        type="button"
                        data-track="pricing_poll_voted"
                        onClick={() => handleVote(opt.choice)}
                        aria-pressed={active}
                        className={`
                          w-full rounded-full px-5 py-2.5
                          text-sm font-medium text-left
                          border
                          transition-transform duration-150 will-change-transform
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white
                          active:translate-y-0 active:scale-[0.98]
                          ${
                            active
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <WaitlistForm
                  theme="light"
                  ctaText="선물 받고 등록하기"
                  pricingIntent={pollChoice}
                  devicePref={platform}
                  onSuccess={() => setDone(true)}
                />
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-muted">
                ⚠️ 앱은 곧 출시 예정이에요. 등록하시면 출시할 때 안내 메일을
                1번 보내드려요.
              </p>
            </>
          )}
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
        className="
          mt-5 inline-flex items-center justify-center
          rounded-full bg-foreground text-background
          px-5 py-2.5 text-sm font-semibold
          transition-opacity duration-150
          hover:opacity-90
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
          active:opacity-80
        "
      >
        닫기
      </button>
    </div>
  );
}
