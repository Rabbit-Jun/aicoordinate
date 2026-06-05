"use client";

import { track } from "@/lib/analytics";
import { useEmailModal } from "@/components/AppShell";

export function FinalCtaB() {
  const { openModal } = useEmailModal();

  function handleClick() {
    track({ name: "plan_selected", props: { plan: "free", entry: "final_cta" } });
    openModal("final_cta");
  }

  return (
    <section id="waitlist" className="bg-surface-warm">
      <div className="mx-auto max-w-3xl px-6 pt-20 pb-24 sm:pt-24 sm:pb-28 text-center">
        <p className="text-sm font-semibold text-foreground mb-4">
          지금 시작하면 코디 30개 무료 🎁
        </p>
        <button
          type="button"
          data-track="plan_selected"
          onClick={handleClick}
          className="
            w-full max-w-sm mx-auto
            inline-flex items-center justify-center
            rounded-full bg-accent text-accent-foreground
            px-8 py-4 text-base font-semibold
            transition-transform duration-150 will-change-transform
            hover:-translate-y-0.5
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-warm
            active:translate-y-0 active:scale-[0.98]
            shadow-md
          "
        >
          무료로 시작하기
        </button>
      </div>
    </section>
  );
}
